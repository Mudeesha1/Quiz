import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, ShieldCheck } from 'lucide-react';
import { clearAuthSession } from '../services/authService';

function NavItem({ icon: Icon, label, to = '#', active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
        active ? 'bg-primary-container text-white shadow-sm' : 'text-slate-600 hover:bg-surface-container-highest'
      }`}
    >
      <Icon size={18} className={active ? 'text-white' : 'text-slate-500'} strokeWidth={2.2} />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export function AdminSidebar({ items, open, onClose, onAddQuizClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddQuizClick = () => {
    if (location.pathname === '/admin/quizzes') {
      if (onAddQuizClick) {
        onAddQuizClick();
      }
    } else {
      navigate('/admin/quizzes', { state: { openAddModal: true } });
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      {open ? <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} /> : null}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-surface-container-highest bg-surface-container py-6 transition-transform duration-300 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="mb-10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary-container text-white shadow-sm">
              <ShieldCheck size={24} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-primary/80">Admin Panel</p>
              <h2 className="text-xl font-black text-slate-900">Quiz Master</h2>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">Manage the Quiz Master experience.</p>
        </div>

        <nav className="space-y-1 px-2">
          {items.map((item) => (
            <NavItem key={item.label} icon={item.icon} label={item.label} to={item.to} active={item.active} />
          ))}
        </nav>

        <div className="mt-auto px-6 space-y-3">
          <button
            onClick={handleAddQuizClick}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary-container px-4 py-3 text-sm font-bold text-secondary shadow-sm transition hover:opacity-95 cursor-pointer"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-secondary">+</span>
            Add New Quiz
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 shadow-sm transition hover:bg-rose-100/50 cursor-pointer animate-fade-in"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}

export function AdminHeader({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-container bg-surface px-4 py-4 shadow-sm md:px-8">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-container bg-white text-slate-700 shadow-sm md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-500">Overview</p>
          <h1 className="text-2xl font-black text-slate-900">Quiz Master Admin</h1>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-full border border-surface-container bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Settings
          </button>
        </div>
      </div>
    </header>
  );
}
