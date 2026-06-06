import { useState } from 'react';
import { ArrowRight, FileText, LayoutDashboard, ShieldCheck, Settings, Users } from 'lucide-react';
import Footer from '../../ui/Footer';
import { AdminHeader, AdminSidebar, ButtonPrimary, Card } from '../../ui';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', active: true },
  { label: 'Quizzes', icon: FileText, to: '/admin/quizzes' },
  { label: 'Past Papers', icon: ShieldCheck, to: '/admin/past-papers' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

const STAT_CARDS = [
  { title: 'Total Students', value: '1,240', accent: 'bg-indigo-50 text-indigo-700', icon: ShieldCheck },
  { title: 'Total Quizzes', value: '45', accent: 'bg-amber-50 text-amber-700', icon: FileText },
  { title: 'Total Papers', value: '15', accent: 'bg-emerald-50 text-emerald-700', icon: LayoutDashboard },
];

const RECENT_ACTIVITY = [
  { name: 'Leo Martinez', grade: 'Year 4', quiz: 'Fractions Adventure', score: '95%', date: 'Today, 10:42 AM' },
  { name: 'Sarah Chen', grade: 'Year 5', quiz: 'History: Romans', score: '88%', date: 'Today, 09:15 AM' },
  { name: 'Jamal Wright', grade: 'Year 6', quiz: 'Science: Solar System', score: '72%', date: 'Yesterday, 14:30 PM' },
  { name: 'Mia Thompson', grade: 'Year 4', quiz: 'Spelling Bee Prep', score: '45%', date: 'Yesterday, 11:20 AM' },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
      <AdminSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen pb-12 md:ml-72">
        <AdminHeader onMenuClick={() => setSidebarOpen((value) => !value)} />

        <section className="p-4 md:p-8 md:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Admin Overview</h2>
              <p className="mt-2 text-slate-600">Welcome back. Here’s what’s happening today.</p>
            </div>
            <ButtonPrimary className="w-full justify-center gap-2 py-3 text-sm md:w-auto md:px-6 md:text-base">
              Add New Quiz
              <ArrowRight size={16} />
            </ButtonPrimary>
          </div>
        </section>

        <section className="p-4 md:p-8 md:px-10">
          <div className="grid gap-4 md:grid-cols-3">
            {STAT_CARDS.map(({ title, value, accent, icon: Icon }) => (
              <Card key={title} className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
                    <p className="mt-4 text-3xl font-black text-slate-900">{value}</p>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${accent}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="p-4 md:p-8 md:px-10">
          <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Recent Student Activity</h3>
                <p className="mt-1 text-sm text-slate-500">Track the latest quiz activity across your learners.</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-slate-50">
                View All
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 font-semibold">Student</th>
                    <th className="pb-3 font-semibold">Grade</th>
                    <th className="pb-3 font-semibold">Quiz</th>
                    <th className="pb-3 font-semibold">Score</th>
                    <th className="pb-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {RECENT_ACTIVITY.map((activity) => (
                    <tr key={activity.name} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-medium text-slate-900">{activity.name}</td>
                      <td className="py-4 text-slate-500">{activity.grade}</td>
                      <td className="py-4 text-slate-700">{activity.quiz}</td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          activity.score.endsWith('%') && parseInt(activity.score, 10) >= 90
                            ? 'bg-emerald-100 text-emerald-700'
                            : activity.score.endsWith('%') && parseInt(activity.score, 10) >= 70
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {activity.score}
                        </span>
                      </td>
                      <td className="py-4 text-right text-slate-500">{activity.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <Footer />
      </main>
    </div>
  );
}
