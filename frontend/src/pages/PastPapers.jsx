import { useEffect, useState } from 'react';
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
	{ label: 'Adventure Map', icon: Map, to: '/dashboard' },
	{ label: 'Leading', icon: Trophy, to: '/leading' },
	{ label: 'Profile', icon: CircleUser, to: '/profile' },
];

const FILTER_OPTIONS = {
	subjects: ['All Subjects', 'Mathematics', 'English Language', 'Science', 'History'],
	years: ['All Years', '2024', '2023', '2022', '2021'],
};

const PAPERS = [
	{
		subject: 'Mathematics',
		year: '2023',
		title: 'Grade 5 Scholarship - Paper I',
		status: 'Not Attempted',
		detail: '40 Questions',
		accent: 'bg-secondary-fixed text-on-secondary-fixed',
		icon: FileText,
	},
	{
		subject: 'Science',
		year: '2023',
		title: 'Junior Science Olympiad - Prelims',
		status: 'Completed',
		detail: 'Score: 95%',
		accent: 'bg-tertiary-fixed text-on-tertiary-fixed',
		icon: CheckCircle,
	},
	{
		subject: 'English',
		year: '2022',
		title: 'National English Proficiency Test',
		status: 'Not Attempted',
		detail: '50 Questions',
		accent: 'bg-primary-fixed text-on-primary-fixed',
		icon: FileText,
	},
    	{
		subject: 'Mathematics',
		year: '2024',
		title: 'Grade 5 Scholarship - Paper I',
		status: 'Not Attempted',
		detail: '40 Questions',
		accent: 'bg-secondary-fixed text-on-secondary-fixed',
		icon: FileText,
	},
	{
		subject: 'Science',
		year: '2024',
		title: 'Junior Science Olympiad - Prelims',
		status: 'Completed',
		detail: 'Score: 95%',
		accent: 'bg-tertiary-fixed text-on-tertiary-fixed',
		icon: CheckCircle,
	},
	{
		subject: 'English',
		year: '2002',
		title: 'National English Proficiency Test',
		status: 'Not Attempted',
		detail: '50 Questions',
		accent: 'bg-primary-fixed text-on-primary-fixed',
		icon: FileText,
	},

];

function Glyph({ icon: Icon, className = '', size = 20, strokeWidth = 2.25 }) {
	return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}

