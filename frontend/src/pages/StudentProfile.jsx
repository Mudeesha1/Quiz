import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession, getUserProfile, requestPasswordReset, updateUserProfile, updateAuthUser, updateUserReview } from '../services/authService';
import { Toast, useToast } from '../ui/Toast';
import {
	Award,
	BookOpen,
	CheckCircle,
	ChevronDown,
	History,
	Clock3,
	Edit3,
	FileText,
	Flame,
	LayoutDashboard,
	Lock,
	Map,
	CircleUser,
	ShieldCheck,
	Star,
	Trophy,
	X,
	Quote,
} from 'lucide-react';
import Footer from '../ui/Footer';
import { Badge as UIBadge, ButtonPrimary, ButtonSecondary, Card, CardContent, CardHeader, ProgressBar } from '../ui';
import { StudentHeader, StudentSidebar } from '../ui';

const NAV_ITEMS = [
	{ label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
	{ label: 'Quizzes', icon: BookOpen, to: '/dashboard' },
	{ label: 'Past Papers', icon: FileText, to: '/past-papers' },
	{ label: 'Leading', icon: Trophy, to: '/leading' },
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

const getBadgeStyles = (badge) => {
	if (!badge.earned) {
		return {
			icon: Lock,
			bg: 'bg-surface-container',
			border: 'border-outline-variant',
			text: 'text-on-surface-variant',
			locked: true,
		};
	}

	switch (badge.badge_type) {
		case 'achievement':
			return {
				icon: Award,
				bg: 'bg-amber-100',
				border: 'border-amber-400',
				text: 'text-amber-600',
			};
		case 'milestone':
			return {
				icon: BookOpen,
				bg: 'bg-blue-100',
				border: 'border-blue-400',
				text: 'text-blue-600',
			};
		case 'streak':
			return {
				icon: Flame,
				bg: 'bg-orange-100',
				border: 'border-orange-400',
				text: 'text-orange-600',
			};
		case 'special':
			return {
				icon: Trophy,
				bg: 'bg-emerald-100',
				border: 'border-emerald-400',
				text: 'text-emerald-600',
			};
		default:
			return {
				icon: ShieldCheck,
				bg: 'bg-purple-100',
				border: 'border-purple-400',
				text: 'text-purple-600',
			};
	}
};

const getBadgeImageUrl = (iconUrl) => {
	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
	if (!iconUrl) return '';
	if (iconUrl.startsWith('http')) return iconUrl;
	return `${API_BASE_URL}/uploads${iconUrl}`;
};

const getBadgeItem = (badge) => {
	const mappedStyles = getBadgeStyles(badge);
	return {
		title: badge.name,
		description: badge.description,
		icon: mappedStyles.icon,
		bg: mappedStyles.bg,
		border: mappedStyles.border,
		text: mappedStyles.text,
		locked: mappedStyles.locked || false,
		imgUrl: getBadgeImageUrl(badge.icon_url),
	};
};

const formatRelativeTime = (dateString) => {
	if (!dateString) return 'Completed';
	const now = new Date();
	const past = new Date(dateString);
	const diffMs = now - past;
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMins < 1) return 'Just now';
	if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
	return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function Glyph({ icon: Icon, className = '', size = 20, strokeWidth = 2.25 }) {
	return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}

function ProfileBadge({ item }) {
	const badgeContent = item.locked ? (
		<div className="flex flex-col items-center gap-2 opacity-40 grayscale w-full">
			<div className="flex items-center justify-center w-16 h-16 border-4 rounded-full border-outline-variant bg-surface-container md:h-20 md:w-20 p-0.5 overflow-hidden">
				{item.imgUrl ? (
					<img src={item.imgUrl} alt={item.title} className="w-full h-full object-contain" />
				) : (
					<Glyph icon={item.icon} size={22} className="text-on-surface-variant md:text-3xl" />
				)}
			</div>
			<span className="text-xs font-bold text-center md:text-sm">{item.title}</span>
		</div>
	) : (
		<div className="flex flex-col items-center gap-2 transition-transform group-hover:scale-110 w-full">
			<div className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 md:h-20 md:w-20 p-0.5 overflow-hidden ${item.bg} ${item.border}`}>
				{item.imgUrl ? (
					<img src={item.imgUrl} alt={item.title} className="w-full h-full object-contain" />
				) : (
					<Glyph icon={item.icon} size={22} className={item.text} />
				)}
				<div className="absolute p-1 bg-green-500 border-2 border-white rounded-full -right-1 -top-1">
					<CheckCircle size={10} className="text-white" strokeWidth={3} />
				</div>
			</div>
			<span className="text-xs font-bold text-center md:text-sm">{item.title}</span>
		</div>
	);

	return (
		<div className="relative group flex flex-col items-center w-full cursor-help">
			{badgeContent}
			
			{/* Hover Tooltip Description Card */}
			<div className="pointer-events-none absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-30 w-52 scale-90 opacity-0 transition-all duration-200 origin-bottom group-hover:scale-100 group-hover:opacity-100">
				<div className="rounded-2xl bg-slate-900/95 backdrop-blur px-4 py-3 text-center text-xs font-medium text-white shadow-xl border border-slate-800">
					<p className="font-extrabold text-amber-400 mb-1 text-sm">{item.title}</p>
					<p className="text-xs text-slate-200 leading-relaxed">{item.description}</p>
					<p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
						{item.locked ? "🔒 Locked Badge" : "🏆 Unlocked!"}
					</p>
					{/* Tooltip Pointer/Arrow */}
					<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 h-3 w-3 rotate-45 bg-slate-900/95 border-r border-b border-slate-800" />
				</div>
			</div>
		</div>
	);
}

export default function StudentProfile() {
	const navigate = useNavigate();
	const toast = useToast();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const handleLogout = () => {
		clearAuthSession();
		navigate('/', { replace: true });
	};
	const [profileModalOpen, setProfileModalOpen] = useState(false);
	const [showAllBadges, setShowAllBadges] = useState(false);

	// Profile name + DiceBear avatar seed/style
	const [fullName, setFullName] = useState('Alex Johnson');
	// store raw seed (not pre-encoded) and encode when building the URL
	const [avatarSeed, setAvatarSeed] = useState('Alex Johnson');
	const [avatarStyle, setAvatarStyle] = useState('lorelei-neutral');
	const [userData, setUserData] = useState(null);
	
	// Dialog lists and states
	const [grades, setGrades] = useState([]);
	const [gradeId, setGradeId] = useState(1);
	const [schoolName, setSchoolName] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [isResettingPass, setIsResettingPass] = useState(false);

	// Review states
	const [reviewRating, setReviewRating] = useState(5);
	const [scholarshipMarks, setScholarshipMarks] = useState('');
	const [reviewText, setReviewText] = useState('');
	const [isEditingReview, setIsEditingReview] = useState(false);
	const [isSavingReview, setIsSavingReview] = useState(false);

	// Use DiceBear 9.x API endpoint (style is selectable)
	const getAvatarUrl = (seed) => `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${encodeURIComponent(seed)}&background=%23ffffff`;

	const getProfileImageUrl = (profileUrl, name) => {
		const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
		if (profileUrl) {
			if (profileUrl.startsWith('/')) {
				return `${API_BASE_URL}${profileUrl}`;
			}
			return profileUrl;
		}
		return getAvatarUrl(name || 'U');
	};

	const randomSeed = () => Math.random().toString(36).slice(2, 9);

	const parseAvatarUrl = (url) => {
		try {
			const parsed = new URL(url);
			const parts = parsed.pathname.split('/');
			const style = parts[2] || 'lorelei-neutral';
			const seed = parsed.searchParams.get('seed') || 'U';
			return { style, seed };
		} catch (e) {
			return { style: 'lorelei-neutral', seed: 'U' };
		}
	};

	const fetchUserData = async () => {
		try {
			const res = await getUserProfile();
			if (res.status === 'success') {
				setUserData(res.data);
				setFullName(res.data.fullname);
				setGradeId(res.data.grade_id);
				setSchoolName(res.data.school_name || '');
				
				setReviewRating(res.data.review_rating || 5);
				setScholarshipMarks(res.data.scholarship_marks !== null && res.data.scholarship_marks !== undefined ? res.data.scholarship_marks : '');
				setReviewText(res.data.review_text || '');
				setIsEditingReview(!res.data.review_text);
				
				if (res.data.profile_url && res.data.profile_url.includes('api.dicebear.com')) {
					const { style, seed } = parseAvatarUrl(res.data.profile_url);
					setAvatarStyle(style);
					setAvatarSeed(seed);
				} else {
					setAvatarSeed(res.data.fullname);
				}
			}
		} catch (err) {
			console.error('Error fetching user profile for profile page:', err);
		}
	};

	useEffect(() => {
		fetchUserData();
		
		// Load grades
		const loadGrades = async () => {
			try {
				const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
				const res = await fetch(`${base}/app/grades`);
				if (res.ok) {
					const json = await res.json();
					if (json?.status === 'success') {
						setGrades(json.data || []);
					}
				}
			} catch (err) {
				console.error('Failed to load grades', err);
			}
		};
		loadGrades();

		window.addEventListener('profileUpdated', fetchUserData);
		return () => {
			window.removeEventListener('profileUpdated', fetchUserData);
		};
	}, []);

	const handleEditProfileOpen = () => {
		if (userData) {
			setFullName(userData.fullname);
			setGradeId(userData.grade_id);
			setSchoolName(userData.school_name || '');
			if (userData.profile_url && userData.profile_url.includes('api.dicebear.com')) {
				const { style, seed } = parseAvatarUrl(userData.profile_url);
				setAvatarStyle(style);
				setAvatarSeed(seed);
			} else {
				setAvatarStyle('lorelei-neutral');
				setAvatarSeed(userData.fullname);
			}
		}
		setProfileModalOpen(true);
	};

	const handleSaveChanges = async () => {
		setIsSaving(true);
		try {
			const profileUrl = getAvatarUrl(avatarSeed);
			const res = await updateUserProfile({
				fullname: fullName,
				grade_id: gradeId,
				school_name: schoolName,
				profile_url: profileUrl,
			});
			if (res.status === 'success') {
				toast.success('Profile updated successfully!');
				updateAuthUser({
					fullname: fullName,
					profile_url: profileUrl,
				});
				await fetchUserData();
				setProfileModalOpen(false);
			}
		} catch (err) {
			toast.error(err.message || 'Failed to update profile. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleChangePassword = async () => {
		if (!userData?.email) {
			toast.error('Email address is missing.');
			return;
		}
		setIsResettingPass(true);
		try {
			await requestPasswordReset(userData.email);
			toast.success(`Verification code sent successfully! Check your inbox.`);
			setTimeout(() => {
				navigate('/reset-password', { state: { email: userData.email } });
			}, 1500);
		} catch (err) {
			toast.error(err.message || 'Failed to request password reset.');
		} finally {
			setIsResettingPass(false);
		}
	};

	const handleSaveReview = async () => {
		if (!reviewText.trim()) {
			toast.error('Please write a review comment.');
			return;
		}
		if (scholarshipMarks === '') {
			toast.error('Please enter your Grade 5 Scholarship marks.');
			return;
		}
		const marks = Number(scholarshipMarks);
		if (isNaN(marks) || marks < 0 || marks > 200) {
			toast.error('Marks must be a valid number between 0 and 200.');
			return;
		}

		setIsSavingReview(true);
		try {
			const res = await updateUserReview({
				scholarship_marks: marks,
				review_rating: reviewRating,
				review_text: reviewText,
			});
			if (res.status === 'success') {
				toast.success('Review saved successfully!');
				await fetchUserData();
				setIsEditingReview(false);
			}
		} catch (err) {
			toast.error(err.message || 'Failed to save review.');
		} finally {
			setIsSavingReview(false);
		}
	};

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
			<StudentSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} rankLabel="#42" />

			<main className="min-h-screen pb-12 ml-0 md:ml-64">
				<StudentHeader onMenuClick={() => setSidebarOpen((value) => !value)} avatarSrc={userData ? getProfileImageUrl(userData.profile_url, userData.fullname) : getAvatarUrl(avatarSeed)} onLogout={handleLogout} />

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
												src={userData ? getProfileImageUrl(userData.profile_url, userData.fullname) : getAvatarUrl(avatarSeed)}
											/>
										</div>
										<div className="absolute px-3 py-1 text-sm font-black border-2 border-white rounded-full shadow-sm right-20 -bottom-2 bg-secondary-container text-on-secondary-container ">
											LVL {userData ? userData.level?.level_no || 1 : 14}
										</div>
									</div>

									<h2 className="mb-1 text-display-lg font-headline-lg text-headline-lg text-on-surface">{fullName}</h2>
									<p className="mb-6 text-body-md font-body-md text-on-surface-variant">{userData?.level?.level_name || 'Master Problem Solver'}</p>

									<ProgressBar value={userData ? userData.xp_progress?.current || 0 : 2450} max={userData ? userData.xp_progress?.needed || 1000 : 3000} showLabel={false} className="mb-3" />
									<p className="text-label-lg font-label-lg text-tertiary">
										{userData 
											? `${userData.current_xp} / ${userData.xp_progress?.needed || 1000} XP to Level ${(userData.level?.level_no || 1) + 1}`
											: '2,450 / 3,000 XP to Level 15'}
									</p>

									<div className="pt-8 mt-8 border-t border-outline-variant">
										<div className="flex flex-col gap-3">
											<ButtonPrimary onClick={handleEditProfileOpen} className="chunky-button flex w-full items-center justify-center gap-2 rounded-full bg-secondary-container py-3 text-button-text text-white shadow-[0px_4px_0px_0px_#b27300] hover:translate-y-0.5 hover:shadow-[0px_6px_0px_0px_#b45309]">
												<Edit3 size={18} strokeWidth={2.25} />
												Edit Profile
											</ButtonPrimary>
											<ButtonSecondary onClick={handleChangePassword} disabled={isResettingPass} className="w-full py-3 border-2 rounded-full border-primary text-button-text text-primary hover:bg-primary/5 disabled:opacity-50">
												{isResettingPass ? 'Sending...' : 'Change Password'}
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
									<div className="flex items-center justify-between gap-4">
										<span className="text-label-lg font-label-lg text-on-surface-variant">Grade</span>
										<span className="text-sm font-bold text-on-surface md:text-base">
											{userData?.grade?.grade_name || 'Grade 5'}
										</span>
									</div>
									<div className="flex items-center justify-between gap-4">
										<span className="text-label-lg font-label-lg text-on-surface-variant">Member Since</span>
										<span className="text-sm font-bold text-on-surface md:text-base">
											{userData?.joined_at ? new Date(userData.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2024'}
										</span>
									</div>
									<div className="flex items-center justify-between gap-4">
										<span className="text-label-lg font-label-lg text-on-surface-variant">School</span>
										<span className="text-sm font-bold text-on-surface md:text-base">
											{userData?.school_name || 'North Star Academy'}
										</span>
									</div>
								</CardContent>
							</Card>

							{/* Review Section */}
							<Card className="border rounded-[1.75rem] shadow-sm border-outline-variant bg-surface-container-low overflow-hidden">
								<CardHeader className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
									<h3 className="text-headline-md font-headline-md">Scholarship & Review</h3>
									{!isEditingReview && userData?.review_text && (
										<button 
											onClick={() => setIsEditingReview(true)}
											className="text-primary hover:text-primary-container p-1 rounded-full hover:bg-surface-container transition-colors"
											aria-label="Edit review"
										>
											<Edit3 size={18} strokeWidth={2.25} />
										</button>
									)}
								</CardHeader>
								<CardContent className="p-6">
									{isEditingReview ? (
										<div className="space-y-4">
											<div>
												<label className="block mb-1 text-sm font-bold text-on-surface-variant">Grade 5 Scholarship Marks</label>
												<input
													type="number"
													placeholder="Marks (out of 200)"
													value={scholarshipMarks}
													onChange={(e) => setScholarshipMarks(e.target.value)}
													className="w-full rounded-full border border-outline-variant bg-white px-4 py-2.5 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
												/>
											</div>

											<div>
												<label className="block mb-1 text-sm font-bold text-on-surface-variant">Your Rating</label>
												<div className="flex items-center gap-1">
													{[1, 2, 3, 4, 5].map((star) => (
														<button
															key={star}
															type="button"
															onClick={() => setReviewRating(star)}
															className="p-1 hover:scale-110 transition-transform"
														>
															<Star
																size={24}
																className={star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-outline-variant"}
															/>
														</button>
													))}
												</div>
											</div>

											<div>
												<label className="block mb-1 text-sm font-bold text-on-surface-variant">Your Review</label>
												<textarea
													placeholder="Write your review about Quiz Master here..."
													value={reviewText}
													onChange={(e) => setReviewText(e.target.value)}
													rows={3}
													className="w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none"
												/>
											</div>

											<div className="flex gap-2 pt-2">
												{userData?.review_text && (
													<ButtonSecondary
														type="button"
														onClick={() => {
															setReviewRating(userData.review_rating || 5);
															setScholarshipMarks(userData.scholarship_marks !== null && userData.scholarship_marks !== undefined ? userData.scholarship_marks : '');
															setReviewText(userData.review_text || '');
															setIsEditingReview(false);
														}}
														className="w-full py-2 text-sm border-2 rounded-full border-outline-variant text-on-surface hover:bg-surface-container-low"
													>
														Cancel
													</ButtonSecondary>
												)}
												<ButtonPrimary
													type="button"
													disabled={isSavingReview}
													onClick={handleSaveReview}
													className="w-full rounded-full bg-primary py-2 text-sm text-button-text font-extrabold text-white shadow-[0px_4px_0px_0px_#2e23a8] transition hover:translate-y-0.5 hover:shadow-[0px_6px_0px_0px_#211a82] disabled:opacity-50"
												>
													{isSavingReview ? 'Saving...' : 'Save Review'}
												</ButtonPrimary>
											</div>
										</div>
									) : (
										// Display mode (Image 2 style testimonial card)
										<div className="relative rounded-lg border border-outline-variant/65 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] border-t-4 border-t-pink-500">
											<span className="absolute right-4 top-4 text-pink-200">
												<Quote size={28} className="rotate-180 opacity-60 fill-pink-50 text-pink-200" />
											</span>
											
											{/* Stars */}
											<div className="flex items-center gap-0.5 mb-3">
												{[1, 2, 3, 4, 5].map((star) => (
													<Star
														key={star}
														size={14}
														className={star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-outline-variant"}
													/>
												))}
											</div>

											{/* Review Comment */}
											<p className="text-sm font-semibold italic text-on-surface-variant mb-5 leading-relaxed">
												"{reviewText}"
											</p>

											{/* Author & Score details */}
											<div className="flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/50">
												<div className="flex items-center gap-3 min-w-0">
													<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white font-bold text-sm">
														{fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
													</div>
													<div className="min-w-0">
														<p className="text-sm font-black text-on-surface truncate">{fullName}</p>
														<p className="text-xs text-on-surface-variant truncate">
															{schoolName || 'Scholarship Student'}
														</p>
													</div>
												</div>
												
												{scholarshipMarks !== '' && (
													<div className="shrink-0 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full font-bold text-xs shadow-sm border border-emerald-100/30">
														{scholarshipMarks}/200
													</div>
												)}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						<div className="col-span-12 space-y-6 lg:col-span-8">
							<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
								{[
									{ label: 'Quizzes', value: userData ? userData.completedQuizzesCount : '0', icon: BookOpen, tone: 'text-lime-500' },
									{ label: 'Total XP', value: userData ? userData.current_xp : '0', icon: Flame, tone: 'text-tertiary' },
									{ label: 'Past Papers', value: userData ? userData.completedPapersCount : '0', icon: FileText, tone: 'text-rose-500' },
									{ label: 'Global Rank', value: userData ? `#${userData.rank || '1'}` : '1', icon: Trophy, tone: 'text-primary' },
								].map((stat) => (
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
										{userData ? `${userData.earnedBadgesCount} / ${userData.totalBadgesCount} Collected` : '0 / 0 Collected'}
									</UIBadge>
								</CardHeader>
								<CardContent className="p-5 md:p-6 space-y-6">
									<div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
										{userData?.badgeGallery && userData.badgeGallery.length > 0 ? (
											(showAllBadges ? userData.badgeGallery : userData.badgeGallery.slice(0, 20)).map((badge) => (
												<ProfileBadge key={badge.id} item={getBadgeItem(badge)} />
											))
										) : (
											<p className="col-span-full text-center text-sm font-semibold text-on-surface-variant py-4">No badges collected yet.</p>
										)}
									</div>

									{userData?.badgeGallery && userData.badgeGallery.length > 20 && (
										<div className="flex justify-center pt-2">
											<button
												onClick={() => setShowAllBadges(!showAllBadges)}
												className="chunky-button flex items-center justify-center gap-2 rounded-full border-2 border-outline-variant bg-surface-container-low px-6 py-2.5 text-sm font-extrabold text-on-surface-variant shadow-[0px_4px_0px_0px_rgba(0,0,0,0.05)] transition-all hover:translate-y-0.5 hover:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.05)] active:translate-y-1 active:shadow-none"
											>
												{showAllBadges ? (
													<>
														Show Less
														<ChevronDown className="rotate-180 transition-transform duration-200" size={16} strokeWidth={2.5} />
													</>
												) : (
													<>
														Show All Badges ({userData.badgeGallery.length})
														<ChevronDown className="transition-transform duration-200" size={16} strokeWidth={2.5} />
													</>
												)}
											</button>
										</div>
									)}
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
									{userData?.recentActivity && userData.recentActivity.length > 0 ? (
										userData.recentActivity.slice(0, 5).map((activity) => (
											<div key={activity.title} className="flex items-center justify-between gap-4 rounded-full border border-outline-variant bg-white px-4 py-3 shadow-[0px_2px_0px_0px_rgba(0,0,0,0.03)]">
												<div className="flex items-center gap-3">
													<div className={`flex h-10 w-10 items-center justify-center rounded-full ${activity.type === 'quiz' ? 'bg-secondary-container/10' : 'bg-primary/10'}`}>
														<Glyph icon={activity.type === 'quiz' ? BookOpen : FileText} size={18} className={activity.type === 'quiz' ? 'text-secondary-container' : 'text-primary'} />
													</div>
													<div>
														<p className="font-bold text-on-surface">{activity.title}</p>
														<p className="text-xs text-on-surface-variant">
															{activity.completed_at ? formatRelativeTime(activity.completed_at) : 'Completed'}
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="font-bold text-tertiary">{activity.reward}</p>
													<p className="text-xs font-label-lg text-on-surface-variant">{activity.score}</p>
												</div>
											</div>
										))
									) : (
										<p className="text-center text-sm font-semibold text-on-surface-variant py-4">No recent quest history found.</p>
									)}
								</CardContent>
							</Card>
						</div>
					</section>
				</div>

				<div className="px-4 md:px-margin-desktop">
					<Footer />
				</div>
			</main>

			{profileModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center p-4 z-60 bg-black/55">
					<div className="w-4/12 max-w-11/12 overflow-hidden rounded-[2rem] bg-white shadow-[0px_24px_80px_rgba(0,0,0,0.28)]">
						<div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
							<h2 className="text-lg font-extrabold text-on-surface">Edit Your Profile</h2>
							<button
								onClick={() => setProfileModalOpen(false)}
								className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
								aria-label="Close dialog"
							>
								<X size={22} strokeWidth={2.25} />
							</button>
						</div>

						<div className="px-5 py-6">
							<p className="mb-4 text-sm font-bold text-on-surface-variant">Choose Your Avatar</p>
							<div className="flex flex-col gap-3 mb-6">
								<div className="flex items-center gap-4">
									<div className="p-1 overflow-hidden bg-white border-4 rounded-full h-15 w-15 border-primary">
										<img src={getAvatarUrl(avatarSeed)} alt="Selected avatar" className="object-cover w-full h-full rounded-full" />
									</div>
									<div className="flex items-center gap-2">
										<ButtonSecondary
											onClick={() => {
												// Randomize should never produce an initials-style avatar
												if (avatarStyle === 'initials') {
													setAvatarStyle('adventurer-neutral');
												}
												setAvatarSeed(randomSeed());
											}}
											className="py-2 px-1 h-5"
										>
											Randomize
										</ButtonSecondary>
										<ButtonSecondary
											onClick={() => {
												// Use Name should use initials style per requirement
												setAvatarStyle('initials');
												setAvatarSeed(fullName || randomSeed());
											}}
											className="py-1 px-1 h-5"
										>
											Use Name
										</ButtonSecondary>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<select value={avatarStyle} onChange={(e) => setAvatarStyle(e.target.value)} className="rounded-full border border-outline-variant px-3 py-2 text-sm">
										<option value="notionists-neutral">Notionists Neutral</option>
										<option value="lorelei-neutral">Lorelei Neutral</option>
										<option value="adventurer-neutral">Adventurer Neutral</option>
										<option value="thumbs">Thumbs</option>
										<option value="fun-emoji">Fun Emoji</option>
										<option value="bottts-neutral">Bottts Neutral</option>
										<option value="avataaars-neutral">Avataaars Neutral</option>
										<option value="toon-head">Toon Head</option>
									</select>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block mb-2 text-sm font-bold text-on-surface-variant">Full Name</label>
									<input
										type="text"
										value={fullName}
										onChange={(e) => {
											setFullName(e.target.value);
											setAvatarSeed(e.target.value || randomSeed());
										}}
										className="w-full rounded-full border border-outline-variant bg-white px-4 py-2.5 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
									/>
								</div>

								<div>
									<label className="block mb-2 text-sm font-bold text-on-surface-variant">Grade</label>
									<div className="relative">
										<select 
											value={gradeId} 
											onChange={(e) => setGradeId(Number(e.target.value))}
											className="w-full appearance-none rounded-full border border-outline-variant bg-white px-4 py-2.5 pr-10 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
										>
											{grades.map((g) => (
												<option key={g.id} value={g.id}>
													{g.grade_name}
												</option>
											))}
										</select>
										<ChevronDown size={16} className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 text-on-surface-variant" strokeWidth={2.25} />
									</div>
								</div>

								<div>
									<label className="block mb-2 text-sm font-bold text-on-surface-variant">School Name</label>
									<input
										type="text"
										value={schoolName}
										onChange={(e) => setSchoolName(e.target.value)}
										className="w-full rounded-full border border-outline-variant bg-white px-4 py-2.5 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
									/>
								</div>
							</div>

							<div className="flex gap-2 mt-7">
								<ButtonSecondary onClick={() => setProfileModalOpen(false)} className="w-full py-2.5 text-sm font-extrabold transition border-2 rounded-full border-outline-variant text-button-text text-on-surface hover:bg-surface-container-low">
									Cancel
								</ButtonSecondary>
								<ButtonPrimary disabled={isSaving} onClick={handleSaveChanges} className="w-full rounded-full bg-primary py-2.5 text-sm text-button-text font-extrabold text-white shadow-[0px_4px_0px_0px_#2e23a8] transition hover:translate-y-0.5 hover:shadow-[0px_6px_0px_0px_#211a82] disabled:opacity-50">
									{isSaving ? 'Saving...' : 'Save Changes'}
								</ButtonPrimary>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Toasts list */}
			<div className="fixed z-50 space-y-3 top-4 right-4">
				{toast.toasts.map((item) => (
					<Toast
						key={item.id}
						type={item.type}
						message={item.message}
						duration={item.duration}
						onClose={() => toast.removeToast(item.id)}
					/>
				))}
			</div>
		</div>
	);
}
