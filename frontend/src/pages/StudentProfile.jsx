import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
	Award,
	BookOpen,
	CheckCircle,
    History,
	Clock3,
	Coins,
	Edit3,
	FileText,
	Flame,
	LayoutDashboard,
	Lock,
	Map,
	Menu,
	CircleUser,
	ShieldCheck,
	Star,
	Trophy,
    LogOut,
} from 'lucide-react';
import logoicon from '../assets/icons/logo.png';
import Footer from '../ui/Footer';
import { Badge as UIBadge, ButtonPrimary, ButtonSecondary, Card, CardContent, CardHeader, ProgressBar } from '../ui';

const NAV_ITEMS = [
	{ label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
	{ label: 'Quizzes', icon: BookOpen, to: '/dashboard' },
	{ label: 'Past Papers', icon: FileText, to: '/dashboard' },
	{ label: 'Adventure Map', icon: Map, to: '/dashboard' },
	{ label: 'Leading', icon: Trophy, to: '/dashboard' },
	{ label: 'Profile', icon: CircleUser, to: '/profile', active: true },
];

const QUICK_STATS = [
	{ label: 'Quizzes', value: '42', icon: BookOpen, tone: 'text-lime-500' },
	{ label: 'Total XP', value: '12.5k', icon: Flame, tone: 'text-tertiary' },
	{ label: 'Past Papers', value: '840', icon: FileText, tone: 'text-rose-500' },
	{ label: 'Global Rank', value: '12', icon: Trophy, tone: 'text-primary' },
];

const BADGES = [
	{ title: 'First Step', icon: Award, bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-600', earned: true },
	{ title: 'Bookworm', icon: BookOpen, bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-600', earned: true },
	{ title: 'Quick Thinker', icon: ShieldCheck, bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-600', earned: true },
	{ title: 'Quiz Master', icon: Trophy, bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-600', earned: true },
	{ title: 'On Fire', icon: Flame, bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-600', earned: true },
	{ title: 'Math Wizard', icon: Lock, locked: true },
	{ title: 'Historian', icon: Lock, locked: true },
	{ title: 'Language Pro', icon: Lock, locked: true },
	{ title: 'Perfect Score', icon: Lock, locked: true },
	{ title: 'Team Player', icon: Lock, locked: true },
];

const RECENT_ACTIVITY = [
	{
		title: 'Basic Algebra Challenge',
		subtitle: 'Completed 2 hours ago',
		icon: FileText,
		iconBg: 'bg-primary/10',
		iconColor: 'text-primary',
		reward: '+250 XP',
		score: 'Score: 90%',
	},
	{
		title: 'Medieval History Quiz',
		subtitle: 'Completed Yesterday',
		icon: BookOpen,
		iconBg: 'bg-secondary-container/10',
		iconColor: 'text-secondary-container',
		reward: '+180 XP',
		score: 'Score: 75%',
	},
	{
		title: 'Speed Round Practice',
		subtitle: 'Completed 3 days ago',
		icon: Clock3,
		iconBg: 'bg-tertiary-fixed/30',
		iconColor: 'text-tertiary',
		reward: '+120 XP',
		score: 'Score: 82%',
	},
];

const ACCOUNT_DETAILS = [
	{ label: 'Grade', value: 'Year 5 - Advanced' },
	{ label: 'Member Since', value: 'March 2024' },
	{ label: 'School', value: 'North Star Academy' },
];

function Glyph({ icon: Icon, className = '', size = 20, strokeWidth = 2.25 }) {
	return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}

function ProfileBadge({ item }) {
	if (item.locked) {
		return (
			<div className="flex flex-col items-center gap-2 opacity-40 grayscale">
				<div className="flex items-center justify-center w-16 h-16 border-4 rounded-full border-outline-variant bg-surface-container md:h-20 md:w-20">
					<Glyph icon={item.icon} size={22} className="text-on-surface-variant md:text-3xl" />
				</div>
				<span className="text-xs font-bold text-center md:text-sm">{item.title}</span>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-2 transition-transform group hover:scale-110">
			<div className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 md:h-20 md:w-20 ${item.bg} ${item.border}`}>
				<Glyph icon={item.icon} size={22} className={item.text} />
				<div className="absolute p-1 bg-green-500 border-2 border-white rounded-full -right-1 -top-1">
					<CheckCircle size={10} className="text-white" strokeWidth={3} />
				</div>
			</div>
			<span className="text-xs font-bold text-center md:text-sm">{item.title}</span>
		</div>
	);
}

export default function StudentProfile() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		document.title = 'Profile | Quiz Master';

		const fontHref = 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;700;800;900&display=swap';
		if (!document.querySelector(`link[href="${fontHref}"]`)) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = fontHref;
			document.head.appendChild(link);
		}
	}, []);

	return (
		<div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
			{sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

			<aside className={`fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-surface-container-highest bg-surface-container-low py-6 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
				<div className="px-6 mb-10">
					<div className="flex items-center gap-3">
						<img src={logoicon} alt="Quiz Master" className="w-8 h-8 rounded-lg" />
						<h3 className="font-headline-md text-headline-md font-extrabold tracking-tight text-[#4a39e2]">Quiz Master</h3>
					</div>
				</div>

				<nav className="space-y-1 grow">
					{NAV_ITEMS.map((item) => {
						const isActive = item.active;

						return (
							<Link
								key={item.label}
								to={item.to}
								onClick={() => setSidebarOpen(false)}
								className={`mx-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
									isActive
										? 'translate-x-1 bg-primary-container text-white shadow-sm'
										: 'text-[#4b5563] hover:bg-surface-container-highest'
								}`}
							>
								<Glyph icon={item.icon} size={18} strokeWidth={isActive ? 2.5 : 2.25} className={isActive ? 'text-white' : 'text-[#4b5563]'} />
								<span className="font-label-lg text-label-lg">{item.label}</span>
							</Link>
						);
					})}
				</nav>

				<div className="p-4 mx-4 mt-auto mb-4 border rounded-lg border-outline-variant bg-surface-container-low">
					<h3 className="mb-3 flex items-center gap-2 font-label-lg text-label-lg text-[#4a39e2]">
						<Trophy size={18} strokeWidth={2.25} />
						Global Rank
					</h3>
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-[#6b7280]">Your Position</span>
						<span className="font-bold text-[#d27d00]">#42</span>
					</div>
					<div className="mt-2 space-y-2">
						<div className="flex items-center gap-2 text-xs opacity-70">
							<span className="flex items-center justify-center w-4 h-4 text-white rounded-full bg-secondary-container">1</span>
							<span>Leo The Brave</span>
						</div>
						<div className="flex items-center gap-2 text-xs opacity-70">
							<span className="flex items-center justify-center w-4 h-4 text-white rounded-full bg-slate-400">2</span>
							<span>MathsWhiz2024</span>
						</div>
					</div>
				</div>
			</aside>

			<main className="min-h-screen pb-12 ml-0 md:ml-64">
				<header className="sticky top-0 z-40 flex items-center justify-between w-full px-4 py-3 shadow-sm bg-surface md:px-margin-desktop md:py-4">
					<div className="flex items-center gap-4">
						<button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 transition-colors rounded-lg hover:bg-surface-container-low md:hidden">
							<Menu size={24} className="text-on-surface" strokeWidth={2.25} />
						</button>
					</div>
					<div className="flex items-center gap-3 md:gap-6">
						<div className="items-center hidden gap-2 px-3 py-1 border rounded-full border-tertiary-container/20 bg-tertiary-container/10 sm:flex">
							<Flame size={16} className="text-tertiary-container" strokeWidth={2.25} />
							<span className="font-bold text-tertiary">450 XP</span>
						</div>
						<div className="flex items-center gap-2 px-3 md:gap-3 md:px-6">
							<img
								alt="Student Avatar"
								className="object-cover w-8 h-8 border-2 rounded-full border-primary md:h-10 md:w-10"
								src="https://lh3.googleusercontent.com/aida-public/AB6AXuAk9z5GonZb0oXkuFqVzg5kIs9iHpOdeW7UmSYcA66ODqhlLo_pSWuPNl87YJ70E4hZwQMlK58F6_xTj3yfLT3gh_iSDZueouFRp74GfkED0XfiPl3jJQ0bvVM1d8JsGp9OMW2fg3qdMh7_6lcKZkYwAR9aMd4hHoPk3DWUa18gUsSaiw1OsEwGYengpCade_72zEWXAxuSCiW9uklJ-5qCSewEo2gsZWHs0BbD_PNHxThTnWTZN80kAzaZgPfTBsgQBlpuPdmdhB8"
							/>
							 <button className="w-full sm:w-auto chunky-button-primary flex items-center justify-center sm:justify-start gap-2 rounded-full bg-error px-6 md:px-8 py-2.5 md:py-3 font-button-text text-white text-sm md:text-base shadow-[0px_4px_0px_0px_#600e0e] transition-all active:translate-y-1 active:shadow-none font-bold">
                Logout <LogOut size={22} className="text-white" strokeWidth={2.25} /></button>
						</div>
					</div>
				</header>

				<div className="px-4 py-6 mx-auto space-y-6 max-w-container-max md:px-margin-desktop md:py-8">
					<section className="grid grid-cols-12 gap-4 md:gap-gutter">
						<div className="col-span-12 space-y-6 lg:col-span-4">
							<Card className="relative overflow-hidden border shadow-sm player-card-glow rounded-[2rem] border-outline-variant bg-surface-container-lowest">
								<div className="absolute top-0 left-0 w-full h-2 bg-primary" />
								<CardContent className="p-6 text-center md:p-8">
									<div className="relative flex justify-center mb-6">
										<div className="p-1 overflow-hidden bg-white border-4 rounded-full h-28 w-28 border-primary md:h-32 md:w-32">
											<img
												className="object-cover w-full h-full rounded-full"
												alt="Student avatar"
												data-alt="A vibrant, high-quality character illustration of a smiling primary school student wearing a futuristic blue spacesuit, set against a soft bokeh background of a digital classroom. The style is modern 3D cartoonish with soft lighting, emphasizing a playful and encouraging educational atmosphere. High saturation and bright whites define the light-mode aesthetic."
												src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4EjFtLUnqzIT2Abk51YVZf9S2W7qPbRB4Fm1fdMkOvqcZqoR3mY7ewQKxws-YsvYs95BEISNGSFdSKR1-1mLTP_wD7fuS5N1aAxCCb6bzf_3Ocb0m5VzmdKzL_71gfnc20SZvGqsfKJZh54VT3oRvsBQt3k-vhgTtHPLv7KbuNnubPABA223idjV42EpRVW7aiGAJMIUx2khml3vnJBvoiRyz1-Ef8zk0gnObnDZzP9JA-yUcUMq1bVeDH_wWFQZ_nuwaXnpKaKU"
											/>
										</div>
										<div className="absolute px-3 py-1 text-sm font-black border-2 border-white rounded-full shadow-sm right-20 -bottom-2 bg-secondary-container text-on-secondary-container ">
											LVL 14
										</div>
									</div>

									<h2 className="mb-1 text-display-lg font-headline-lg text-headline-lg text-on-surface">Alex Johnson</h2>
									<p className="mb-6 text-body-md font-body-md text-on-surface-variant">Master Problem Solver</p>

									<ProgressBar value={2450} max={3000} showLabel={false} className="mb-3" />
									<p className="text-label-lg font-label-lg text-tertiary">2,450 / 3,000 XP to Level 15</p>

									<div className="pt-8 mt-8 border-t border-outline-variant">
										<div className="flex flex-col gap-3">
											<ButtonPrimary className="chunky-button flex w-full items-center justify-center gap-2 rounded-full bg-secondary-container py-3 text-button-text text-white shadow-[0px_4px_0px_0px_#b27300] hover:translate-y-0.5 hover:shadow-[0px_6px_0px_0px_#b45309]">
												<Edit3 size={18} strokeWidth={2.25} />
												Edit Profile
											</ButtonPrimary>
											<ButtonSecondary className="w-full py-3 border-2 rounded-full border-primary text-button-text text-primary hover:bg-primary/5">
												Change Password
											</ButtonSecondary>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="border rounded-[1.75rem] shadow-sm border-outline-variant bg-surface-container-low">
								<CardHeader className="px-6 py-4 border-b border-outline-variant">
									<h3 className="text-headline-md font-headline-md">Account Details</h3>
								</CardHeader>
								<CardContent className="p-6 space-y-4">
									{ACCOUNT_DETAILS.map((detail) => (
										<div key={detail.label} className="flex items-center justify-between gap-4">
											<span className="text-label-lg font-label-lg text-on-surface-variant">{detail.label}</span>
											<span className="text-sm font-bold text-on-surface md:text-base">{detail.value}</span>
										</div>
									))}
								</CardContent>
							</Card>
						</div>

						<div className="col-span-12 space-y-6 lg:col-span-8">
							<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
								{QUICK_STATS.map((stat) => (
									<Card key={stat.label} className="text-center border rounded-[1.75rem] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.05)] border-outline-variant bg-surface-container-lowest">
										<CardContent className="p-4 md:p-6">
											<Glyph icon={stat.icon} size={36} className={`mx-auto mb-3 ${stat.tone}`} />
											<div className="text-3xl font-extrabold text-headline-lg font-headline-lg">{stat.value}</div>
											<div className="font-semibold text-label-lg font-label-lg text-on-surface-variant">{stat.label}</div>
										</CardContent>
									</Card>
								))}
							</div>

							<Card className="border shadow-sm rounded-[2rem] border-outline-variant bg-surface-container-lowest">
								<CardHeader className="flex flex-col gap-3 p-6 border-b border-outline-variant md:flex-row md:items-center md:justify-between">
									<div>
										<h2 className="text-headline-lg font-headline-lg">Badge Gallery</h2>
									</div>
									<UIBadge variant="primary" className="px-4 py-1 w-fit bg-primary-fixed text-primary">
										12 / 24 Collected
									</UIBadge>
								</CardHeader>
								<CardContent className="p-5 md:p-6">
									<div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
										{BADGES.map((badge) => (
											<ProfileBadge key={badge.title} item={badge} />
										))}
									</div>
								</CardContent>
							</Card>

							<Card className="border rounded-[1.75rem] shadow-sm border-outline-variant bg-surface-container-high">
								<CardHeader className="px-6 py-4">
									<h3 className="flex items-center gap-2 text-headline-md font-headline-md">
										<History  size={22} strokeWidth={2.25} />
										Recent Quest History
									</h3>
								</CardHeader>
								<CardContent className="p-6 space-y-3">
									{RECENT_ACTIVITY.map((activity) => (
										<div key={activity.title} className="flex items-center justify-between gap-4 rounded-full border border-outline-variant bg-white px-4 py-3 shadow-[0px_2px_0px_0px_rgba(0,0,0,0.03)]">
											<div className="flex items-center gap-3">
												<div className={`flex h-10 w-10 items-center justify-center rounded-full ${activity.iconBg}`}>
													<Glyph icon={activity.icon} size={18} className={activity.iconColor} />
												</div>
												<div>
													<p className="font-bold text-on-surface">{activity.title}</p>
													<p className="text-xs text-on-surface-variant">{activity.subtitle}</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-bold text-tertiary">{activity.reward}</p>
												<p className="text-xs font-label-lg text-on-surface-variant">{activity.score}</p>
											</div>
										</div>
									))}
								</CardContent>
							</Card>
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
