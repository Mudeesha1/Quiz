import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RESULTS = {
	correct: 19,
	total: 20,
	time: '4:12',
	xp: 150,
	accuracy: 95,
	speed: 'Top 5%',
	positionsUp: 12,
	quizTitle: 'Quiz Master',
};

const LEADERBOARD = [
	{ rank: 10, name: 'Alex J.', points: '1,240 pts', avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=AlexJ&backgroundColor=b6e3f4' },
	{ rank: 12, name: 'You (Scholar)', points: '1,150 pts', avatar: 'https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=Arjun&backgroundColor=d1d4f9', active: true, delta: '+12 Positions Up!' },
	{ rank: 13, name: 'Riley W.', points: '1,135 pts', avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=RileyW&backgroundColor=c0aede' },
];

export default function QuizResult({ data: propData } = {}) {
	const navigate = useNavigate();
	const location = useLocation();
	const data = propData ?? ((location && location.state) ? location.state : RESULTS);
	const totalQuestions = data.total ?? RESULTS.total;
	const correctAnswers = data.correct ?? RESULTS.correct;
	const wrongAnswers = Math.max(0, totalQuestions - correctAnswers);

	// animated ring fill
	const CIRCUMFERENCE = 276.5; // for r=44 -> 2*pi*r
	const targetOffset = Math.max(0, CIRCUMFERENCE - (CIRCUMFERENCE * (data.accuracy ?? RESULTS.accuracy)) / 100);
	const [dashOffset, setDashOffset] = useState(CIRCUMFERENCE);

	useEffect(() => {
		// trigger fill animation on mount (slightly delayed for longer dramatic feel)
		const t = setTimeout(() => setDashOffset(targetOffset), 180);
		return () => clearTimeout(t);
	}, [targetOffset]);

	function Confetti() {
		const colors = ['#3525cd', '#fea619', '#4edea3', '#ff6b6b', '#6ffbbe'];
		const pieces = useMemo(
			() =>
				Array.from({ length: 28 }, (_, index) => ({
					id: index,
					left: `${Math.random() * 100}%`,
					// negative delay so pieces start at different fall positions (gives continuous rain)
					delay: `-${(Math.random() * 4).toFixed(2)}s`,
					duration: `${(2.6 + Math.random() * 3).toFixed(2)}s`,
					color: colors[Math.floor(Math.random() * colors.length)],
					size: `${6 + Math.round(Math.random() * 8)}px`,
				})),
				[],
		);

		return (
			<div aria-hidden className="confetti-root">
				{pieces.map((p) => (
					<span
						key={p.id}
						className="confetti-piece"
						style={{
							left: p.left,
							background: p.color,
							width: p.size,
							height: p.size,
							borderRadius: Math.random() > 0.5 ? '50%' : '2px',
							animationDelay: p.delay,
							animationDuration: p.duration,
							animationIterationCount: 'infinite',
						}}
					/>
				))}
			</div>
		);
	}

	useEffect(() => {
		document.title = `${data.quizTitle || 'Quiz Result'} | Quiz Master`;
		// toggle entrance animations
		const root = document.querySelector('.qr-root');
		const t = setTimeout(() => root && root.classList.add('anim-ready'), 80);
		return () => { clearTimeout(t); root && root.classList.remove('anim-ready'); };
	}, [data.quizTitle]);

	return (
		<div className="qr-root">
			<Confetti />
			<style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800&display=swap');
			.qr-root * { box-sizing: border-box; font-family: 'Nunito Sans', sans-serif; }
			.qr-root {  }
			.qr-header { background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: 56px; border-bottom: 1px solid #e8e8e8; }
			.qr-logo { font-size: 20px; font-weight: 800; font-style: italic; color: #3525CD; letter-spacing: -0.5px; }
			.qr-header-right { display: flex; align-items: center; gap: 12px; }
			.qr-xp-pill { background: #F59E0B; color: #fff; font-weight: 800; font-size: 14px; border-radius: 999px; padding: 5px 14px; display: flex; align-items: center; gap: 5px; }
			.qr-avatar { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #e0e0e0; overflow: hidden; }
			.qr-avatar img { width: 100%; height: 100%; object-fit: cover; }
			.qr-body { padding: 24px 28px 40px; max-width: 900px; margin: 0 auto; }
			.qr-hero { text-align: center; padding: 28px 0 24px; }
			.qr-hero-badge { width: 64px; height: 64px; background: #e6e4fd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
			.qr-hero h1 { font-size: 28px; font-weight: 900; margin: 0 0 4px; color: inherit; }
			:root { --color-tertiary: #3525CD; }
			.text-tertiary { color: var(--color-tertiary) !important; }
			.qr-hero p { font-size: 15px; color: #666; margin: 0; font-weight: 600; }
			.qr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
			.qr-card { background: #fff; border-radius: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px; }
			.qr-score-inner { display: flex; align-items: center; gap: 20px; }
			.qr-ring { position: relative; width: 110px; height: 110px; flex-shrink: 0; }
			.qr-ring svg { transform: rotate(-90deg); }
			.qr-ring-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
			.qr-ring-pct { font-size: 22px; font-weight: 900; color: #3525CD; line-height: 1; }
			.qr-ring-sub { font-size: 11px; color: #888; font-weight: 600; }
			.qr-score-text h3 { font-size: 18px; font-weight: 900; color: #1a1a1a; margin: 0 0 4px; }
			.qr-score-text p { font-size: 13px; color: #666; margin: 0 0 12px; line-height: 1.5; }
			.qr-score-text p strong { color: #3525CD; }
			.qr-stat-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 10px; }
			.qr-stat-card { background: #f6f6f8; border-radius: 14px; padding: 10px 12px; text-align: center; }
			.qr-stat-label { font-size: 11px; font-weight: 800; color: #7a7a86; display: block; margin-bottom: 3px; }
			.qr-stat-value { font-size: 18px; font-weight: 900; line-height: 1; }
			.qr-stat-correct .qr-stat-value { color: #0d9e74; }
			.qr-stat-wrong .qr-stat-value { color: #e5484d; }
			.qr-stat-total .qr-stat-value { color: #3525CD; }
			.qr-pills { display: flex; gap: 8px; flex-wrap: wrap; }
			.qr-pill { background: #f5f5f5; border-radius: 14px; padding: 8px 14px; text-align: center; }
			.qr-pill-label { font-size: 11px; font-weight: 700; color: #888; display: block; }
			.qr-pill-value { font-size: 16px; font-weight: 900; }
			.qr-pill-blue .qr-pill-value { color: #3525CD; }
			.qr-pill-orange .qr-pill-value { color: #F59E0B; }
			.qr-rewards { background: linear-gradient(135deg, #4338CA 0%, #3525CD 100%); border-radius: 24px; padding: 24px; color: #fff; box-shadow: 0 2px 8px rgba(53,37,205,0.2); display: flex; flex-direction: column; gap: 16px; }
			.qr-rewards h3 { font-size: 17px; font-weight: 900; margin: 0; color: #fff; }
			.qr-xp-row { background: rgba(255,255,255,0.12); border-radius: 16px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
			.qr-xp-icon { width: 44px; height: 44px; background: #F59E0B; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
			.qr-xp-label { font-size: 14px; font-weight: bold; margin-left: 12px; }
			.qr-xp-val { font-size: 22px; font-weight: 900; }
			.qr-lb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
			.qr-lb-header h3 { font-size: 16px; font-weight: 900; color: #1a1a1a; margin: 0; }
			.qr-lb-tag { font-size: 12px; font-weight: 700; color: #3525CD; }
			.qr-lb-row { display: flex; align-items: center; justify-content: space-between; border-radius: 16px; padding: 10px 14px; margin-bottom: 8px; background: #f7f7f7; }
			.qr-lb-row.active { background: #F59E0B; transform: scale(1.02); box-shadow: 0 4px 14px rgba(245,158,11,0.3); border: 2px solid #e88e00; }
			.qr-lb-left { display: flex; align-items: center; gap: 10px; }
			.qr-lb-rank { font-size: 17px; font-weight: 900; color: #aaa; width: 24px; text-align: center; }
			.qr-lb-row.active .qr-lb-rank { color: #fff; }
			.qr-lb-av { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #fff; overflow: hidden; background: #e0e0e0; flex-shrink: 0; }
			.qr-lb-av img { width: 100%; height: 100%; }
			.qr-lb-name { font-size: 13px; font-weight: 800; color: #333; }
			.qr-lb-row.active .qr-lb-name { color: #fff; }
			.qr-lb-delta { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.85); }
			.qr-lb-pts { font-size: 13px; font-weight: 800; color: #555; }
			.qr-lb-row.active .qr-lb-pts { color: #fff; }
			.qr-badge-card { background: linear-gradient(135deg, #0d9e74 0%, #077a5a 100%); border-radius: 24px; padding: 24px; color: #fff; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(13,158,116,0.2); display: flex; flex-direction: column; gap: 12px; }
			.qr-badge-top { display: flex; align-items: center; gap: 14px; }
			.qr-badge-icon { width: 52px; height: 52px; background: rgba(255,255,255,0.18); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
			.qr-badge-title { font-size: 18px; font-weight: 900; }
			.qr-badge-sub { font-size: 13px; opacity: 0.8; font-weight: 600; }
			.qr-badge-desc { font-size: 13px; font-weight: 600; opacity: 0.9; line-height: 1.5; }
			.qr-badge-wm { position: absolute; bottom: -10px; right: 10px; opacity: 0.12; }
			.qr-actions { display: flex; justify-content: center; gap: 20px; margin-top: 28px; flex-wrap: wrap; }
			.qr-btn-play { background: #F59E0B; color: #fff; border: none; border-radius: 999px; padding: 14px 40px; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 0 #c07a00; transition: all 0.15s; }
			.qr-btn-play:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #c07a00; }
			.qr-btn-play:active { transform: translateY(2px); box-shadow: none; }
			.qr-btn-back { background: transparent; color: #3525CD; border: 2px solid #3525CD; border-radius: 999px; padding: 14px 40px; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 0 #3525CD; transition: all 0.15s; }
			.qr-btn-back:hover { transform: translateY(-2px); background: #f0eeff; }
			.qr-btn-back:active { transform: translateY(2px); box-shadow: none; }
			/* confetti styles */
			.confetti-root { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 30; }
			@keyframes confettiFall { 0% { transform: translateY(-12vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(120vh) rotate(1080deg); opacity: 0; } }
			.confetti-piece { position: absolute; top: -10vh; left: 0; opacity: 0; animation-name: confettiFall; animation-timing-function: cubic-bezier(.18,.86,.24,1); animation-fill-mode: forwards; }
			/* ring will animate using transition on stroke-dashoffset */
			/* subtle entrance */
			.qr-card, .qr-rewards, .qr-badge-card { transform: translateY(10px); opacity: 0; transition: transform 900ms cubic-bezier(.2,.9,.3,1), opacity 900ms ease; }
			.qr-root.anim-ready .qr-card, .qr-root.anim-ready .qr-rewards, .qr-root.anim-ready .qr-badge-card { transform: translateY(0); opacity: 1; }
			@media (max-width: 600px) { .qr-grid { grid-template-columns: 1fr; } .qr-score-inner { flex-direction: column; align-items: flex-start; } }
			`}</style>

			<div className="qr-body">
				<div className="qr-hero text-tertiary">
					<div className="qr-hero-badge">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3525CD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>
					</div>
					<h1 className='text-tertiary'>Mission Accomplished!</h1>
					<p>You're becoming a true scholar!</p>
				</div>

				<div className="qr-grid">
					<div className="qr-card">
						<div className="qr-score-inner">
							<div className="qr-ring">
								<svg width="110" height="110" viewBox="0 0 110 110">
									<circle cx="55" cy="55" r="44" fill="transparent" stroke="#e8e8e8" strokeWidth="10" />
												<circle cx="55" cy="55" r="44" fill="transparent" stroke="#4edea3" strokeWidth="10"
													strokeDasharray={CIRCUMFERENCE}
													strokeDashoffset={dashOffset}
													strokeLinecap="round"
													style={{ transition: 'stroke-dashoffset 2600ms cubic-bezier(.2,.8,.2,1)' }} />
								</svg>
								<div className="qr-ring-label">
									<span className="qr-ring-pct">{data.accuracy ?? RESULTS.accuracy}%</span>
									<span className="qr-ring-sub">Correct</span>
								</div>
							</div>
							<div className="qr-score-text">
								<h3>Excellent Work!</h3>
								<p>You answered <strong>{data.correct ?? RESULTS.correct} out of {data.total ?? RESULTS.total}</strong> questions correctly in just <strong style={{color: '#F59E0B'}}>{data.time ?? RESULTS.time}</strong>.</p>
								<div className="qr-stat-grid" aria-label="Quiz summary">
									<div className="qr-stat-card qr-stat-correct">
										<span className="qr-stat-label">නිවැරදි</span>
										<span className="qr-stat-value">{correctAnswers}</span>
									</div>
									<div className="qr-stat-card qr-stat-wrong">
										<span className="qr-stat-label">වැරදි</span>
										<span className="qr-stat-value">{wrongAnswers}</span>
									</div>
									<div className="qr-stat-card qr-stat-total">
										<span className="qr-stat-label">මුළු</span>
										<span className="qr-stat-value">{totalQuestions}</span>
									</div>
								</div>
								<div className="qr-pills">
									<div className="qr-pill qr-pill-blue">
										<span className="qr-pill-label">Accuracy</span>
										<span className="qr-pill-value">{data.accuracy ?? RESULTS.accuracy}%</span>
									</div>
									<div className="qr-pill qr-pill-orange">
										<span className="qr-pill-label">Speed</span>
										<span className="qr-pill-value">{data.speed ?? RESULTS.speed}</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<div className="qr-rewards">
							<h3>Rewards Earned</h3>
							<div className="qr-xp-row">
								<div style={{display:'flex', alignItems:'center'}}>
									<div className="qr-xp-icon">
										<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L4.09 12.26c-.24.29-.36.65-.36 1.02C3.73 14.23 4.5 15 5.47 15H11v7l8.91-10.26c.24-.29.36-.65.36-1.02C20.27 9.77 19.5 9 18.53 9H13V2z"/></svg>
									</div>
									<span className="qr-xp-label">XP Points</span>
								</div>
								<span className="qr-xp-val">+{data.xp ?? RESULTS.xp}</span>
							</div>
						</div>
						{data.leveledUp && (
							<div className="qr-badge-card">
								<div className="qr-badge-top">
									<div className="qr-badge-icon">
										<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
											<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
										</svg>
									</div>
									<div>
										<div className="qr-badge-title">Level Up!</div>
										<div className="qr-badge-sub">Level {data.newLevelNo || ''}: {data.newLevelName || ''}</div>
									</div>
								</div>
								<p className="qr-badge-desc">
									Congratulations! You have advanced to a new tier. Keep up the amazing work to unlock more quests and challenges!
								</p>
								<div className="qr-badge-wm">
									<svg width="80" height="80" viewBox="0 0 24 24" fill="#fff">
										<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
									</svg>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="qr-actions">
					<button className="qr-btn-play" onClick={() => navigate('/quizzes')}>Play Again</button>
					<button className="qr-btn-back" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
				</div>
			</div>
		</div>
	);
}
