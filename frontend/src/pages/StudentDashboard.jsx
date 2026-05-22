import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  ChevronDown,
  FileText,
  Flame,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  Lock,
  Settings,
  Sigma,
  SlidersHorizontal,
  Star,
  Trees,
  Trophy,
  ChartNoAxesColumn ,
  CircleStar,
  Map,
  CircleUser,
  Search,
} from 'lucide-react';
import Footer from '../ui/Footer';
import rankicon from '../assets/icons/rank.svg';
import { StudentHeader, StudentSidebar } from '../ui';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Quizzes', icon: BookOpen, to: '/quizzes' },
  { label: 'Past Papers', icon: FileText, to: '/past-papers' },
  { label: 'Adventure Map', icon: Map },
  { label: 'Leading', icon: Trophy, to: '/leading' },
  { label: 'Profile', icon: CircleUser, to: '/profile' },
];

const QUESTS = [
  {
    name: 'Numbers Nest',
    status: 'completed',
    icon: CheckCircle,
    label: 'Completed',
  },
  {
    name: 'Fractions Forest',
    status: 'current',
    icon: Trees,
    label: 'Mission 4 of 10',
    badge: 'Now',
  },
  {
    name: 'Decimal Desert',
    status: 'locked',
    icon: Lock,
    label: 'Locked',
  },
  {
    name: 'Geometry Galaxy',
    status: 'locked',
    icon: Lock,
    label: 'Locked',
  },
];

const QUICK_ACTIONS = [
  {
    title: 'Quests',
    description: 'Jump into the next learning adventure.',
    icon: Sigma,
    reward: '120',
    cta: 'Open',
    accent: 'border-secondary-container hover:border-primary-container',
    iconWrap: 'bg-secondary-container/10',
    iconColor: 'text-secondary-container',
  },
  {
    title: 'Past Papers',
    description: 'Review previous papers and practice fast.',
    icon: FileText,
    reward: '240',
    cta: 'Browse',
    accent: 'border-tertiary-container hover:border-tertiary-container',
    iconWrap: 'bg-tertiary-fixed/30',
    iconColor: 'text-tertiary',
  },
  {
    title: 'Practice Quiz',
    description: 'Take a short test before starting a lesson.',
    icon: Flame,
    reward: '80',
    cta: 'Start',
    accent: 'border-primary-container hover:border-primary-container',
    iconWrap: 'bg-primary-fixed/60',
    iconColor: 'text-primary-container',
  },
];

const BADGES = [
  {
    title: 'Speed Runner',
    description: 'Completed 5 quizzes in under 10 minutes each.',
    icon: Star,
    bg: 'bg-amber-100',
    border: 'border-amber-400',
    text: 'text-amber-600',
  },
  {
    title: 'Perfect Score',
    description: 'Got 100% on three Science quizzes in a row.',
    icon: Award,
    bg: 'bg-emerald-100',
    border: 'border-emerald-400',
    text: 'text-emerald-600',
  },
  {
    title: 'Book Worm',
    description: 'Read 10 full study guides this month.',
    icon: BookOpen,
    bg: 'bg-indigo-100',
    border: 'border-indigo-400',
    text: 'text-indigo-600',
  },
];

function Glyph({ icon: Icon, className = '', size = 20, strokeWidth = 2.25 }) {
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}

