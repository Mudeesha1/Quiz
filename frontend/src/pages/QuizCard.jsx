import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuthSession } from '../services/authService';
import { getQuizById, submitQuiz } from '../services/appService';
import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	BookOpen,
	CircleUser,
	Clock3,
	FileText,
	X,
	Grid3X3,
	LayoutDashboard,
	Lightbulb,
	Map,
	MoreVertical,
	Trophy,
	Volume2,
} from 'lucide-react';
import logoicon from '../assets/icons/logo.png';
import Footer from '../ui/Footer';
import { ButtonPrimary, ButtonSecondary, Card, CardContent, ProgressBar, StudentHeader, StudentSidebar } from '../ui';
import QuizResult from './QuizResult';

const NAV_ITEMS = [
	{ label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
	{ label: 'Quizzes', icon: BookOpen, to: '/quizzes', active: true },
	{ label: 'Past Papers', icon: FileText, to: '/past-papers' },
	{ label: 'Leading', icon: Trophy, to: '/leading' },
	{ label: 'Profile', icon: CircleUser, to: '/profile' },
];

const EXTRA_TIME_MINUTES = 2;

function formatTime(totalSeconds) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function FallbackImage({ title = 'Quiz Master Visual' }) {
	return (
		<div className="flex items-center justify-center w-full h-full px-4 text-center bg-linear-to-br from-primary/10 via-sky-100 to-amber-100">
			<div>
				<img src={logoicon} alt="Quiz Master" className="w-10 h-10 p-1 mx-auto mb-2 bg-white rounded-lg shadow-sm" />
				<p className="text-sm font-bold text-primary">{title}</p>
				<p className="text-xs text-on-surface-variant">Image unavailable. Continue your quest.</p>
			</div>
		</div>
	);
}

export default function QuizCard() {
	const navigate = useNavigate();
	const location = useLocation();
	const quizId = location.state?.quizId;

	// Database states
	const [quiz, setQuiz] = useState(null);
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [remainingSeconds, setRemainingSeconds] = useState(0);
	const [answersByQuestionId, setAnswersByQuestionId] = useState({});
	const [questionImageBroken, setQuestionImageBroken] = useState(false);
	const [missionImageBroken, setMissionImageBroken] = useState(false);
	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [showResultModal, setShowResultModal] = useState(false);
	const [resultData, setResultData] = useState(null);
	const [showHint, setShowHint] = useState(false);
	const [isReviewMode, setIsReviewMode] = useState(false);
	const [showNoAnswerDialog, setShowNoAnswerDialog] = useState(false);

	const handleLogout = () => {
		clearAuthSession();
		navigate('/', { replace: true });
	};

	const totalQuestions = questions.length;
	const currentQuestion = totalQuestions ? currentQuestionIndex + 1 : 0;
	const answeredCount = Object.keys(answersByQuestionId).length;
	const activeQuestion = questions[currentQuestionIndex];
	const isFirstQuestion = currentQuestionIndex === 0;
	const isLastQuestion = totalQuestions ? currentQuestionIndex === totalQuestions - 1 : true;
	const selectedOption = activeQuestion ? (answersByQuestionId[activeQuestion.questionId] || '') : '';

	const goToPreviousQuestion = () => {
		setCurrentQuestionIndex((value) => Math.max(0, value - 1));
	};

	const goToNextQuestion = () => {
		setCurrentQuestionIndex((value) => Math.min(totalQuestions - 1, value + 1));
	};

	const handleSelectOption = (optionId) => {
		if (!activeQuestion) return;
		setAnswersByQuestionId((previous) => ({
			...previous,
			[activeQuestion.questionId]: optionId,
		}));
	};

	const handleSubmitQuiz = async (submitType = 'manual') => {
		if (isSubmitted || !quizId || !quiz) {
			return;
		}

		const answeredCount = Object.keys(answersByQuestionId).length;
		if (answeredCount === 0) {
			setShowNoAnswerDialog(true);
			return;
		}

		setIsSubmitted(true);

		const timeLimit = quiz.timeLimit || 0;
		const elapsedSeconds = Math.max(0, timeLimit - remainingSeconds);

		try {
			const res = await submitQuiz(quizId, {
				answers: answersByQuestionId,
				elapsedSeconds,
				questionIds: questions.map((q) => q.questionId),
			});

			if (res.status === 'success') {
				setResultData({
					...res.data,
					quizTitle: res.data.quizTitle || quiz.quizTitle || 'Quiz Master',
					submitType,
				});
				setShowResultModal(true);
			} else {
				alert('Failed to submit quiz.');
				setIsSubmitted(false);
			}
		} catch (err) {
			console.error('Error submitting quiz:', err);
			alert(err.message || 'An error occurred during submission.');
			setIsSubmitted(false);
		}
	};

	const handleCancelQuiz = () => {
		setShowCancelDialog(true);
	};

	const handleCloseCancelDialog = () => {
		setShowCancelDialog(false);
	};

	const handleConfirmCancelQuiz = () => {
		setShowCancelDialog(false);
		navigate('/quizzes');
	};

	// Redirect if direct access without state
	useEffect(() => {
		if (!quizId) {
			navigate('/quizzes', { replace: true });
		}
	}, [quizId, navigate]);

	const fetchQuiz = async () => {
		if (!quizId) return;
		try {
			setLoading(true);
			setError(null);
			setIsReviewMode(false);
			setShowHint(false);
			const res = await getQuizById(quizId);
			if (res.status === 'success') {
				setQuiz(res.data);
				setQuestions(res.data.questions || []);
				setRemainingSeconds(res.data.timeLimit);
			} else {
				setError('Failed to fetch quiz details.');
			}
		} catch (err) {
			console.error('Error fetching quiz:', err);
			setError('An error occurred while loading the quiz.');
		} finally {
			setLoading(false);
		}
	};

	// Fetch quiz details on mount
	useEffect(() => {
		fetchQuiz();
	}, [quizId]);

	// Reset per-question image error state when the question changes
	useEffect(() => {
		setQuestionImageBroken(false);
		setShowHint(false);
	}, [currentQuestionIndex]);

	// Timer countdown logic
	useEffect(() => {
		if (loading || isSubmitted || !quiz) return;

		const timer = window.setInterval(() => {
			setRemainingSeconds((value) => {
				if (value <= 1) {
					window.clearInterval(timer);
					return 0;
				}
				return value - 1;
			});
		}, 1000);

		return () => window.clearInterval(timer);
	}, [loading, isSubmitted, quiz]);

	// Auto-submit when time runs out
	useEffect(() => {
		if (remainingSeconds === 0 && !loading && quiz && !isSubmitted) {
			handleSubmitQuiz('auto');
		}
	}, [remainingSeconds, loading, quiz, isSubmitted]);

	// Load fonts and set document title
	useEffect(() => {
		document.title = 'Mission Attempt | Quiz Master';

		const fontHref = 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;700;800;900&display=swap';
		if (!document.querySelector(`link[href="${fontHref}"]`)) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = fontHref;
			document.head.appendChild(link);
		}
	}, []);

	const progress = totalQuestions ? Math.round((currentQuestion / totalQuestions) * 100) : 0;
	const missionSteps = useMemo(() => Array.from({ length: totalQuestions }, (_, idx) => idx + 1), [totalQuestions]);

	if (!quizId) {
		return null;
	}

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-surface">
				<div className="flex flex-col items-center">
					<div className="w-12 h-12 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
					<p className="mt-4 text-on-surface-variant font-semibold">Loading quiz questions...</p>
				</div>
			</div>
		);
	}

	if (error || !questions.length) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-surface">
				<div className="w-full max-w-md p-6 text-center bg-surface-container-lowest rounded-[1.75rem] border border-outline-variant shadow-sm">
					<p className="text-error font-semibold mb-4">{error || "No questions found for this quiz."}</p>
					<ButtonPrimary onClick={() => navigate('/quizzes')} className="rounded-full bg-primary px-6 py-3 text-button-text text-white">
						Back to Quizzes
					</ButtonPrimary>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
			<StudentSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} rankLabel="#42" />

			<main className="min-h-screen pb-32 ml-0 md:ml-64">
				<StudentHeader
					onMenuClick={() => setSidebarOpen((value) => !value)}
					avatarSrc="https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=Arjun&backgroundColor=d1d4f9"
					onLogout={handleLogout}
				/>

				<div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low md:px-margin-desktop">
					<div className="flex flex-wrap items-center justify-between gap-3">
						{isReviewMode ? (
							<div className="flex items-center gap-2 text-emerald-600 font-extrabold bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200">
								<Lightbulb size={18} />
								<span>Review Mode</span>
							</div>
						) : (
							<div className="flex items-center gap-2 text-primary">
								<Clock3 size={18} strokeWidth={2.25} />
								<span className={`text-base font-extrabold ${remainingSeconds <= 300 ? 'animate-pulse text-error' : ''}`}>{formatTime(remainingSeconds)}</span>
							</div>
						)}

						<div className="w-full max-w-5xl md:flex-1">
							<div className="flex items-center justify-between mb-1 text-xs font-bold md:text-sm">
								<span className="text-primary">Mission {currentQuestion} of {totalQuestions}</span>
								<span className="text-on-surface-variant">{progress}% Complete</span>
							</div>
							<ProgressBar value={progress} className="h-3 rounded-full" color="success" />
						</div>

						<div className="flex items-center gap-2 text-on-surface-variant">
							<button onClick={isReviewMode ? () => navigate('/quizzes') : handleCancelQuiz} className="p-2 transition rounded-full hover:bg-surface-container-high" aria-label={isReviewMode ? "Exit review" : "Cancel quiz"}>
								<X size={22} strokeWidth={2.25} className={isReviewMode ? 'text-slate-500' : 'text-error'}/>
							</button>
						</div>
					</div>
				</div>

				<div className="grid gap-6 px-4 py-6 mx-auto max-w-container-max md:px-margin-desktop lg:grid-cols-12">
					<div className="space-y-6 lg:col-span-8">
						<Card className="overflow-hidden rounded-[2rem] border border-outline-variant bg-surface-container-lowest shadow-sm">
							<CardContent className="p-5 space-y-6 md:p-8">
								<div className="flex items-start justify-between gap-4">
									<div className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1.5 text-sm font-bold text-on-primary-fixed">
										<img src={logoicon} alt="Quiz Master" className="h-5 w-5 rounded bg-white p-0.5" />
										{activeQuestion.subject}
									</div>
									{activeQuestion.hint && !isReviewMode && (
										<button
											onClick={() => setShowHint(prev => !prev)}
											className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 transition hover:bg-amber-100 cursor-pointer shadow-xs"
										>
											<Lightbulb size={14} className={showHint ? 'fill-amber-400 text-amber-500' : 'text-amber-500'} />
											{showHint ? 'Hide Hint' : 'Show Hint'}
										</button>
									)}
								</div>

								{showHint && activeQuestion.hint && !isReviewMode && (
									<div className="rounded-lg border border-dashed border-amber-200 bg-amber-50/50 p-4 text-sm leading-relaxed text-amber-900 flex items-start gap-2.5">
										<Lightbulb size={18} className="text-amber-500 shrink-0 mt-0.5" />
										<div>
											<p className="font-extrabold text-amber-800">Hint:</p>
											<p className="mt-0.5 font-medium">{activeQuestion.hint}</p>
										</div>
									</div>
								)}

								{activeQuestion.image && !questionImageBroken ? (
									<div className="overflow-hidden border rounded-2xl border-outline-variant bg-surface-container-low aspect-video">
										<img
											src={activeQuestion.image}
											alt="Question visual"
											className="object-cover w-full h-full"
											onError={() => setQuestionImageBroken(true)}
										/>
									</div>
								) : null}

								<h1 className="text-3xl leading-tight font-headline-lg md:text-4xl">
									{activeQuestion.text}
								</h1>

								<div className="grid gap-4 md:grid-cols-2 md:gap-5">
									{activeQuestion.options.map((option) => {
										const selected = selectedOption === option.id;
										const isOptionCorrect = option.isCorrect === true || option.isCorrect === 1;

										let optionStyle = 'border-outline-variant bg-white text-on-surface shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:border-primary hover:-translate-y-0.5';
										let letterStyle = 'bg-surface-container-low text-on-surface-variant';

										if (isReviewMode) {
											if (isOptionCorrect) {
												optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-[0_4px_0_0_#059669]';
												letterStyle = 'bg-emerald-500 text-white';
											} else if (selected) {
												optionStyle = 'border-rose-500 bg-rose-50 text-rose-900 shadow-[0_4px_0_0_#e11d48]';
												letterStyle = 'bg-rose-500 text-white';
											} else {
												optionStyle = 'border-outline-variant bg-white text-slate-400 opacity-60 pointer-events-none';
												letterStyle = 'bg-slate-100 text-slate-400';
											}
										} else if (selected) {
											optionStyle = 'border-primary-container bg-primary text-white shadow-[0_4px_0_0_#1d1092]';
											letterStyle = 'bg-white text-primary';
										}

										return (
											<div key={option.id} className="flex flex-col gap-2">
												<button
													disabled={isReviewMode}
													onClick={() => handleSelectOption(option.id)}
													className={`flex items-center gap-3 rounded-[1.5rem] border-2 px-5 py-4 text-left transition-all duration-150 ${optionStyle}`}
												>
													<span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-black ${letterStyle}`}>
														{option.letter}
													</span>
													<span className="text-xl font-extrabold">{option.label}</span>
												</button>
												{isReviewMode && option.explanation && (isOptionCorrect || selected) && (
													<div className={`rounded-md px-4 py-2.5 text-xs font-semibold leading-relaxed border-l-4 ${isOptionCorrect ? 'bg-emerald-50 text-emerald-800 border-emerald-500' : 'bg-rose-50 text-rose-800 border-rose-500'}`}>
														<p className="font-extrabold uppercase tracking-wider mb-0.5 text-[10px]">{isOptionCorrect ? "Explanation (Correct):" : "Explanation (Incorrect):"}</p>
														<p className="text-[12px]">{option.explanation}</p>
													</div>
												)}
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					</div>

					<aside className="lg:col-span-4">
						<Card className="sticky top-24 rounded-[2rem] border border-outline-variant bg-surface-container-low p-5 shadow-sm">
							<CardContent className="space-y-5">
								<div className="flex items-center justify-between">
									<h2 className="text-3xl font-headline-md">Mission Map</h2>
									<div className="px-3 py-1 text-xs font-black text-white rounded-full bg-primary">Question {currentQuestion}/{totalQuestions}</div>
								</div>

								<div className="grid grid-cols-5 gap-2.5">
									{missionSteps.map((step) => {
										const isCurrent = step === currentQuestion;
										const stepQuestion = questions[step - 1];
										const isAnswered = Boolean(stepQuestion && answersByQuestionId[stepQuestion.questionId]);

										return (
											<div
												key={step}
												className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
													isCurrent
														? 'scale-110 bg-primary text-white ring-4 ring-primary-container/50'
														: isAnswered
															? 'bg-tertiary-fixed-dim text-on-tertiary-fixed shadow-sm'
															: 'bg-surface-container-highest text-on-surface-variant'
												}`}
											>
												{step}
											</div>
										);
									})}
								</div>

								<div className="pt-4 space-y-2 text-sm font-bold border-t border-outline-variant text-on-surface-variant">
									<div className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full bg-tertiary-fixed-dim" />Answered</div>
									<div className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full bg-primary" />Current Quest</div>
									<div className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full bg-surface-container-highest" />Remaining</div>
								</div>

								<div className="h-40 overflow-hidden border rounded-2xl border-outline-variant bg-surface-container-high">
									{missionImageBroken ? (
										<FallbackImage title="Mission Adventure" />
									) : (
										<img
											src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200&auto=format&fit=crop"
											alt="Mission Adventure"
											className="object-cover w-full h-full"
											onError={() => setMissionImageBroken(true)}
										/>
									)}
								</div>
							</CardContent>
						</Card>
					</aside>
				</div>
                
			</main>

			<nav className="fixed bottom-0 left-0 z-50 ml-0 flex w-full items-center justify-between border-t-2 border-surface-container-high bg-surface px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:ml-64 md:w-[calc(100%-16rem)] md:px-margin-desktop">
				<ButtonSecondary
					onClick={goToPreviousQuestion}
					disabled={isFirstQuestion}
					className={`flex items-center gap-2 px-3 py-2 text-sm font-bold bg-transparent border-0 rounded-full ${
						isFirstQuestion
							? 'cursor-not-allowed text-outline-variant'
							: 'text-on-surface-variant hover:bg-surface-container-high'
					}`}
				>
					<ArrowLeft size={16} strokeWidth={2.25} />
					Previous
				</ButtonSecondary>

				{isLastQuestion ? (
					isReviewMode ? (
						<ButtonPrimary
							onClick={() => navigate('/quizzes')}
							className="flex items-center gap-2 rounded-full border-2 border-emerald-600/70 bg-emerald-600 px-8 py-3 text-base font-extrabold text-white shadow-[0px_5px_0px_0px_#047857] transition-all hover:-translate-y-0.5 hover:shadow-[0px_7px_0px_0px_#065f46]"
						>
							Exit Review
							<X size={16} strokeWidth={2.5} />
						</ButtonPrimary>
					) : (
						<ButtonPrimary
							onClick={() => handleSubmitQuiz('manual')}
							className="flex items-center gap-2 rounded-full border-2 border-tertiary/70 bg-tertiary px-8 py-3 text-base font-extrabold text-white shadow-[0px_5px_0px_0px_#00412b] transition-all hover:-translate-y-0.5 hover:shadow-[0px_7px_0px_0px_#003521] active:translate-y-1 active:shadow-none"
						>
							Submit
							<ArrowRight size={16} strokeWidth={2.5} />
						</ButtonPrimary>
					)
				) : (
					<ButtonPrimary
						onClick={goToNextQuestion}
						className="flex items-center gap-2 rounded-full border-2 border-secondary/70 bg-secondary px-8 py-3 text-base font-extrabold text-white shadow-[0px_5px_0px_0px_#6c4503] transition-all hover:-translate-y-0.5 hover:shadow-[0px_7px_0px_0px_#5b3900] active:translate-y-1 active:shadow-none"
					>
						Next
						<ArrowRight size={16} strokeWidth={2.5} />
					</ButtonPrimary>
				)}
			</nav>

			{showCancelDialog ? (
				<div className="fixed inset-0 flex items-center justify-center p-4 z-70 bg-black/45">
					<div className="w-full max-w-fit rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_40px_rgba(0,0,0,0.2)] md:p-7">
						<div className="flex items-start justify-between gap-3 mb-4">
							<div>
								<p className="text-2xl font-headline-md text-on-surface">Cancel Quiz?</p>
								<p className="mt-1 text-sm text-on-surface-variant">Are you sure you want to cancel this quiz?</p>
							</div>
							<button
								onClick={handleCloseCancelDialog}
								className="p-2 transition rounded-full text-on-surface-variant hover:bg-surface-container-low"
								aria-label="Close cancel dialog"
							>
								<X size={18} strokeWidth={2.25} />
							</button>
						</div>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<ButtonSecondary
								onClick={handleCloseCancelDialog}
								className="w-full px-5 py-3 text-sm font-bold border-2 rounded-full border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
							>
								No, Continue
							</ButtonSecondary>
							<ButtonPrimary
								onClick={handleConfirmCancelQuiz}
								className="w-full rounded-full! border-2! border-error/70! bg-error! px-5 py-3 text-sm font-extrabold! text-white! shadow-[0px_4px_0px_0px_#7f1212]! transition-all hover:bg-error! hover:-translate-y-0.5 hover:shadow-[0px_6px_0px_0px_#6a0d0d]! active:translate-y-1 active:shadow-none!"
							>
								Yes, Cancel Quiz
							</ButtonPrimary>
						</div>
					</div>
				</div>
			) : null}

			{showNoAnswerDialog ? (
				<div className="fixed inset-0 flex items-center justify-center p-4 z-70 bg-black/45">
					<div className="w-full max-w-[400px] rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_18px_40px_rgba(0,0,0,0.2)] md:p-7 animate-[popIn_0.25s_ease-out]">
						<div className="flex flex-col items-center text-center gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
								<AlertTriangle size={32} className="text-amber-600" strokeWidth={2.25} />
							</div>
							<div>
								<p className="text-2xl font-headline-md text-on-surface">Hold on, Scholar!</p>
								<p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
									You must answer at least one question before submitting the quiz.
								</p>
							</div>
							<ButtonPrimary
								onClick={() => setShowNoAnswerDialog(false)}
								className="mt-2 w-full rounded-full! border-2! border-amber-500/70! bg-amber-500! px-6 py-3 text-sm font-extrabold! text-white! shadow-[0px_4px_0px_0px_#b45309]! transition-all hover:bg-amber-500! hover:-translate-y-0.5 hover:shadow-[0px_6px_0px_0px_#92400e]! active:translate-y-1 active:shadow-none!"
							>
								Got it, let me answer!
							</ButtonPrimary>
						</div>
					</div>
				</div>
			) : null}

			{showResultModal ? (
				<div className="fixed inset-0 flex items-center justify-center p-4 z-60 bg-black/50">
					<div className="w-full p-6 shadow-2xl overflow-hidden max-w-fit rounded-3xl bg-surface md:p-8">
						<div className="relative">
							<button
								className="absolute z-50 p-2 rounded-full right-3 top-3 bg-white/90"
								onClick={() => {
									setShowResultModal(false);
									navigate('/quizzes');
								}}
								aria-label="Close results"
							>
								<X size={18} strokeWidth={2.25} />
							</button>
							{/* Render the QuizResult component inline with prepared data */}
							<QuizResult
								data={resultData}
								onPlayAgain={() => {
									setShowResultModal(false);
									setIsSubmitted(false);
									setAnswersByQuestionId({});
									setCurrentQuestionIndex(0);
									fetchQuiz();
								}}
								onReview={() => {
									setShowResultModal(false);
									setIsReviewMode(true);
									setCurrentQuestionIndex(0);
								}}
							/>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
