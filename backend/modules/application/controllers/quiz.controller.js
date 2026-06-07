const { Quiz, Question, QuestionOption, QuizAttempt, UserAnswer, Grade, Subject, GradeHasSubject, User, UserLevel } = require("../../../models/associations");
const xpManager = require("../../../managers/xpManager");
const badgeManager = require("../../../managers/badgeManager");


/**
 * Resolves absolute URL for images if path is relative.
 */
const getFullImageUrl = (imageUrl) => {
	if (!imageUrl) return null;
	if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
		return imageUrl;
	}
	const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
	return `${baseUrl}/api/v1/uploads${imageUrl}`;
};

/**
 * Get list of quizzes, available grades, and subjects from DB.
 */
const getQuizzes = async (req, res, next) => {
	try {
		const userId = req.userId;

		if (!userId) {
			return res.status(401).json({
				status: "fail",
				message: "Unauthorized: User ID not found",
			});
		}

		// Fetch all quizzes with associations
		const quizzes = await Quiz.findAll({
			include: [
				{
					model: GradeHasSubject,
					as: "gradeHasSubject",
					include: [
						{ model: Grade, as: "grade", attributes: ["id", "grade_name"] },
						{ model: Subject, as: "subject", attributes: ["id", "subject_name"] },
					],
				},
				{
					model: Question,
					as: "questions",
					attributes: ["id"],
				},
			],
			order: [["created_at", "DESC"]],
		});

		// Fetch completed quiz IDs for current user
		const completedAttempts = await QuizAttempt.findAll({
			where: { user_id: userId, is_completed: true },
			attributes: ["quiz_id"],
		});
		const completedQuizIds = new Set(completedAttempts.map((a) => a.quiz_id));

		// Fetch all grades and subjects for filters
		const dbGrades = await Grade.findAll({ order: [["grade_name", "ASC"]] });
		const dbSubjects = await Subject.findAll({ order: [["subject_name", "ASC"]] });

		// Format quizzes
		const formattedQuizzes = quizzes.map((quiz) => {
			const qCount = quiz.questions?.length || 0;
			const totalXp = qCount * 2; // Questions count X 2xp
			const timeLimit = quiz.time_limit || (qCount * 60 + 120);
			const isCompleted = completedQuizIds.has(quiz.id);

			return {
				id: quiz.id,
				title: quiz.quiz_name,
				description: quiz.description,
				subject: quiz.gradeHasSubject?.subject?.subject_name || "Other",
				grade: quiz.gradeHasSubject?.grade?.grade_name || "Unknown",
				reward: `+${totalXp} XP`,
				timeLimit: timeLimit,
				progress: isCompleted ? 100 : 0,
				progressLabel: isCompleted ? "Completed" : "New",
				buttonLabel: isCompleted ? "Play Again" : "Start Quiz",
				tagVariant: isCompleted ? "success" : "primary",
				status: isCompleted ? "completed" : "available",
			};
		});

		return res.status(200).json({
			status: "success",
			data: {
				quizzes: formattedQuizzes,
				grades: ["All Grades", ...dbGrades.map((g) => g.grade_name)],
				subjects: ["All Subjects", ...dbSubjects.map((s) => s.subject_name)],
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Get details of a single quiz including sorted questions and option tags.
 */
const getQuizById = async (req, res, next) => {
	try {
		const { quizId } = req.params;

		if (!quizId) {
			return res.status(400).json({
				status: "fail",
				message: "Quiz ID is required",
			});
		}

		const quiz = await Quiz.findByPk(quizId, {
			include: [
				{
					model: GradeHasSubject,
					as: "gradeHasSubject",
					include: [
						{ model: Grade, as: "grade", attributes: ["id", "grade_name"] },
						{ model: Subject, as: "subject", attributes: ["id", "subject_name"] },
					],
				},
				{
					model: Question,
					as: "questions",
					include: [
						{
							model: QuestionOption,
							as: "options",
						},
					],
				},
			],
		});

		if (!quiz) {
			return res.status(404).json({
				status: "fail",
				message: "Quiz not found",
			});
		}

		// Calculate time limit if null
		const questionsCount = quiz.questions?.length || 0;
		const timeLimit = quiz.time_limit || (questionsCount * 60 + 120);

		// Format questions and options
		// Sort questions by question_order
		const sortedQuestions = (quiz.questions || []).sort((a, b) => a.question_order - b.question_order);

		const formattedQuestions = sortedQuestions.map((q) => {
			// Sort options by option_order
			const sortedOptions = (q.options || []).sort((a, b) => a.option_order - b.option_order);
			const formattedOptions = sortedOptions.map((opt, index) => ({
				id: opt.id,
				letter: ["A", "B", "C", "D"][index] || String(index + 1),
				label: opt.option_text,
			}));

			return {
				questionId: q.id,
				grade: quiz.gradeHasSubject?.grade?.grade_name || "Unknown",
				subject: quiz.gradeHasSubject?.subject?.subject_name || "Other",
				text: q.question_text,
				image: getFullImageUrl(q.image_url),
				options: formattedOptions,
			};
		});

		return res.status(200).json({
			status: "success",
			data: {
				id: quiz.id,
				quizTitle: quiz.quiz_name,
				timeLimit: timeLimit,
				questions: formattedQuestions,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Evaluate and record a quiz attempt. Updates user XP and handles leveling up.
 */
const submitQuiz = async (req, res, next) => {
	try {
		const userId = req.userId;
		const { quizId } = req.params;
		const { answers, elapsedSeconds } = req.body; // answers: { questionId: selectedOptionId }

		if (!userId) {
			return res.status(401).json({
				status: "fail",
				message: "Unauthorized: User ID not found",
			});
		}

		const quiz = await Quiz.findByPk(quizId, {
			include: [
				{
					model: Question,
					as: "questions",
					include: [{ model: QuestionOption, as: "options" }],
				},
			],
		});

		if (!quiz) {
			return res.status(404).json({
				status: "fail",
				message: "Quiz not found",
			});
		}

		const questions = quiz.questions || [];
		const totalQuestions = questions.length;
		let correctAnswers = 0;

		const userAnswersToSave = [];

		// Grade the user's answers
		for (const q of questions) {
			const selectedOptionId = answers[q.id];
			const correctOption = (q.options || []).find((opt) => opt.is_correct === true);

			const isCorrect = correctOption && Number(selectedOptionId) === Number(correctOption.id);
			if (isCorrect) {
				correctAnswers += 1;
			}

			userAnswersToSave.push({
				question_id: q.id,
				selected_option_id: selectedOptionId || null,
				is_correct: isCorrect,
				xp_gained: isCorrect ? 2 : 0,
			});
		}

		const accuracy = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

		// Calculate speed category based on elapsed time vs time limit
		const limit = quiz.time_limit || (totalQuestions * 60 + 120);
		let speed = "Average";
		if (elapsedSeconds < limit * 0.4) {
			speed = "Lightning Fast";
		} else if (elapsedSeconds < limit * 0.7) {
			speed = "Quick Thinker";
		}

		// Check for existing attempt
		const existingAttempt = await QuizAttempt.findOne({
			where: { user_id: userId, quiz_id: quiz.id },
		});

		let xpGained = 0;
		let attempt;

		if (existingAttempt) {
			const previousCorrect = existingAttempt.correct_answers;
			if (correctAnswers > previousCorrect) {
				xpGained = (correctAnswers - previousCorrect) * 2;
			}

			// Update the existing attempt with the highest values
			existingAttempt.score = Math.max(existingAttempt.score, accuracy);
			existingAttempt.correct_answers = Math.max(existingAttempt.correct_answers, correctAnswers);
			existingAttempt.xp_gained = Math.max(existingAttempt.xp_gained, correctAnswers * 2);
			existingAttempt.completed_at = new Date();
			await existingAttempt.save();
			attempt = existingAttempt;

			// Update or create user answers
			for (const ans of userAnswersToSave) {
				if (ans.selected_option_id) {
					const [userAnswerRecord, created] = await UserAnswer.findOrCreate({
						where: {
							quiz_attempt_id: attempt.id,
							question_id: ans.question_id,
						},
						defaults: {
							selected_option_id: ans.selected_option_id,
							is_correct: ans.is_correct,
							xp_gained: ans.xp_gained,
							answered_at: new Date(),
						},
					});

					if (!created) {
						userAnswerRecord.selected_option_id = ans.selected_option_id;
						userAnswerRecord.is_correct = ans.is_correct;
						userAnswerRecord.xp_gained = ans.xp_gained;
						userAnswerRecord.answered_at = new Date();
						await userAnswerRecord.save();
					}
				}
			}
		} else {
			xpGained = correctAnswers * 2;

			// Save new Quiz Attempt
			attempt = await QuizAttempt.create({
				user_id: userId,
				quiz_id: quiz.id,
				score: accuracy,
				total_questions: totalQuestions,
				correct_answers: correctAnswers,
				xp_gained: xpGained,
				is_completed: true,
				started_at: new Date(Date.now() - elapsedSeconds * 1000),
				completed_at: new Date(),
			});

			// Save each userAnswer record associated with the attempt
			for (const ans of userAnswersToSave) {
				if (ans.selected_option_id) {
					await UserAnswer.create({
						quiz_attempt_id: attempt.id,
						question_id: ans.question_id,
						selected_option_id: ans.selected_option_id,
						is_correct: ans.is_correct,
						xp_gained: ans.xp_gained,
					});
				}
			}
		}

		// Update user XP & Level
		const xpResult = await xpManager.updateUserXPAndLevel(userId, xpGained);

		// Check and award badges
		const newlyEarnedBadges = await badgeManager.checkAndAwardBadges(userId);

		// Format elapsed time (M:SS)
		const minutes = Math.floor(elapsedSeconds / 60);
		const seconds = elapsedSeconds % 60;
		const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

		return res.status(200).json({
			status: "success",
			data: {
				correct: correctAnswers,
				total: totalQuestions,
				time: formattedTime,
				xp: xpGained,
				accuracy: accuracy,
				speed: speed,
				quizTitle: quiz.quiz_name,
				positionsUp: correctAnswers * 3, // mock positions gained for styling
				leveledUp: xpResult.leveledUp,
				newLevelName: xpResult.currentLevel?.level_name,
				newLevelNo: xpResult.currentLevel?.level_no,
				newlyEarnedBadges: newlyEarnedBadges || [],
			},
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getQuizzes,
	getQuizById,
	submitQuiz,
};
