const { Quiz, Question, QuestionOption, Grade, Subject, GradeHasSubject } = require("../../../models/associations");
const sequelize = require("../../../config/db.config");

/**
 * Get all quizzes with grade, subject, questions, and option details for admin review.
 */
const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.findAll({
      include: [
        {
          model: GradeHasSubject,
          as: "gradeHasSubject",
          include: [
            { model: Grade, as: "grade", attributes: ["id", "grade_name"] },
            { model: Subject, as: "subject", attributes: ["id", "subject_name"] },
          ]
        },
        {
          model: Question,
          as: "questions",
          include: [
            { model: QuestionOption, as: "options" }
          ]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    const formatted = quizzes.map(q => ({
      id: q.id,
      title: q.quiz_name,
      description: q.description,
      time_limit: q.time_limit,
      questions_to_show: q.questions_to_show,
      grade: q.gradeHasSubject?.grade?.grade_name || "Unknown",
      subject: q.gradeHasSubject?.subject?.subject_name || "Other",
      questionsCount: q.questions?.length || 0,
      created_at: q.created_at,
      questions: q.questions?.map(question => ({
        id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        xp_reward: question.xp_reward,
        image_url: question.image_url,
        hint: question.hint,
        options: question.options?.map(opt => ({
          id: opt.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          explanation: opt.explanation
        }))
      }))
    }));

    // Also get all available grades and subjects to populate form dropdowns
    const grades = await Grade.findAll({ order: [["grade_name", "ASC"]] });
    const subjects = await Subject.findAll({ order: [["subject_name", "ASC"]] });

    return res.status(200).json({
      status: "success",
      data: {
        quizzes: formatted,
        grades: grades.map(g => g.grade_name),
        subjects: subjects.map(s => s.subject_name),
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Quiz with its questions and option choices in a transaction.
 */
const createQuiz = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, time_limit, questions_to_show, grade, subject, questions } = req.body || {};

    if (!title || !grade || !subject) {
      return res.status(400).json({
        status: "fail",
        message: "Title, grade, and subject are required fields",
      });
    }

    // Find or create Grade
    let dbGrade = await Grade.findOne({ where: { grade_name: grade } });
    if (!dbGrade) {
      dbGrade = await Grade.create({ grade_name: grade }, { transaction: t });
    }

    // Find or create Subject
    let dbSubject = await Subject.findOne({ where: { subject_name: subject } });
    if (!dbSubject) {
      dbSubject = await Subject.create({ subject_name: subject }, { transaction: t });
    }

    // Find or create GradeHasSubject mapping
    let ghs = await GradeHasSubject.findOne({
      where: { grade_id: dbGrade.id, subjects_id: dbSubject.id }
    });
    if (!ghs) {
      ghs = await GradeHasSubject.create({
        grade_id: dbGrade.id,
        subjects_id: dbSubject.id
      }, { transaction: t });
    }

    // Create Quiz
    const quiz = await Quiz.create({
      quiz_name: title.trim(),
      description: description?.trim() || "",
      time_limit: time_limit ? parseInt(time_limit) : 600,
      questions_to_show: questions_to_show ? parseInt(questions_to_show) : null,
      grade_has_subjects_id: ghs.id,
    }, { transaction: t });

    // Create Questions if any
    if (Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const question = await Question.create({
          quiz_id: quiz.id,
          question_text: q.question_text.trim(),
          question_type: q.question_type || "single",
          xp_reward: q.xp_reward ? parseInt(q.xp_reward) : 2,
          image_url: q.image_url || null,
          hint: q.hint?.trim() || null,
          question_order: i + 1,
        }, { transaction: t });

        // Create Options
        if (Array.isArray(q.options)) {
          for (let j = 0; j < q.options.length; j++) {
            const opt = q.options[j];
            await QuestionOption.create({
              question_id: question.id,
              option_text: opt.option_text.trim(),
              is_correct: opt.is_correct || false,
              explanation: opt.explanation?.trim() || null,
              option_order: j + 1,
            }, { transaction: t });
          }
        }
      }
    }

    await t.commit();

    return res.status(201).json({
      status: "success",
      message: "Quiz created successfully",
      data: { quizId: quiz.id }
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * Update Quiz properties and replace questions/options in a transaction.
 */
const updateQuiz = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { quizId } = req.params;
    const { title, description, time_limit, questions_to_show, grade, subject, questions } = req.body || {};

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({
        status: "fail",
        message: "Quiz not found",
      });
    }

    // Find or create Grade
    let dbGrade = await Grade.findOne({ where: { grade_name: grade } });
    if (!dbGrade) {
      dbGrade = await Grade.create({ grade_name: grade }, { transaction: t });
    }

    // Find or create Subject
    let dbSubject = await Subject.findOne({ where: { subject_name: subject } });
    if (!dbSubject) {
      dbSubject = await Subject.create({ subject_name: subject }, { transaction: t });
    }

    // Find or create GradeHasSubject mapping
    let ghs = await GradeHasSubject.findOne({
      where: { grade_id: dbGrade.id, subjects_id: dbSubject.id }
    });
    if (!ghs) {
      ghs = await GradeHasSubject.create({
        grade_id: dbGrade.id,
        subjects_id: dbSubject.id
      }, { transaction: t });
    }

    // Update Quiz properties
    if (title !== undefined) quiz.quiz_name = title.trim();
    if (description !== undefined) quiz.description = description.trim();
    if (time_limit !== undefined) quiz.time_limit = parseInt(time_limit);
    if (questions_to_show !== undefined) quiz.questions_to_show = questions_to_show ? parseInt(questions_to_show) : null;
    quiz.grade_has_subjects_id = ghs.id;
    await quiz.save({ transaction: t });

    // Update Questions if sent
    if (questions !== undefined && Array.isArray(questions)) {
      // Delete all old questions (Cascade will delete QuestionOptions automatically)
      await Question.destroy({
        where: { quiz_id: quizId },
        transaction: t
      });

      // Recreate new questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const question = await Question.create({
          quiz_id: quiz.id,
          question_text: q.question_text.trim(),
          question_type: q.question_type || "single",
          xp_reward: q.xp_reward ? parseInt(q.xp_reward) : 2,
          image_url: q.image_url || null,
          hint: q.hint?.trim() || null,
          question_order: i + 1,
        }, { transaction: t });

        // Create Options
        if (Array.isArray(q.options)) {
          for (let j = 0; j < q.options.length; j++) {
            const opt = q.options[j];
            await QuestionOption.create({
              question_id: question.id,
              option_text: opt.option_text.trim(),
              is_correct: opt.is_correct || false,
              explanation: opt.explanation?.trim() || null,
              option_order: j + 1,
            }, { transaction: t });
          }
        }
      }
    }

    await t.commit();

    return res.status(200).json({
      status: "success",
      message: "Quiz updated successfully",
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * Delete a Quiz record.
 */
const deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({
        status: "fail",
        message: "Quiz not found",
      });
    }

    await quiz.destroy();

    return res.status(200).json({
      status: "success",
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};
