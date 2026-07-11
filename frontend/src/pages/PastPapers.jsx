import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../services/authService';
import { getPapersAndFilters, downloadPaper, bookmarkPaper, completePaper } from '../services/appService';
import logoicon from '../assets/icons/logo.png';
import {
	ArrowRight,
	BookOpen,
	CheckCircle,
	ChevronDown,
	Download,
	FileText,
	Flame,
	LayoutDashboard,
	LineChart,
	Lock,
	Search,
	Star,
	Trophy,
	Users,
	CircleUser,
	Clock3,
	Bookmark,
	Map,
} from 'lucide-react';
import Footer from '../ui/Footer';
import { Badge as UIBadge, ButtonPrimary, ButtonSecondary, Card, CardContent, CardHeader, ProgressBar } from '../ui';
import { StudentHeader, StudentSidebar } from '../ui';

const NAV_ITEMS = [
	{ label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
	{ label: 'Quizzes', icon: BookOpen, to: '/dashboard' },
	{ label: 'Past Papers', icon: FileText, to: '/past-papers', active: true },
	{ label: 'Leading', icon: Trophy, to: '/leading' },
	{ label: 'Profile', icon: CircleUser, to: '/profile' },
];

function Glyph({ icon: Icon, className = '', size = 20, strokeWidth = 2.25 }) {
	return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}

// Helpers
const getPaperStatusDetails = (paper) => {
	if (paper.isCompleted) {
		return {
			status: 'Completed',
			accent: 'bg-tertiary-fixed text-on-tertiary-fixed',
			icon: CheckCircle,
			detail: 'Practice Complete',
		};
	}
	if (paper.isDownloaded) {
		return {
			status: 'Downloaded',
			accent: 'bg-primary-fixed text-on-primary-fixed',
			icon: Download,
			detail: 'Downloaded Offline',
		};
	}
	return {
		status: 'Not Attempted',
		accent: 'bg-secondary-fixed text-on-secondary-fixed',
		icon: FileText,
		detail: paper.detail || 'Not Attempted',
	};
};

const getPaperFileUrl = (path) => {
	if (!path) return '';
	const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
	const baseUrl = apiBase.replace('/api/v1', '');
	return `${baseUrl}/api/v1/uploads${path}`;
};

export default function PastPapers() {
	const navigate = useNavigate();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	
	// API states
	const [papers, setPapers] = useState([]);
	const [subjects, setSubjects] = useState(['All Subjects']);
	const [years, setYears] = useState(['All Years']);
	const [selectedSubject, setSelectedSubject] = useState('All Subjects');
	const [selectedYear, setSelectedYear] = useState('All Years');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const handleLogout = () => {
		clearAuthSession();
		navigate('/', { replace: true });
	};
	
	useEffect(() => {
		document.title = 'Past Papers | Quiz Master';

		const fontHref = 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;700;800;900&display=swap';
		if (!document.querySelector(`link[href="${fontHref}"]`)) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = fontHref;
			document.head.appendChild(link);
		}
	}, []);

	// Fetch papers and filter lists from database
	useEffect(() => {
		const fetchPapersAndFilters = async () => {
			try {
				setLoading(true);
				setError(null);
				const res = await getPapersAndFilters();
				if (res.status === 'success') {
					setPapers(res.data.papers || []);
					setSubjects(res.data.subjects || ['All Subjects']);
					setYears(res.data.years || ['All Years']);
				}
			} catch (err) {
				console.error('Error fetching papers and filters:', err);
				setError('Failed to load past papers. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchPapersAndFilters();
	}, []);

	// Download handler
	const handleDownload = async (paper) => {
		try {
			// Register download action in DB
			await downloadPaper(paper.id);

			// Open PDF URL in new tab
			const fullPdfUrl = getPaperFileUrl(paper.pdf_url);
			window.open(fullPdfUrl, '_blank');

			// Update frontend status to downloaded
			setPapers((prevPapers) =>
				prevPapers.map((p) =>
					p.id === paper.id ? { ...p, isDownloaded: true } : p
				)
			);
		} catch (err) {
			console.error('Error downloading paper:', err);
		}
	};

	// Bookmark handler
	const handleBookmark = async (paper) => {
		try {
			const res = await bookmarkPaper(paper.id);
			if (res.status === 'success') {
				const isBookmarkedNow = res.bookmarked;

				// Update local papers list bookmark state
				setPapers((prevPapers) =>
					prevPapers.map((p) =>
						p.id === paper.id ? { ...p, isBookmarked: isBookmarkedNow } : p
					)
				);
			}
		} catch (err) {
			console.error('Error toggling paper bookmark:', err);
		}
	};

	// Mark completed handler
	const handleMarkCompleted = async (paper) => {
		try {
			const res = await completePaper(paper.id);
			if (res.status === 'success') {
				setPapers((prevPapers) =>
					prevPapers.map((p) =>
						p.id === paper.id ? { ...p, isCompleted: true } : p
					)
				);
			}
		} catch (err) {
			console.error('Error marking paper as completed:', err);
		}
	};

	// Local filtering logic
	const visiblePapers = papers.filter((paper) => {
		const haystack = `${paper.subject} ${paper.title} ${paper.year} ${paper.detail || ''}`.toLowerCase();
		const matchesSearch = haystack.includes(searchTerm.toLowerCase());
		const matchesSubject = selectedSubject === 'All Subjects' || paper.subject === selectedSubject;
		const matchesYear = selectedYear === 'All Years' || paper.year === selectedYear;
		return matchesSearch && matchesSubject && matchesYear;
	});

	return (
		<div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
			<StudentSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} rankLabel="#42" />

			<main className="min-h-screen pb-12 ml-0 md:ml-64">
				<StudentHeader
					onMenuClick={() => setSidebarOpen((value) => !value)}
					avatarSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuBwL7C2RnqP7JPAkLxpyr0XF9VOGdFnbu3lCMiZWWTfG6egKHfrEzlB3CaSJgFni3hTSJ4ITTw5VkekRwfneY451tDxcukUjWX_lIwxbF9ZlYxU0DREjnWSnROtcA8zTjvGjZau4iO_lydb1lk3Ba49gRr11SYaFfEX2vAO5GCeUT4mqQnihaCr_Tvptg7E8MDEDs2SHuuAyLkIB_ZAcesQALPKuhbTev7DwyUHksdIl5I4aDkVSqDKTWTO03OwDDEw9Hk88rcsyWk"
					onLogout={handleLogout}
				/>

				<div className="px-4 py-6 mx-auto space-y-6 max-w-container-max md:px-margin-desktop md:py-8">
					<section className="relative overflow-hidden p-6 md:p-10 rounded-[2rem] bg-primary-container text-on-primary shadow-sm">
						<div className="absolute inset-0 pointer-events-none opacity-10">
							<svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
								<defs>
									<pattern height="40" id="paper-dots" patternUnits="userSpaceOnUse" width="40">
										<circle cx="2" cy="2" fill="white" r="2" />
									</pattern>
								</defs>
								<rect fill="url(#paper-dots)" height="100%" width="100%" />
							</svg>
						</div>

						<div className="relative z-10">
							<p className="mb-2 text-sm font-bold tracking-[0.2em] uppercase text-primary-fixed-dim ">Paper Archive</p>
							<h1 className="mb-3 text-indigo-100 text-display-lg font-headline-lg">Sharpen your skills with official past papers</h1>
							<p className="max-w-full text-body-lg font-body-lg opacity-90">
								Every practice session brings you closer to your goals. Browse the archive, download papers, and track your progress in Quiz Master.
							</p>
						</div>

						<div className="absolute w-64 h-64 rounded-full -right-16 -bottom-20 bg-secondary-container/20 blur-3xl" />
					</section>

					<section className="grid grid-cols-12 gap-4 md:gap-gutter">
						<div className="col-span-12 lg:col-span-3">
							<Card className=" rounded-[2rem] border border-outline-variant bg-surface-container-lowest shadow-sm">
								<CardHeader className="px-6 py-5 border-b border-outline-variant">
									<h2 className="text-headline-md font-headline-md">Quick Tips</h2>
								</CardHeader>
								<CardContent className="p-6 space-y-4 text-sm text-on-surface-variant">
									<p>• Start with the latest paper to gauge your current level.</p>
									<p>• Download papers to practice offline anytime.</p>
									<p>• Use filters to jump to your subject or year faster.</p>
								</CardContent>
							</Card>
						</div>

						<div className="col-span-12 lg:col-span-9">
							<Card className="mb-6 rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest shadow-sm">
								<CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-3 md:p-5">
									<div className="relative w-full min-w-0 md:flex-1">
										<Search size={18} className="absolute -translate-y-1/2 left-4 top-1/2 text-on-surface-variant" strokeWidth={2.25} />
										<input
											value={searchTerm}
											onChange={(event) => setSearchTerm(event.target.value)}
											className="w-full px-4 py-3 text-sm transition border outline-none rounded-xl border-outline-variant bg-surface pl-11 focus:border-primary focus:ring-2 focus:ring-primary/15"
											placeholder="Search by paper name..."
											type="text"
										/>
									</div>
									<div className="flex flex-col w-full gap-3 md:w-auto md:flex-row md:flex-nowrap md:gap-3">
										<div className="relative w-full md:w-48 md:min-w-48">
											<select
												value={selectedSubject}
												onChange={(event) => setSelectedSubject(event.target.value)}
												className="w-full px-4 py-3 pr-10 text-sm transition border outline-none appearance-none rounded-xl border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/15"
											>
												{subjects.map((subject) => (
													<option key={subject}>{subject}</option>
												))}
											</select>
											<ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-on-surface-variant" strokeWidth={2.25} />
										</div>
										<div className="relative w-full md:w-36 md:min-w-36">
											<select
												value={selectedYear}
												onChange={(event) => setSelectedYear(event.target.value)}
												className="w-full px-4 py-3 pr-10 text-sm transition border outline-none appearance-none rounded-xl border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/15"
											>
												{years.map((year) => (
													<option key={year}>{year}</option>
												))}
											</select>
											<ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-on-surface-variant" strokeWidth={2.25} />
										</div>
									</div>
								</CardContent>
							</Card>

							{loading ? (
								<div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-[1.75rem] border border-outline-variant shadow-sm">
									<div className="w-12 h-12 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
									<p className="mt-4 text-on-surface-variant text-sm font-semibold">Loading past papers...</p>
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
							) : visiblePapers.length > 0 ? (
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									{visiblePapers.map((paper) => {
										const statusDetails = getPaperStatusDetails(paper);
										const StatusIcon = statusDetails.icon;

										const statusColorClass = 
											statusDetails.status === 'Completed'
												? 'text-tertiary'
												: statusDetails.status === 'Downloaded'
												? 'text-[#5c7290]' // custom blue-gray text color for downloaded as in image 1
												: 'text-on-surface-variant';

										return (
											<Card key={`${paper.subject}-${paper.year}-${paper.title}`} className={`group relative overflow-hidden rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${paper.featured ? 'md:col-span-2' : ''}`}>
												<CardContent className="p-6">
													{paper.featured ? <Star size={72} className="absolute -right-4 -top-4 text-primary/15 rotate-12" strokeWidth={1.75} /> : null}
													<div className="flex items-start justify-between gap-4 mb-4">
														<div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusDetails.accent}`}>{paper.subject}</div>
														<span className="font-label-md text-label-md text-on-surface-variant font-semibold">{paper.year}</span>
													</div>

													{/* Paper Image Cover */}
													{paper.image_url ? (
														<div className="w-full h-40 mb-4 overflow-hidden rounded-lg border border-outline-variant bg-[#f3f4f6]">
															<img 
																src={getPaperFileUrl(paper.image_url)} 
																alt={paper.title} 
																className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
															/>
														</div>
													) : (
														<div className="w-full h-40 mb-4 bg-white flex items-center justify-center gap-3 rounded-lg border border-outline-variant shadow-sm">
															<img src={logoicon} alt="Quiz Master" className="w-12 h-12 rounded-sm" />
															<span className="text-xl font-black text-[#4a39e2] tracking-tight">Quiz Master</span>
														</div>
													)}

													<h3 className="mb-2 text-headline-md font-headline-md text-on-surface group-hover:text-primary">{paper.title}</h3>

													<div className={`mb-6 flex items-center gap-2 ${statusColorClass}`}>
														<Glyph icon={StatusIcon} size={16} className={statusColorClass} />
														<span className="text-xs font-bold tracking-wider uppercase">{statusDetails.status}</span>
														<span className="text-xs">• {statusDetails.detail}</span>
													</div>

													<div className="flex flex-col gap-3 w-full">
														<div className="flex gap-3">
															<ButtonPrimary onClick={() => handleDownload(paper)} className="chunky-button flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary-container px-5 py-3 text-button-text text-white shadow-[0px_4px_0px_0px_#b27300] hover:translate-y-0.5 hover:shadow-[0px_6px_0px_0px_#9b5f00]">
																<Download size={18} strokeWidth={2.25} />
																Download
															</ButtonPrimary>
															<ButtonSecondary
																onClick={() => handleBookmark(paper)}
																className={`flex items-center justify-center w-16 h-16 p-0 border-2 rounded-full chunky-button shrink-0 transition-all ${
																	paper.isBookmarked
																		? 'bg-primary border-primary text-white hover:bg-primary/95 shadow-[0px_4px_0px_0px_#2e23a8] hover:translate-y-0.5 hover:shadow-[0px_6px_0px_0px_#1c1470]'
																		: 'bg-white border-primary text-primary hover:bg-primary-fixed/40'
																}`}
															>
																<Bookmark className="w-5 h-5 shrink-0 md:h-6 md:w-6" strokeWidth={2.5} fill={paper.isBookmarked ? 'currentColor' : 'none'} />
															</ButtonSecondary>
														</div>
														{paper.isDownloaded && !paper.isCompleted && (
															<ButtonSecondary
																onClick={() => handleMarkCompleted(paper)}
																className="chunky-button flex items-center justify-center gap-2 rounded-full border-2 border-tertiary bg-white px-5 py-3 text-button-text text-tertiary hover:bg-tertiary/10 shadow-[0px_4px_0px_0px_rgba(0,168,120,0.5)] hover:translate-y-0.5"
															>
																<CheckCircle size={18} strokeWidth={2.25} />
																Mark as Completed
															</ButtonSecondary>
														)}
													</div>
												</CardContent>
											</Card>
										);
									})}
								</div>
							) : (
								<Card className="rounded-[1.75rem] border-2 border-dashed border-outline-variant bg-surface-container-lowest shadow-sm">
									<CardContent className="flex flex-col items-center justify-center py-16 text-center">
										<Search size={56} className="mb-4 text-outline-variant" strokeWidth={1.75} />
										<h3 className="mb-2 text-headline-md font-headline-md text-on-surface-variant">No Papers Found</h3>
										<p className="max-w-full mb-6 text-sm text-on-surface-variant">
											We couldn't find any papers matching your search. Try a different subject, year, or paper title.
										</p>
										<ButtonPrimary onClick={() => { setSearchTerm(''); setSelectedSubject('All Subjects'); setSelectedYear('All Years'); }} className="rounded-full bg-primary px-6 py-3 text-button-text text-white shadow-[0px_4px_0px_0px_#2e23a8]">
											Clear Filters
										</ButtonPrimary>
									</CardContent>
								</Card>
							)}
						</div>
					</section>
				</div>

				<div className="px-4 md:px-margin-desktop">
					<Footer />
				</div>
			</main>
		</div>
	);
}

