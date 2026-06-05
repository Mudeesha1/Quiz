import { useEffect, useMemo, useState } from 'react';
import {
	BookOpen,
	CircleUser,
	FileText,
	Flame,
	LayoutDashboard,
	Map,
	Sparkles,
	TrendingUp,
	Trophy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../services/authService';
import onePlaceIcon from '../assets/icons/1place.svg';
import onePlaceBadgeIcon from '../assets/icons/1placebadge.svg';
import twoPlaceIcon from '../assets/icons/2place.svg';
import twoPlaceBadgeIcon from '../assets/icons/2placebadge.svg';
import threePlaceIcon from '../assets/icons/3place.svg';
import threePlaceBadgeIcon from '../assets/icons/3placebadge.svg';
import logoicon from '../assets/icons/logo.png';
import screenimg from '../assets/images/screenimage.png';
import Footer from '../ui/Footer';
import { ButtonPrimary, ButtonSecondary, Card, CardContent, Chip, ChipGroup, StudentHeader, StudentSidebar } from '../ui';

const NAV_ITEMS = [
	{ label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
	{ label: 'Quizzes', icon: BookOpen, to: '/quizzes' },
	{ label: 'Past Papers', icon: FileText, to: '/past-papers' },
	{ label: 'Adventure Map', icon: Map, to: '/dashboard' },
	{ label: 'Leading', icon: Trophy, to: '/leading', active: true },
	{ label: 'Profile', icon: CircleUser, to: '/profile' },
];

const SUBJECTS = ['All Subjects', 'Mathematics', 'Science', 'English', 'Environment'];

// Leaderboard items now include per-subject XP in `xpBySubject` so we can sort both global and subject rankings
const LEADERBOARD = [
	{
		id: 1,
		name: 'Kasun Silva',
		xp: 18900,
		level: 22,
		badge: 'Grand Master',
		trend: 'Top',
		xpBySubject: { Mathematics: 12500, Science: 3400, English: 2000, Environment: 1000 },
	},
	{
		id: 2,
		name: 'Amara Perera',
		xp: 14250,
		level: 20,
		badge: '12 Day Streak',
		trend: 'Hot',
		xpBySubject: { Mathematics: 4200, Science: 7600, English: 1200, Environment: 750 },
	},
	{
		id: 3,
		name: 'Mila Rose',
		xp: 12800,
		level: 19,
		badge: 'Rising Star',
		trend: 'Rise',
		xpBySubject: { Mathematics: 2400, Science: 2100, English: 6800, Environment: 1500 },
	},
	{
		id: 4,
		name: 'Dilshan Fernando',
		xp: 11200,
		level: 18,
		badge: 'Steady',
		trend: '+2',
		xpBySubject: { Mathematics: 8200, Science: 1400, English: 600, Environment: 0 },
	},
	{
		id: 5,
		name: 'Sahan Kumara',
		xp: 10950,
		level: 17,
		badge: 'Steady',
		trend: 'Hold',
		xpBySubject: { Mathematics: 4300, Science: 4600, English: 1200, Environment: 850 },
	},
	{
		id: 42,
		name: 'You (Arjun)',
		xp: 4280,
		level: 12,
		badge: 'Keep going!',
		trend: 'You',
		xpBySubject: { Mathematics: 600, Science: 1500, English: 400, Environment: 1780 },
	},
	{
		id: 43,
		name: 'Priya Naidoo',
		xp: 4150,
		level: 11,
		badge: 'Steady',
		trend: 'Hold',
		xpBySubject: { Mathematics: 1000, Science: 800, English: 2100, Environment: 250 },
	},
];

function PodiumCard({ rank, player }) {
	const tones = {
		1: {
			ring: 'border-amber-400',
			plate: 'bg-amber-400 text-white h-24 text-lg',
			label: 'GOLD CHAMPION',
			titleSize: 'text-2xl',
			cardPad: 'p-8',
			lift: 'scale-105 z-10',
			topIcon: onePlaceIcon,
			badgeIcon: onePlaceBadgeIcon,
			badgeTone: 'bg-amber-400',
		},
		2: {
			ring: 'border-slate-300',
			plate: 'bg-slate-200 text-slate-500 h-16 text-base',
			label: 'SILVER',
			titleSize: 'text-xl',
			cardPad: 'p-6',
			lift: '',
			topIcon: twoPlaceIcon,
			badgeIcon: twoPlaceBadgeIcon,
			badgeTone: 'bg-slate-400',
		},
		3: {
			ring: 'border-orange-300',
			plate: 'bg-orange-200 text-orange-500 h-12 text-base',
			label: 'BRONZE',
			titleSize: 'text-xl',
			cardPad: 'p-6',
			lift: '',
			topIcon: threePlaceIcon,
			badgeIcon: threePlaceBadgeIcon,
			badgeTone: 'bg-orange-300',
		},
	};

	const tone = tones[rank];

	return (
		<div className={`flex flex-col items-center ${tone.lift}`}>
			<div className={`w-full rounded-t-3xl border-2 bg-white ${tone.ring} ${tone.cardPad} border-b-0 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.1)]`}>
				<div className="flex justify-center mb-4">
					<img src={tone.topIcon} alt={`${rank} place`} className="object-contain w-20 h-20" />
				</div>
				<div className="relative w-24 h-24 mx-auto mb-4 border-4 border-white rounded-full bg-primary-fixed">
					<img
						src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(player.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
						alt={player.name}
						className="object-cover w-full h-full rounded-full"
					/>
					<div className={`absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white ${tone.badgeTone}`}>
						<img src={tone.badgeIcon} alt={`${rank} badge`} className="object-contain w-8 h-8" />
					</div>
				</div>
				<div className="text-center">
					<h3 className={`font-black text-on-surface ${tone.titleSize}`}>{player.name}</h3>
					<p className="font-bold text-primary">{player.xp.toLocaleString()} XP</p>
				</div>
				<div className="flex items-center justify-center gap-1 px-3 py-1 mt-4 text-xs font-bold rounded-full bg-secondary-container/20 text-on-secondary-container">
					<Flame size={14} strokeWidth={2.5} />
					{player.badge}
				</div>
			</div>
			<div className={`mt-0 flex w-full items-center justify-center rounded-b-xl font-black ${tone.plate}`}>{tone.label}</div>
		</div>
	);
}

export default function LeadingPage() {
		const navigate = useNavigate();
		const handleLogout = () => {
		clearAuthSession();
		navigate('/', { replace: true });
	};
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [activeTab, setActiveTab] = useState('global');
	const [selectedSubject, setSelectedSubject] = useState('All Subjects');

	useEffect(() => {
		document.title = 'Leaderboard | Quiz Master';

		const fontHref = 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;700;800;900&display=swap';
		if (!document.querySelector(`link[href="${fontHref}"]`)) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = fontHref;
			document.head.appendChild(link);
		}
	}, []);

	// produce a list annotated with `displayXp` field which is either global xp or subject xp
	const list = useMemo(() => {
		const arr = LEADERBOARD.map((item) => {
			const displayXp = activeTab === 'subject' && selectedSubject && selectedSubject !== 'All Subjects'
				? (item.xpBySubject?.[selectedSubject] || 0)
				: item.xp;

			return { ...item, displayXp };
		});

		// sort descending by displayXp
		arr.sort((a, b) => b.displayXp - a.displayXp);

		return arr;
	}, [activeTab, selectedSubject]);

	const topThree = list.slice(0, 3);
	const remaining = list.slice(3);

	return (
		<div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
			<StudentSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} rankLabel="#42" />

			<main className="min-h-screen pb-12 ml-0 md:ml-64">
				<StudentHeader
					onMenuClick={() => setSidebarOpen((value) => !value)}
					avatarSrc="https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=Arjun&backgroundColor=d1d4f9"
					onLogout={handleLogout}
				/>

				<div className="px-4 py-6 mx-auto space-y-8 max-w-container-max md:px-margin-desktop md:py-8">
					<section className="relative overflow-hidden rounded-[2rem] bg-primary-container p-6 text-on-primary shadow-sm md:p-10"
                    style={{
							backgroundImage:
								'linear-gradient(90deg, rgba(62, 53, 202, 0.9) 0%, rgba(62, 53, 202, 0.75) 42%, rgba(62, 53, 202, 0.18) 68%, rgba(62, 53, 202, 0.02) 100%), url("' + screenimg + '")',
							backgroundPosition: 'center right',
							backgroundRepeat: 'no-repeat',
							backgroundSize: 'cover',
						}}>
						<div className="absolute rounded-full -right-20 -top-24 h-72 w-72 bg-secondary-container/25 blur-3xl" />
						<div className="absolute rounded-full -bottom-20 -left-24 h-72 w-72 bg-tertiary-fixed/20 blur-3xl" />

						<div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
							<div>
								<div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-white/90">
									<img src={logoicon} alt="Quiz Master" className="w-6 h-6 p-1 bg-white rounded-md" />
									Quiz Master
								</div>
								<h1 className="mb-2 text-indigo-100 text-display-lg font-headline-lg">Hall of Fame</h1>
								<p className="text-body-lg font-body-lg opacity-90">Celebrate top scholars and climb your way to the crown.</p>
							</div>

							<div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full bg-white/15">
								<Sparkles size={16} strokeWidth={2.5} />
								12,402 Students Participating
							</div>
						</div>
					</section>

					<section className="space-y-5">
						<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
							<div className="inline-flex rounded-full border border-outline-variant bg-surface-container p-1.5">
								<button
									onClick={() => setActiveTab('global')}
									className={`rounded-full px-5 py-2 text-sm font-bold transition-all md:px-6 ${
										activeTab === 'global' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
									}`}
								>
									Global Ranking
								</button>
								<button
									onClick={() => setActiveTab('subject')}
									className={`rounded-full px-5 py-2 text-sm font-bold transition-all md:px-6 ${
										activeTab === 'subject' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
									}`}
								>
									Subject Ranking
								</button>
							</div>

							<div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
								<TrendingUp size={14} strokeWidth={2.5} />
								Weekly ranks updated every midnight
							</div>
						</div>

						{activeTab === 'subject' ? (
							<ChipGroup className="gap-2 md:gap-3">
								{SUBJECTS.map((subject) => (
									<Chip
										key={subject}
										selected={selectedSubject === subject}
										onClick={() => setSelectedSubject(subject)}
										className={`px-5 py-2 text-sm font-bold ${
											selectedSubject === subject
												? 'border-primary bg-primary text-white hover:bg-primary-container'
												: 'bg-surface-container-lowest hover:bg-surface-container-low'
										}`}
									>
										{subject}
									</Chip>
								))}
							</ChipGroup>
						) : null}
					</section>

					<section className="grid items-end gap-6 md:grid-cols-3 md:gap-gutter">
						{topThree[1] ? <PodiumCard rank={2} player={topThree[1]} /> : null}
						{topThree[0] ? <PodiumCard rank={1} player={topThree[0]} /> : null}
						{topThree[2] ? <PodiumCard rank={3} player={topThree[2]} /> : null}
					</section>

					<Card className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-4 shadow-sm md:p-8">
						<CardContent className="space-y-4">
							<div className="flex flex-col gap-2 px-2 md:flex-row md:items-center md:justify-between">
								<h2 className="text-headline-md font-headline-md">Full Rankings</h2>
								<p className="text-sm font-bold text-on-surface-variant">Track your progress and challenge the top 10.</p>
							</div>

							<div className="space-y-3">
								{remaining.map((student, idx) => {
									const isCurrentUser = student.id === 42;
									const rankNumber = idx + 4; // topThree are 1-3, remaining start at 4

									return (
										<div
											key={student.id}
											className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
												isCurrentUser
													? 'scale-[1.01] border-primary bg-primary-fixed/30 shadow-sm'
													: 'border-transparent hover:border-outline-variant hover:bg-surface-container-low'
											}`}
										>
											<span className={`w-9 text-center text-lg font-black ${isCurrentUser ? 'text-primary' : 'text-on-surface-variant'}`}>{rankNumber}</span>

											<img
												src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(student.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
												alt={student.name}
												className={`h-12 w-12 rounded-full border-2 object-cover ${isCurrentUser ? 'border-primary' : 'border-white'}`}
											/>

											<div className="flex-1 min-w-0">
												<p className={`truncate text-base font-bold ${isCurrentUser ? 'text-primary' : 'text-on-surface'}`}>{student.name}</p>
												<div className="flex items-center gap-2 mt-1">
													<span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${isCurrentUser ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
														Level {student.level}
													</span>
													<span className={`text-xs font-bold ${isCurrentUser ? 'text-primary' : 'text-on-surface-variant'}`}>{student.badge}</span>
												</div>
											</div>

											<div className="text-right">
												<p className={`text-base font-black ${isCurrentUser ? 'text-primary' : 'text-on-surface'}`}>{(student.displayXp ?? student.xp).toLocaleString()} XP</p>
												<p className={`text-xs font-bold ${isCurrentUser ? 'text-primary/80' : 'text-on-surface-variant'}`}>{student.trend}</p>
											</div>
										</div>
									);
								})}
							</div>

							<div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
								<ButtonSecondary className="w-full py-3 text-sm font-bold border-2 border-primary text-primary hover:bg-primary/5 sm:w-auto sm:px-8">
									View All 100 Scholars
								</ButtonSecondary>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>

			<div className="px-4 ml-0 md:ml-64 md:px-margin-desktop">
				<Footer />
			</div>
		</div>
	);
}
