import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, Settings, ShieldCheck } from 'lucide-react';
import { clearAuthSession, getAuthSession } from '../services/authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/** Resolve a profile_url (relative or absolute) to a full URL */
function resolveAvatar(profileUrl, name) {
  if (profileUrl) {
    if (profileUrl.startsWith('http')) return profileUrl;
    const base = API_BASE_URL.replace('/api/v1', '');
    return `${base}${profileUrl}`;
  }
  const initials = (name || 'AD')
    .split(' ')
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${initials}&background=%23ffffff`;
}

/** Sidebar nav item — auto-detects active from current location */
function NavItem({ icon: Icon, label, to = '#' }) {
  const location = useLocation();
  const active = location.pathname === to;
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
      if (onAddQuizClick) onAddQuizClick();
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
            <NavItem key={item.label} icon={item.icon} label={item.label} to={item.to} />
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

/** Live Sri Lankan date & time hook (Asia/Colombo = UTC+5:30) */
function useSriLankaTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Format: "Mon, 14 Jul 2026" and "08:06:04 PM"
  const datePart = now.toLocaleString('en-LK', {
    timeZone: 'Asia/Colombo',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const timePart = now.toLocaleString('en-LK', {
    timeZone: 'Asia/Colombo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return { datePart, timePart };
}

export function AdminHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const { datePart, timePart } = useSriLankaTime();
  const [adminUser, setAdminUser] = useState(null);

  const fetchAdminProfile = async () => {
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/profile`, {
        headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
      });
      const resJson = await response.json();
      if (response.ok && resJson?.data) {
        setAdminUser(resJson.data);
      }
    } catch (e) {
      console.error("Error fetching admin profile in header:", e);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAdminProfile();

    // Read initial session fallback
    const session = getAuthSession();
    if (session?.user) {
      setAdminUser(session.user);
    }

    // Listen to profile updates
    window.addEventListener('adminProfileUpdated', fetchAdminProfile);
    window.addEventListener('profileUpdated', fetchAdminProfile);
    return () => {
      window.removeEventListener('adminProfileUpdated', fetchAdminProfile);
      window.removeEventListener('profileUpdated', fetchAdminProfile);
    };
  }, []);

  const avatarUrl = resolveAvatar(adminUser?.profile_url, adminUser?.admin_name);
  const adminName = adminUser?.admin_name || 'Admin';

  return (
    <header className="sticky top-0 z-40 border-b border-surface-container bg-surface px-4 py-3 shadow-sm md:px-8">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-container bg-white text-slate-700 shadow-sm md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Admin Panel</p>
          <h1 className="text-xl font-black text-slate-900 truncate">Quiz Master Admin</h1>
        </div>

        {/* Right side: date-time + settings btn + avatar */}
        <div className="flex items-center gap-3">
          {/* Sri Lanka Date & Time — visible on large screens */}
          <div className="hidden lg:flex flex-col items-end leading-tight">
            <span className="text-xs font-semibold text-slate-500">{datePart}</span>
            <span className="text-xs font-bold text-primary tabular-nums">{timePart}</span>
          </div>

          {/* Settings button */}
          <button
            type="button"
            id="admin-settings-btn"
            onClick={() => navigate('/admin/settings')}
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-surface-container bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
            title="Settings"
          >
            <Settings size={15} className="text-slate-500" />
            Settings
          </button>

          {/* Admin avatar pill — clickable, goes to settings */}
          <button
            type="button"
            id="admin-avatar-btn"
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-2.5 rounded-full border border-surface-container bg-white pl-1 pr-3 py-1 shadow-sm transition hover:bg-slate-50 cursor-pointer"
            title={`${adminName} — open settings`}
          >
            <img
              src={avatarUrl}
              alt={adminName}
              className="h-8 w-8 rounded-full object-cover border-2 border-white"
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(adminName)}&background=%23ffffff`;
              }}
            />
            <span className="hidden sm:block text-sm font-bold text-slate-700 max-w-[120px] truncate">
              {adminName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
