import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  Edit3,
  FileText,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import Footer from '../../ui/Footer';
import { AdminHeader, AdminSidebar, ButtonPrimary, Card } from '../../ui';
import logoicon from '../../assets/icons/logo.png';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Quizzes', icon: FileText, to: '/admin/quizzes', active: true },
  { label: 'Past Papers', icon: ShieldCheck, to: '/admin/past-papers' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

const QUIZZES = [
  {
    id: 1,
    title: 'Math Magic Level 1',
    subject: 'Mathematics',
    grade: 'Grade 3',
    questions: '10 Questions',
    accent: 'from-indigo-500 to-violet-500',
    icon: BrainCircuit,
  },
  {
    id: 2,
    title: 'World Geography Explorers',
    subject: 'Social Studies',
    grade: 'Grade 4',
    questions: '15 Questions',
    accent: 'from-amber-500 to-orange-500',
    icon: BookOpen,
  },
  {
    id: 3,
    title: 'Fun Space Facts',
    subject: 'Science',
    grade: 'Grade 2',
    questions: '8 Questions',
    accent: 'from-emerald-500 to-teal-500',
    icon: Sparkles,
  },
];

export default function AdminAddQuiz() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');

  const visibleQuizzes = useMemo(() => {
    return QUIZZES.filter((quiz) => {
      const matchesSearch = `${quiz.title} ${quiz.subject} ${quiz.grade}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject === 'All Subjects' || quiz.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [searchTerm, selectedSubject]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
      <AdminSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen pb-12 md:ml-72">
        <AdminHeader onMenuClick={() => setSidebarOpen((value) => !value)} />

        <section className="px-4 py-6 md:px-8 md:py-8 md:px-10">
          <div className="overflow-hidden rounded-[2rem] border border-surface-container-highest bg-gradient-to-br from-primary-fixed via-white to-surface-container-lowest p-6 shadow-soft md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-full">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-primary shadow-sm">
                  <Sparkles size={16} /> Quiz Studio
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <img src={logoicon} alt="Quiz Master logo" className="h-10 w-auto" />
                  <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Manage Quizzes</h2>
                </div>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  Create, edit, and organize fun quiz challenges for students across every subject.
                </p>
              </div>

              <ButtonPrimary className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold">
                <Plus size={16} /> Add New Quiz
              </ButtonPrimary>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total Quizzes</p>
                <p className="mt-3 text-3xl font-black text-slate-900">42</p>
              </Card>
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Active Subjects</p>
                <p className="mt-3 text-3xl font-black text-slate-900">5</p>
              </Card>
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">New This Week</p>
                <p className="mt-3 text-3xl font-black text-slate-900">8</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 pb-6 md:px-8 md:px-10">
          <Card className="overflow-hidden rounded-[2rem] border border-surface-container-highest bg-white/80 shadow-soft">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between md:p-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Recent Quizzes</h3>
                <p className="mt-1 text-sm text-slate-500">Keep your quiz library fresh and ready for learners.</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <label className="relative block">
                  <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search quizzes"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:bg-white"
                  />
                </label>

                <label className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(event) => setSelectedSubject(event.target.value)}
                    className="appearance-none rounded-full border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary focus:bg-white"
                  >
                    <option>All Subjects</option>
                    <option>Mathematics</option>
                    <option>Social Studies</option>
                    <option>Science</option>
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </label>
              </div>
            </div>

            <div className="space-y-4 p-5 md:p-6">
              {visibleQuizzes.map((quiz) => {
                const Icon = quiz.icon;

                return (
                  <div key={quiz.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-primary/20 hover:shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4 md:items-center">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${quiz.accent} text-white shadow-sm`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900">{quiz.title}</h4>
                        <p className="mt-1 text-sm text-slate-500">{quiz.grade} • {quiz.subject} • {quiz.questions}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary-fixed/40">
                        Edit
                      </button>
                      <button className="rounded-full p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${quiz.title}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleQuizzes.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-slate-500">No quizzes match your current filters yet.</div>
            ) : null}

            <div className="flex justify-center border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button className="text-sm font-semibold text-primary transition hover:underline">View All Quizzes</button>
            </div>
          </Card>
        </section>

        <Footer />
      </main>
    </div>
  );
}
