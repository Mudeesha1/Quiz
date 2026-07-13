import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAuthSession } from '../services/authService';
import { getQuizzes } from '../services/appService';
import {
	ArrowRight,
	BookOpen,
	CheckCircle,
	ChevronDown,
	CircleUser,
	Clock3,
	FileText,
	Flame,
	LayoutDashboard,
	Map,
	Search,
	Sparkles,
	Star,
	Trophy,
	ChartNoAxesColumn,
	SlidersHorizontal,
} from 'lucide-react';
import logoicon from '../assets/icons/logo.png';
import Footer from '../ui/Footer';
import {
	Badge,
	ButtonPrimary,
	ButtonSecondary,
	Card,
	CardContent,
	ProgressBar,
	StudentHeader,
	StudentSidebar,
} from '../ui';

const NAV_ITEMS = [
	{ label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
	{ label: 'Quizzes', icon: BookOpen, to: '/quizzes', active: true },
	{ label: 'Past Papers', icon: FileText, to: '/past-papers' },
	{ label: 'Leading', icon: Trophy, to: '/leading' },
	{ label: 'Profile', icon: CircleUser, to: '/profile' },
];

const QUEST_TABS = [
	{ key: 'available', label: 'Available Quests' },
	{ key: 'completed', label: 'Completed Quests' },
];

function Glyph({ icon: Icon, className = '', size = 20, strokeWidth = 2.25 }) {
	return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}

export default function QuizPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const handleLogout = () => {
		clearAuthSession();
		navigate('/', { replace: true });
	};
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedGrade, setSelectedGrade] = useState(location.state?.grade || 'All Grades');
	const [selectedSubject, setSelectedSubject] = useState(location.state?.subject || 'All Subjects');
	const [activeTab, setActiveTab] = useState('available');

	// API states
	const [quizzes, setQuizzes] = useState([]);
	const [grades, setGrades] = useState(['All Grades']);
	const [subjects, setSubjects] = useState(['All Subjects']);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch quizzes and filter options on mount
	useEffect(() => {
		const fetchQuizzesAndFilters = async () => {
			try {
				setLoading(true);
				setError(null);
				const res = await getQuizzes();
				if (res.status === 'success') {
					setQuizzes(res.data.quizzes || []);
					setGrades(res.data.grades || ['All Grades']);
					setSubjects(res.data.subjects || ['All Subjects']);
				}
			} catch (err) {
				console.error('Error loading quizzes:', err);
				setError('Failed to load quizzes. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchQuizzesAndFilters();
	}, []);

	const handleStartQuiz = (quizId) => {
		navigate('/quiz-card', { state: { quizId } });
	};

	const QUIZZES_PER_PAGE = 9;
	const [currentPage, setCurrentPage] = useState(1);

	const visibleQuests = useMemo(() => quizzes.filter((quest) => {
		const matchesSearch = `${quest.subject} ${quest.title} ${quest.description || ''} ${quest.reward}`.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesGrade = selectedGrade === 'All Grades' ? true : quest.grade === selectedGrade;
		const matchesSubject = selectedSubject === 'All Subjects' ? true : quest.subject === selectedSubject;
		const matchesTab = activeTab === 'available' ? quest.status !== 'completed' : quest.status === 'completed';
		return matchesSearch && matchesGrade && matchesSubject && matchesTab;
	}), [quizzes, searchTerm, selectedGrade, selectedSubject, activeTab]);

	// Reset to page 1 whenever filters/tab change
	useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedGrade, selectedSubject, activeTab]);

	const totalPages = Math.max(1, Math.ceil(visibleQuests.length / QUIZZES_PER_PAGE));
	const pagedQuests = useMemo(() => {
		const start = (currentPage - 1) * QUIZZES_PER_PAGE;
		return visibleQuests.slice(start, start + QUIZZES_PER_PAGE);
	}, [visibleQuests, currentPage]);

	return (
		<div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
			<StudentSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} rankLabel="#42" />

			<main className="min-h-screen pb-12 ml-0 md:ml-64">
				<StudentHeader
					onMenuClick={() => setSidebarOpen((value) => !value)}
					avatarSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuAk9z5GonZb0oXkuFqVzg5kIs9iHpOdeW7UmSYcA66ODqhlLo_pSWuPNl87YJ70E4hZwQMlK58F6_xTj3yfLT3gh_iSDZueouFRp74GfkED0XfiPl3jJQ0bvVM1d8JsGp9OMW2fg3qdMh7_6lcKZkYwAR9aMd4hHoPk3DWUa18gUsSaiw1OsEwGYengpCade_72zEWXAxuSCiW9uklJ-5qCSewEo2gsZWHs0BbD_PNHxThTnWTZN80kAzaZgPfTBsgQBlpuPdmdhB8"
					onLogout={handleLogout}
				/>

				<div className="px-4 py-6 mx-auto space-y-6 max-w-container-max md:px-margin-desktop md:py-8">
					<section className="overflow-hidden rounded-[2rem] bg-primary-container text-on-primary shadow-sm"
						style={{
							backgroundImage:
								'linear-gradient(90deg, rgba(62, 53, 202, 0.9) 0%, rgba(62, 53, 202, 0.75) 42%, rgba(62, 53, 202, 0.18) 68%, rgba(62, 53, 202, 0.02) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBWN_qTsUcdwCSSL61lDzTlqJxI3BNDwUIJsL8H1zOoF_ehU-zQ7pIjO60WY8fvHT6wl5DaFvP7HoA_SluU-ykjs1LTf7C0tI-dJQ66dDQEbEX8B7EPZTvHnQCUAGv0AF2bqrgaO_SX9OScpfs07H_bUXRW584WwlcyDKu56h4kByppGYV5ob_Dzj5J-bwJUbebGllS-f7ERHa5wFClYmhbCVqRVerQVuZ3JLhy6VUD9LyA70R5wH3D5dC5HJ7oLy_0GBWLa7_kB54")',
							backgroundPosition: 'center right',
							backgroundRepeat: 'no-repeat',
							backgroundSize: 'cover',
						}}>
						<div className="grid gap-8 p-6 md:grid-cols-[1.15fr_.85fr] md:p-10">
							<div className="relative z-10 flex flex-col justify-center gap-5">
								<div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-white/90">
									<img src={logoicon} alt="Quiz Master" className="w-6 h-6 p-1 bg-white rounded-md shadow-sm" />
									Quiz Master
								</div>
								<div>
									<h1 className="mb-3 leading-tight text-indigo-100 text-display-lg font-headline-lg">Quiz Quest</h1>
									<p className="max-w-full text-body-lg font-body-lg opacity-90">
										Embark on a learning adventure! Master your subjects and earn legendary rewards.
									</p>
								</div>
							</div>
							
						</div>
					</section>

					<section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-4 shadow-sm md:p-6">
						<div className="flex items-center gap-2 mb-4 text-primary md:mb-6">
							<SlidersHorizontal size={18} strokeWidth={2.25} />
							<h2 className="font-headline-md text-headline-md">Quick Start</h2>
						</div>
						<div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-gutter">
							<div className="w-full md:flex-1">
								<label className="block px-1 mb-2 text-sm font-bold text-on-surface-variant">Find a Quiz</label>
								<div className="relative">
									<Search size={18} className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 text-outline" strokeWidth={2.25} />
									<input
										value={searchTerm}
										onChange={(event) => setSearchTerm(event.target.value)}
										className="w-full py-3 pr-4 text-sm transition border-2 rounded-full outline-none border-outline-variant bg-surface-container-lowest pl-11 focus:border-primary focus:ring-2 focus:ring-primary/15 md:py-4"
										placeholder="Search subjects or topics..."
										type="text"
									/>
								</div>
							</div>

							<div className="w-full md:w-52">
								<label className="block px-1 mb-2 text-sm font-bold text-on-surface-variant">Select Grade</label>
								<div className="relative">
									<select
										value={selectedGrade}
										onChange={(event) => setSelectedGrade(event.target.value)}
										className="w-full px-4 py-3 pr-10 text-sm transition border-2 rounded-full outline-none appearance-none border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 md:py-4"
									>
										{grades.map((grade) => (
											<option key={grade}>{grade}</option>
										))}
									</select>
									<ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-on-surface-variant" strokeWidth={2.25} />
								</div>
							</div>

							<div className="w-full md:w-64">
								<label className="block px-1 mb-2 text-sm font-bold text-on-surface-variant">Select Subject</label>
								<div className="relative">
									<select
										value={selectedSubject}
										onChange={(event) => setSelectedSubject(event.target.value)}
										className="w-full px-4 py-3 pr-10 text-sm transition border-2 rounded-full outline-none appearance-none border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/15 md:py-4"
									>
										{subjects.map((subject) => (
											<option key={subject}>{subject}</option>
										))}
									</select>
									<ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-on-surface-variant" strokeWidth={2.25} />
								</div>
							</div>

							<div className="w-full md:w-auto">
								<ButtonPrimary className="chunky-button-primary flex w-full items-center justify-center gap-2 rounded-full border-2 border-warning/70 bg-warning px-7 py-3 font-button-text text-sm font-extrabold uppercase tracking-wide text-white shadow-[0px_5px_0px_0px_#b27300] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_7px_0px_0px_#9b5f00] active:translate-y-1 active:shadow-none md:w-auto md:text-base">
									Filter
									<ArrowRight size={16} strokeWidth={2.25} />
								</ButtonPrimary>
							</div>
						</div>
					</section>

					<div className="flex gap-4 pb-1 overflow-x-auto border-b-2 border-surface-container-highest">
						{QUEST_TABS.map((tab) => (
							<button
								key={tab.key}
								onClick={() => setActiveTab(tab.key)}
								className={`whitespace-nowrap px-6 py-3 text-left font-headline-md transition-colors ${
									activeTab === tab.key ? 'border-b-4 border-primary text-primary' : 'text-on-surface-variant hover:text-primary'
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>

					{loading ? (
						<div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-[1.75rem] border border-outline-variant shadow-sm">
							<div className="w-12 h-12 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
							<p className="mt-4 text-on-surface-variant text-sm font-semibold">Loading available quests...</p>
						</div>
					) : error ? (
						<Card className="rounded-[1.75rem] border-2 border-dashed border-error bg-surface-container-lowest shadow-sm">
							<CardContent className="flex flex-col items-center justify-center py-16 text-center">
								<p className="text-error font-semibold mb-4">{error}</p>
								<ButtonPrimary onClick={() => window.location.reload()} className="rounded-full bg-primary px-6 py-3 text-button-text text-white">
									Retry
								</ButtonPrimary>
							</CardContent>
						</Card>
					) : visibleQuests.length > 0 ? (
						<>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
								{pagedQuests.map((quest) => {
								return (
									<Card key={`${quest.subject}-${quest.title}`} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
										<CardContent className="flex flex-col h-full p-4">
											<div className="flex items-start justify-between gap-4 mb-4">
												<Badge variant={quest.tagVariant === 'success' ? 'success' : 'primary'} className="uppercase tracking-[0.12em]">
													{quest.subject}
												</Badge>
												<div className="flex items-center gap-2 px-3 py-1 border rounded-full border-tertiary-container/20 bg-tertiary-container/10 font-bold text-tertiary text-sm">
													<Glyph icon={Flame} size={16} className="text-tertiary-container" strokeWidth={2.25} />
													<span>{quest.reward}</span>
												</div>
											</div>

											<div className="flex items-center justify-between gap-3 mb-1 text-sm font-bold text-sky-600">
												<span>{quest.grade}</span>
												<span className='px-2 py-1 text-xs font-semibold text-green-700 bg-green-300 rounded-full'>{quest.status === 'completed' ? 'Completed' : 'Available'}</span>
											</div>

											<h3 className="mb-2 transition-colors text-headline-md font-headline-md group-hover:text-primary">{quest.title}</h3>
											<p className="mb-6 text-sm grow text-on-surface-variant">{quest.description || 'No description available for this quest.'}</p>

											<ButtonPrimary onClick={() => handleStartQuiz(quest.id)} className="chunky-button-primary mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-secondary-container px-5 py-3 text-button-text text-white shadow-[0px_4px_0px_0px_#b27300] transition-all hover:-translate-y-0.5 hover:shadow-[0px_6px_0px_0px_#9b5f00] active:translate-y-1">
												{quest.buttonLabel}
												<ArrowRight size={16} strokeWidth={2.25} />
											</ButtonPrimary>
										</CardContent>
									</Card>
								);
							})}
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between border-t-2 border-surface-container-highest pt-6 mt-2">
									<span className="text-sm font-semibold text-on-surface-variant">
										Showing {visibleQuests.length === 0 ? 0 : (currentPage - 1) * QUIZZES_PER_PAGE + 1}–{Math.min(currentPage * QUIZZES_PER_PAGE, visibleQuests.length)} of {visibleQuests.length} quests
									</span>
									<div className="flex items-center gap-2">
										<button
											onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
											disabled={currentPage === 1}
											className="rounded-full border-2 border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-bold text-on-surface-variant transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
										>
											Prev
										</button>
										{Array.from({ length: totalPages }, (_, i) => i + 1)
											.filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
											.reduce((acc, page, idx, arr) => {
												if (idx > 0 && page - arr[idx - 1] > 1) acc.push('…');
												acc.push(page);
												return acc;
											}, [])
											.map((item, idx) =>
												typeof item === 'string' ? (
													<span key={`el-${idx}`} className="px-1 text-on-surface-variant text-sm">{item}</span>
												) : (
													<button
														key={item}
														onClick={() => setCurrentPage(item)}
														className={`h-10 w-10 rounded-full text-sm font-bold transition cursor-pointer ${
															currentPage === item
																? 'bg-primary text-white shadow-[0px_4px_0px_0px_#2e23a8]'
																: 'border-2 border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-primary'
														}`}
													>
														{item}
													</button>
												)
											)}
										<button
											onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
											disabled={currentPage === totalPages}
											className="rounded-full border-2 border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-bold text-on-surface-variant transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
										>
											Next
										</button>
									</div>
								</div>
							)}
						</>
					) : (
						<Card className="rounded-[1.75rem] border-2 border-dashed border-outline-variant bg-surface-container-lowest shadow-sm">
							<CardContent className="flex flex-col items-center justify-center py-16 text-center">
								<Search size={56} className="mb-4 text-outline-variant" strokeWidth={1.75} />
								<h3 className="mb-2 text-headline-md font-headline-md text-on-surface-variant">No Quests Found</h3>
								<p className="max-w-full mb-6 text-sm text-on-surface-variant">
									Try a different subject, grade, or search term to find your next quiz adventure.
								</p>
								<ButtonSecondary
									onClick={() => {
										setSearchTerm('');
										setSelectedGrade('All Grades');
										setSelectedSubject('All Subjects');
										setActiveTab('available');
									}}
									className="px-6 py-3 border-2 rounded-full border-primary text-button-text text-primary hover:bg-primary-fixed/40"
								>
									Reset Filters
								</ButtonSecondary>
							</CardContent>
						</Card>
					)}
				</div>

				<div className="px-4 md:px-margin-desktop">
					<Footer />
				</div>
			</main>
		</div>
	);
}
