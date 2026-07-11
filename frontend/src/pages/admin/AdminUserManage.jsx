import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Ban,
  CheckCircle2,
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
  { label: 'Quizzes', icon: FileText, to: '/admin/quizzes' },
  { label: 'Past Papers', icon: ShieldCheck, to: '/admin/past-papers' },
  { label: 'Users', icon: Users, to: '/admin/users', active: true },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

const USERS = [
  {
    id: 1,
    name: 'Leo Spark',
    email: 'leo.spark@example.com',
    grade: 'Grade 3',
    joined: 'Oct 12, 2023',
    status: 'Active',
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    id: 2,
    name: 'Mia Bright',
    email: 'mia.b@example.com',
    grade: 'Grade 5',
    joined: 'Nov 05, 2023',
    status: 'Active',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    id: 3,
    name: 'Sam Cloud',
    email: 'sammy.c@example.com',
    grade: 'Grade 2',
    joined: 'Jan 22, 2024',
    status: 'Inactive',
    accent: 'from-slate-500 to-slate-700',
  },
  {
    id: 4,
    name: 'Zoe Star',
    email: 'zoe.star@example.com',
    grade: 'Grade 4',
    joined: 'Feb 14, 2024',
    status: 'Active',
    accent: 'from-emerald-500 to-teal-500',
  },
];

export default function AdminUserManage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const visibleUsers = useMemo(() => {
    return USERS.filter((user) => {
      const matchesSearch = `${user.name} ${user.email} ${user.grade}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All Status' || user.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus]);

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
                  <Sparkles size={16} /> Learner Accounts
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <img src={logoicon} alt="Quiz Master logo" className="h-10 w-auto" />
                  <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Manage Users</h2>
                </div>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  Review learners, keep account records organized, and manage active or inactive students from one place.
                </p>
              </div>

              <ButtonPrimary className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold">
                <Plus size={16} /> Add New User
              </ButtonPrimary>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total Users</p>
                <p className="mt-3 text-3xl font-black text-slate-900">1,248</p>
              </Card>
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Active Today</p>
                <p className="mt-3 text-3xl font-black text-slate-900">312</p>
              </Card>
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Pending Review</p>
                <p className="mt-3 text-3xl font-black text-slate-900">18</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 pb-6 md:px-8 md:px-10">
          <Card className="overflow-hidden rounded-[2rem] border border-surface-container-highest bg-white/80 shadow-soft">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between md:p-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Student Directory</h3>
                <p className="mt-1 text-sm text-slate-500">Search, filter, and manage learner accounts confidently.</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <label className="relative block">
                  <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search students"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:bg-white"
                  />
                </label>

                <label className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    className="appearance-none rounded-full border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary focus:bg-white"
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold text-center">Grade</th>
                    <th className="px-6 py-4 font-semibold">Joined</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {visibleUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${user.accent} text-sm font-black text-white`}>
                            {user.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')}
                          </div>
                          <span className="font-semibold text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{user.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-primary">
                          {user.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{user.joined}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                            user.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {user.status === 'Active' ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-full p-2 text-slate-500 transition hover:bg-primary-fixed hover:text-primary" aria-label={`Edit ${user.name}`}>
                            <Edit3 size={16} />
                          </button>
                          <button className="rounded-full p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${user.name}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <span className="text-sm text-slate-500">Showing {visibleUsers.length} of {USERS.length} students</span>
              <div className="flex gap-2">
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100" disabled>
                  Previous
                </button>
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
                  Next
                  <ArrowRight size={16} className="ml-2 inline" />
                </button>
              </div>
            </div>
          </Card>
        </section>

        <Footer />
      </main>
    </div>
  );
}
