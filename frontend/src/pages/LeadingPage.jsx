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
import { clearAuthSession, getUserProfile } from '../services/authService';
import { getLeaderboard } from '../services/appService';
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
	{ label: 'Leading', icon: Trophy, to: '/leading', active: true },
	{ label: 'Profile', icon: CircleUser, to: '/profile' },
];

const SUBJECTS = ['All Subjects', 'Mathematics', 'Science', 'English', 'Environment'];

function getProfileImageUrl(profileUrl, name) {
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
	if (profileUrl) {
		if (profileUrl.startsWith('/')) {
			return `${API_BASE_URL}${profileUrl}`;
		}
		return profileUrl;
	}
	return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

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
						src={getProfileImageUrl(player.profile_url, player.name)}
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
	const [userData, setUserData] = useState(null);

	// Backend leaderboard state
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const res = await getUserProfile();
				if (res.status === 'success') {
					setUserData(res.data);
				}
			} catch (err) {
				console.error('Error fetching user profile for leading page:', err);
			}
		};
		fetchUserData();

		window.addEventListener('profileUpdated', fetchUserData);
		return () => {
			window.removeEventListener('profileUpdated', fetchUserData);
		};
	}, []);

	// Fetch leaderboard ranking from API
	useEffect(() => {
		const fetchLeaderboardData = async () => {
			try {
				setLoading(true);
				setError(null);
				const subjectParam = activeTab === 'global' ? 'All Subjects' : selectedSubject;
				const res = await getLeaderboard(subjectParam);
				if (res.status === 'success') {
					setLeaderboardData(res.data || []);
				}
			} catch (err) {
				console.error('Error loading leaderboard:', err);
				setError('Failed to load leaderboard data.');
			} finally {
				setLoading(false);
			}
		};
		fetchLeaderboardData();
	}, [activeTab, selectedSubject]);

	const list = useMemo(() => {
		return leaderboardData.map((item) => {
			const isCurrentUser = userData && Number(item.id) === Number(userData.id);
			return {
				...item,
				isCurrentUser,
				name: isCurrentUser ? `You (${item.name})` : item.name,
				displayXp: item.xp,
			};
		});
	}, [leaderboardData, userData]);

	const topThree = list.slice(0, 3);
	const remaining = list.slice(3);

	const activeParticipantsCount = useMemo(() => {
		return list.filter(item => item.xp > 0).length;
	}, [list]);

	const isLeaderboardUnlocked = activeParticipantsCount >= 3;

	return (
		<div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
			<StudentSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} rankLabel={userData ? `#${userData.rank || '00'}` : '#--'} />

			<main className="min-h-screen pb-12 ml-0 md:ml-64">
				<StudentHeader
					onMenuClick={() => setSidebarOpen((value) => !value)}
					avatarSrc={userData ? getProfileImageUrl(userData.profile_url, userData.fullname) : undefined}
					currentXp={userData ? userData.current_xp : 0}
					levelName={userData?.level?.level_name || 'Explorer'}
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
								{list.length} Students Participating
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

					{loading ? (
						<div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-[2rem] border border-outline-variant shadow-sm">
							<div className="w-12 h-12 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
							<p className="mt-4 text-on-surface-variant text-sm font-semibold">Loading Hall of Fame...</p>
						</div>
					) : error ? (
						<Card className="rounded-[2rem] border-2 border-dashed border-error bg-surface-container-lowest shadow-sm">
							<CardContent className="flex flex-col items-center justify-center py-16 text-center">
								<p className="text-error font-semibold mb-4">{error}</p>
								<ButtonPrimary onClick={() => window.location.reload()} className="rounded-full bg-primary px-6 py-3 text-button-text text-white">
									Retry
								</ButtonPrimary>
							</CardContent>
						</Card>
					) : !isLeaderboardUnlocked ? (
						<Card className="rounded-[2rem] border-2 border-dashed border-outline-variant bg-surface-container-lowest shadow-sm ">
							<CardContent className="flex flex-col items-center justify-center py-16 text-center">
								<Trophy size={56} className="mb-4 text-outline-variant" strokeWidth={1.75} />
								<h3 className="mb-2 text-headline-md font-headline-md text-on-surface-variant">Leaderboard Locked</h3>
								<p className="max-w-full mb-6 text-sm text-on-surface-variant">
									{activeTab === 'global' ? (
										`At least 3 students must complete quizzes to unlock the global rankings. Currently, only ${activeParticipantsCount} student(s) have earned XP.`
									) : (
										<>
											At least 3 students must complete quizzes in <strong>{selectedSubject}</strong> to unlock the subject rankings. Currently, only {activeParticipantsCount} student(s) have earned XP in this subject.
										</>
									)}
								</p>
								<ButtonPrimary
									onClick={() => navigate('/quizzes')}
									className="px-6 py-3 bg-primary text-button-text text-white rounded-full transition-all hover:scale-105 active:scale-95"
								>
									Start a Quiz
								</ButtonPrimary>
							</CardContent>
						</Card>
					) : (
						<>
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
										{remaining.length > 0 ? (
											remaining.map((student, idx) => {
												const isCurrentUser = student.isCurrentUser;
												const rankNumber = idx + 4;

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
															src={getProfileImageUrl(student.profile_url, student.name)}
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
											})
										) : (
											<div className="text-center py-6 text-on-surface-variant font-bold text-sm">
												No other participants ranked yet.
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</>
					)}
				</div>
			</main>

			<div className="px-4 ml-0 md:ml-64 md:px-margin-desktop">
				<Footer />
			</div>
		</div>
	);
}