export default function PastPapers() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

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

	const visiblePapers = PAPERS.filter((paper) => {
		const haystack = `${paper.subject} ${paper.title} ${paper.year} ${paper.status} ${paper.detail}`.toLowerCase();
		return haystack.includes(searchTerm.toLowerCase());
	});

	return (
		<div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
			<StudentSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} rankLabel="#42" />

			<main className="min-h-screen pb-12 ml-0 md:ml-64">
				<StudentHeader
					onMenuClick={() => setSidebarOpen((value) => !value)}
					avatarSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuBwL7C2RnqP7JPAkLxpyr0XF9VOGdFnbu3lCMiZWWTfG6egKHfrEzlB3CaSJgFni3hTSJ4ITTw5VkekRwfneY451tDxcukUjWX_lIwxbF9ZlYxU0DREjnWSnROtcA8zTjvGjZau4iO_lydb1lk3Ba49gRr11SYaFfEX2vAO5GCeUT4mqQnihaCr_Tvptg7E8MDEDs2SHuuAyLkIB_ZAcesQALPKuhbTev7DwyUHksdIl5I4aDkVSqDKTWTO03OwDDEw9Hk88rcsyWk"
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
							<Card className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest shadow-sm">
								<CardHeader className="px-6 py-5 border-b border-outline-variant">
									<h3 className="flex items-center gap-1.5 text-headline-md font-headline-md text-xl font-extrabold text-on-surface">
										<LineChart size={18} strokeWidth={2.25} />
										 Archive Progress
									</h3>
								</CardHeader>
								<CardContent className="p-6 space-y-5">
									<ProgressBar value={68} max={100} label="Collection progress" />
									<div className="space-y-3 text-sm">
										<div className="flex items-center justify-between">
											<span className="text-on-surface-variant">Papers downloaded</span>
											<span className="font-bold">24</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-on-surface-variant">Completed papers</span>
											<span className="font-bold">18</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-on-surface-variant">Saved for later</span>
											<span className="font-bold">7</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="mt-6 rounded-[2rem] border border-outline-variant bg-surface-container-lowest shadow-sm">
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
											<select className="w-full px-4 py-3 pr-10 text-sm transition border outline-none appearance-none rounded-xl border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/15">
												{FILTER_OPTIONS.subjects.map((subject) => (
													<option key={subject}>{subject}</option>
												))}
											</select>
											<ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-on-surface-variant" strokeWidth={2.25} />
										</div>
										<div className="relative w-full md:w-36 md:min-w-36">
											<select className="w-full px-4 py-3 pr-10 text-sm transition border outline-none appearance-none rounded-xl border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/15">
												{FILTER_OPTIONS.years.map((year) => (
													<option key={year}>{year}</option>
												))}
											</select>
											<ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-on-surface-variant" strokeWidth={2.25} />
										</div>
									</div>
								</CardContent>
							</Card>

							{visiblePapers.length > 0 ? (
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									{visiblePapers.map((paper) => (
										<Card key={`${paper.subject}-${paper.year}-${paper.title}`} className={`group relative overflow-hidden rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${paper.featured ? 'md:col-span-2' : ''}`}>
											<CardContent className="p-6">
												{paper.featured ? <Star size={72} className="absolute -right-4 -top-4 text-primary/15 rotate-12" strokeWidth={1.75} /> : null}
												<div className="flex items-start justify-between gap-4 mb-4">
													<div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${paper.accent}`}>{paper.subject}</div>
													<span className="font-label-lg text-label-lg text-on-surface-variant">{paper.year}</span>
												</div>

												<h3 className="mb-2 text-headline-md font-headline-md text-on-surface group-hover:text-primary">{paper.title}</h3>

												<div className={`mb-6 flex items-center gap-2 ${paper.status === 'Completed' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
													<Glyph icon={paper.icon} size={16} className={paper.status === 'Completed' ? 'text-tertiary' : 'text-on-surface-variant'} />
													<span className="text-xs font-bold tracking-wider uppercase">{paper.status}</span>
													<span className="text-xs">• {paper.detail}</span>
												</div>

												<div className="flex gap-3">
													<ButtonPrimary className="chunky-button flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary-container px-5 py-3 text-button-text text-white shadow-[0px_4px_0px_0px_#b27300] hover:translate-y-0.5 hover:shadow-[0px_6px_0px_0px_#9b5f00]">
														<Download size={18} strokeWidth={2.25} />
														Download
													</ButtonPrimary>
													<ButtonSecondary className="flex items-center justify-center w-16 h-16 p-0 bg-white border-2 rounded-full chunky-button shrink-0 border-primary text-primary hover:bg-primary-fixed/40">
														<Bookmark className="w-5 h-5 shrink-0 md:h-6 md:w-6" strokeWidth={2.5} />
													</ButtonSecondary>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<Card className="rounded-[1.75rem] border-2 border-dashed border-outline-variant bg-surface-container-lowest shadow-sm">
									<CardContent className="flex flex-col items-center justify-center py-16 text-center">
										<Search size={56} className="mb-4 text-outline-variant" strokeWidth={1.75} />
										<h3 className="mb-2 text-headline-md font-headline-md text-on-surface-variant">No Papers Found</h3>
										<p className="max-w-sm mb-6 text-sm text-on-surface-variant">
											We couldn't find any papers matching your search. Try a different subject, year, or paper title.
										</p>
										<ButtonPrimary onClick={() => setSearchTerm('')} className="rounded-full bg-primary px-6 py-3 text-button-text text-white shadow-[0px_4px_0px_0px_#2e23a8]">
											Clear Search
										</ButtonPrimary>
									</CardContent>
								</Card>
							)}

							<div className="flex justify-center mt-10">
								<ButtonSecondary className="px-8 py-3 border-2 rounded-full border-primary text-button-text text-primary hover:bg-primary-fixed/40">
									Load More Papers
								</ButtonSecondary>
							</div>
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