export default function StudentDashboard() {
  const [tipVisible, setTipVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = 'Quiz Master | Student Dashboard';

    const fontHref = 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;700;800;900&display=swap';
    if (!document.querySelector(`link[href="${fontHref}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontHref;
      document.head.appendChild(link);
    }

    const timer = window.setTimeout(() => setTipVisible(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
      <StudentSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} rankLabel="#42" />

      <main className="min-h-screen pb-12 ml-0 md:ml-64">
        <StudentHeader
          onMenuClick={() => setSidebarOpen((value) => !value)}
          avatarSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuAk9z5GonZb0oXkuFqVzg5kIs9iHpOdeW7UmSYcA66ODqhlLo_pSWuPNl87YJ70E4hZwQMlK58F6_xTj3yfLT3gh_iSDZueouFRp74GfkED0XfiPl3jJQ0bvVM1d8JsGp9OMW2fg3qdMh7_6lcKZkYwAR9aMd4hHoPk3DWUa18gUsSaiw1OsEwGYengpCade_72zEWXAxuSCiW9uklJ-5qCSewEo2gsZWHs0BbD_PNHxThTnWTZN80kAzaZgPfTBsgQBlpuPdmdhB8"
        />

        <section className="p-4 px-4 mt-6 md:p-6 md:mt-8 md:px-margin-desktop">
          <div className="relative p-4 overflow-hidden rounded-lg shadow-sm md:p-8 bg-primary-container text-on-primary">
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern height="40" id="dots" patternUnits="userSpaceOnUse" width="40">
                    <circle cx="2" cy="2" fill="white" r="2" />
                  </pattern>
                </defs>
                <rect fill="url(#dots)" height="100%" width="100%" />
              </svg>
            </div>
            <div className="z-10 flex flex-col items-center gap-6 md:gap-8 md:flex-row md:justify-between">
              <div className="w-full md:w-3/5">
                <h2 className="mb-3 text-lg text-indigo-100 md:mb-4 md:text-2xl font-display-lg text-display-lg">Welcome back, Alex!</h2>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between text-xs md:text-base">
                    <span className="font-label-lg">Level 12 Explorer</span>
                    <span className="font-label-lg">450 / 600 XP</span>
                  </div>
                  <div className="w-full h-3 overflow-hidden rounded-full md:h-4 bg-white/20">
                    <div className="h-full rounded-full bg-tertiary-fixed-dim" style={{ width: '75%' }} />
                  </div>
                  <p className="text-xs md:text-sm opacity-90">
                    Only 150 XP until you unlock the <strong>Maths Master</strong> badge!
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center w-full p-4 border md:p-6 rounded-xl border-white/20 bg-white/10 backdrop-blur-sm md:w-auto">
                <div className="relative">
                  <img src={rankicon} alt="Rank Icon" className="w-16 h-16 md:w-20 md:h-20 animate-pulse opacity-80" />
                  <div className="absolute mt-6 -translate-x-1/2 -translate-y-1/2 md:mt-8 left-1/2 top-1/2">
                    <span className="text-xl font-bold text-white md:text-2xl font-display-lg text-display-lg">#42</span>
                  </div>
                </div>
                <p className="mt-2 text-sm md:text-base font-headline-md text-headline-md">Global Rank</p>
                <p className="text-xs text-center md:text-sm opacity-80">Keep learning. <br/>The top is waiting for you! </p>
              </div>
            </div>
          </div>
        </section>

        <section className="p-4 px-4 mt-4 md:p-6 md:px-margin-desktop">
          <div className="p-4 border shadow-sm md:p-6 rounded-3xl border-outline-variant bg-surface-container-lowest">
            <div className="flex items-center gap-2 mb-4 md:mb-6 text-primary">
              <SlidersHorizontal size={18} strokeWidth={2.25} />
              <h3 className="text-base md:text-lg font-headline-md text-headline-md">Quick Start</h3>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end md:gap-gutter">
              <div className="flex-1 min-w-full sm:min-w-50">
                <label className="block mb-2 ml-1 text-xs font-bold md:text-sm text-on-surface-variant">Select Grade</label>
                <div className="relative me-0 md:me-4">
                  <select className="w-full px-4 md:px-6 py-2.5 md:py-3 pr-10 border-none rounded-full appearance-none bg-surface-container-low font-label-lg text-on-surface focus:ring-2 focus:ring-primary/20 text-sm md:text-base">
                    <option>Grade 4</option>
                    <option>Grade 5</option>
                  </select>
                  <ChevronDown size={16} strokeWidth={2.25} className="absolute -translate-y-1/2 pointer-events-none right-3 md:right-4 top-1/2 text-on-surface-variant" />
                </div>
              </div>
              <div className="flex-1 min-w-full sm:min-w-50">
                <label className="block mb-2 ml-1 text-xs font-bold md:text-sm text-on-surface-variant">Select Subject</label>
                <div className="relative me-0 md:me-4">
                  <select className="w-full px-4 md:px-6 py-2.5 md:py-3 pr-10 border-none rounded-full appearance-none bg-surface-container-low font-label-lg text-on-surface focus:ring-2 focus:ring-primary/20 text-sm md:text-base">
                    <option>Maths</option>
                    <option>Science</option>
                    <option>English</option>
                  </select>
                  <ChevronDown size={16} strokeWidth={2.25} className="absolute -translate-y-1/2 pointer-events-none right-3 md:right-4 top-1/2 text-on-surface-variant" />
                </div>
              </div>
              <div className="w-full sm:flex-none sm:w-auto">
                <button className="w-full sm:w-auto chunky-button-primary flex items-center justify-center sm:justify-start gap-2 rounded-full border-2 border-warning/70 bg-warning px-6 md:px-8 py-2.5 md:py-3 font-button-text text-sm md:text-base font-extrabold uppercase tracking-wide text-white shadow-[0px_5px_0px_0px_#b27300] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_7px_0px_0px_#9b5f00] active:translate-y-1 active:shadow-none focus:outline-none focus:ring-2 focus:ring-warning/40 focus:ring-offset-2 focus:ring-offset-surface-container-low">
                  Go!
                  <ArrowRight size={16} strokeWidth={2.25} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="p-4 px-4 mt-4 md:p-8 md:px-margin-desktop">
          <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-end md:justify-between md:gap-0 md:mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-headline-lg text-headline-lg text-primary">Your Adventure Map</h3>
              <p className="text-xs md:text-sm text-on-surface-variant">Continue your journey through the Kingdom of Knowledge</p>
            </div>
            <button className="flex items-center gap-1 text-sm font-bold text-primary hover:underline md:text-base w-fit">
              View Full Map <ArrowRight size={16} strokeWidth={2.25} />
            </button>
          </div>

          <div className="relative flex items-center gap-4 p-4 overflow-x-auto border rounded-lg shadow-sm md:gap-8 md:p-10 no-scrollbar border-outline-variant bg-surface-container-lowest">
            <div className="absolute left-0 z-0 w-full h-1 mx-20 -translate-y-1/2 top-1/2 bg-surface-container-highest" />
            {QUESTS.map((quest) => {
              const isCurrent = quest.status === 'current';
              const isCompleted = quest.status === 'completed';

              return (
                <div
                  key={quest.name}
                  className={`relative z-10 flex min-w-45 flex-col items-center ${isCurrent ? 'scale-110' : ''} ${quest.status === 'locked' ? 'opacity-40' : ''}`}
                >
                  {isCurrent ? (
                    <div className="absolute -top-4 -right-4 animate-bounce rounded-full bg-secondary-container px-2 py-1 text-[10px] font-bold uppercase text-white">
                      {quest.badge}
                    </div>
                  ) : null}
                  <div
                    className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white text-white shadow-md ${
                      isCompleted ? 'bg-tertiary' : isCurrent ? 'rotate-3 rounded-3xl bg-primary-container shadow-xl' : 'bg-surface-container-highest text-on-surface-variant'
                    } ${isCurrent ? 'h-20 w-20' : ''}`}
                  >
                    <Glyph icon={quest.icon} size={isCurrent ? 32 : 22} className={isCurrent ? 'text-white' : 'text-on-primary-container'} />
                  </div>
                  <span className={`font-bold ${isCompleted ? 'text-tertiary' : isCurrent ? 'text-primary text-lg' : ''}`}>{quest.name}</span>
                  <span className="text-xs text-on-surface-variant">{quest.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-12 gap-4 p-4 px-4 mt-2 md:p-6 md:px-margin-desktop md:gap-gutter">
          <div className="col-span-12 lg:col-span-8">
            <h3 className="mb-4 text-lg md:mb-6 md:text-xl font-headline-lg text-headline-lg text-primary">Quick Action Shortcuts</h3>
            <div className="grid grid-cols-1 gap-3 md:gap-gutter md:grid-cols-3">
              {QUICK_ACTIONS.map((action, index) => (
                <div
                  key={action.title}
                  className={`quest-card group cursor-pointer rounded-xl border-2 me-0 md:me-2 border-transparent bg-surface-container-lowest p-3 md:p-4 shadow-sm transition-all hover:-translate-y-1 ${action.accent}`}
                >
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className={`rounded-xl p-2 md:p-3 ${action.iconWrap}`}>
                      <Glyph icon={action.icon} size={22} className={action.iconColor} />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md border-tertiary-container/20 bg-tertiary-container/10">
                      <Flame size={12} strokeWidth={2.25} className="text-tertiary-container" />
                      <span className="text-xs font-bold text-tertiary">{action.reward} XP</span>
                    </div>
                  </div>
                  <h4 className="mb-1 text-sm md:text-base font-headline-md text-headline-md">{action.title}</h4>
                  <p className="mb-3 text-xs md:mb-4 text-on-surface-variant">{action.description}</p>
                  <button className={`w-full rounded-full py-2 md:py-2.5 font-button-text text-sm md:text-base transition-all ${index === 0 ? 'chunky-button-primary bg-secondary-container text-on-secondary-container' : index === 1 ? 'border-2 border-tertiary text-tertiary hover:bg-tertiary/5' : 'border-2 border-primary-container text-primary-container hover:bg-primary-fixed/50'}`}>
                    {action.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <h3 className="mb-4 text-lg md:mb-6 md:text-xl font-headline-lg text-headline-lg text-primary">Recent Badges</h3>
            <div className="p-4 space-y-4 border rounded-lg shadow-sm md:p-6 md:space-y-6 border-outline-variant bg-surface-container-lowest">
              {BADGES.map((badge) => (
                <div key={badge.title} className="flex items-center gap-3 md:gap-4 group cursor-help">
                  <div className={`flex h-12 md:h-14 w-12 md:w-14 shrink-0 items-center justify-center rounded-full border-2 ${badge.bg} ${badge.border} transition-transform group-hover:scale-110`}>
                    <Glyph icon={badge.icon} size={18} className={badge.text} />
                  </div>
                  <div>
                    <p className="text-sm font-bold md:text-base text-on-surface">{badge.title}</p>
                    <p className="text-xs text-on-surface-variant">{badge.description}</p>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 mt-3 text-xs font-bold transition-colors border-t md:mt-4 md:text-sm border-outline-variant text-primary hover:text-primary-container">
                All Achievements (14)
              </button>
            </div>
          </div>
        </div>
      </main>

      <div className="px-4 ml-0 md:ml-64 md:px-margin-desktop">
        <Footer />
      </div>
    </div>
  );
}
