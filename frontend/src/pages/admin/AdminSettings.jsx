import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Save,
  Settings,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import Footer from '../../ui/Footer';
import { AdminHeader, AdminSidebar, ButtonPrimary, Card, ToastContainer, useToast } from '../../ui';
import logoicon from '../../assets/icons/logo.png';
import { clearAuthSession, getAuthSession, saveAuthSession } from '../../services/authService';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Quizzes', icon: FileText, to: '/admin/quizzes' },
  { label: 'Past Papers', icon: ShieldCheck, to: '/admin/past-papers' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Settings', icon: Settings, to: '/admin/settings', active: true },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const getAvatarUrl = (profileUrl, name) => {
  if (profileUrl) {
    if (profileUrl.startsWith('http')) return profileUrl;
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
    return `${base}${profileUrl}`;
  }
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'AD';
  return `https://api.dicebear.com/9.x/initials/svg?seed=${initials}&background=%23ffffff`;
};

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  
];

export default function AdminSettings() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);

  const [admin, setAdmin] = useState(null);
  const [profileForm, setProfileForm] = useState({ admin_name: '', email: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // OpenRouter key state
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const loadProfile = async () => {
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      navigate('/admin/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/profile`, {
        headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
      });
      const resJson = await response.json();
      if (!response.ok) throw new Error(resJson?.message || 'Failed to load profile.');

      const data = resJson.data;
      setAdmin(data);
      setProfileForm({ admin_name: data.admin_name || '', email: data.email || '' });

      // Fetch OpenRouter API key
      const keyResponse = await fetch(`${API_BASE_URL}/admin/settings/openrouter-key`, {
        headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
      });
      const keyJson = await keyResponse.json();
      if (keyResponse.ok && keyJson?.data) {
        setOpenRouterKey(keyJson.data.openrouter_key || '');
      }
    } catch (err) {
      toast.error(err.message || 'Could not load admin profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = async (e) => {
    e.preventDefault();
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      navigate('/admin/login');
      return;
    }
    setIsSavingKey(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/openrouter-key`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: JSON.stringify({ openrouter_key: openRouterKey }),
      });
      const resJson = await response.json();
      if (!response.ok) throw new Error(resJson?.message || 'Failed to save API key.');
      toast.success('OpenRouter API Key saved successfully! 🔑');
    } catch (err) {
      toast.error(err.message || 'Could not save API key.');
    } finally {
      setIsSavingKey(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.admin_name.trim()) {
      toast.error('Display name is required.');
      return;
    }
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) { navigate('/admin/login'); return; }

    setIsSavingProfile(true);
    try {
      const payload = new FormData();
      payload.append('admin_name', profileForm.admin_name.trim());
      payload.append('email', profileForm.email.trim());
      if (avatarFile) payload.append('file', avatarFile);

      const response = await fetch(`${API_BASE_URL}/admin/settings/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
        body: payload,
      });
      const resJson = await response.json();
      if (!response.ok) throw new Error(resJson?.message || 'Failed to update profile.');

      const updatedData = resJson.data;
      const currentSession = getAuthSession();
      if (currentSession) {
        currentSession.user = { ...currentSession.user, ...updatedData };
        saveAuthSession({ tokens: currentSession.tokens, data: currentSession.user });
      }

      setAdmin(updatedData);
      setAvatarFile(null);
      setAvatarPreview(null);
      window.dispatchEvent(new Event('adminProfileUpdated'));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Could not save profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { current_password, new_password, confirm_password } = passwordForm;

    if (!current_password || !new_password || !confirm_password) {
      toast.error('All password fields are required.');
      return;
    }
    if (new_password.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (new_password !== confirm_password) {
      toast.error('New passwords do not match.');
      return;
    }

    const session = getAuthSession();
    if (!session?.tokens?.accessToken) { navigate('/admin/login'); return; }

    setIsSavingPassword(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: JSON.stringify({ current_password, new_password }),
      });
      const resJson = await response.json();
      if (!response.ok) throw new Error(resJson?.message || 'Failed to change password.');

      toast.success('Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.message || 'Could not change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate('/admin/login');
  };

  const currentAvatar = avatarPreview || getAvatarUrl(admin?.profile_url, admin?.admin_name);

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
      <AdminSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen pb-16 md:ml-72">
        <AdminHeader onMenuClick={() => setSidebarOpen((v) => !v)} />

        {/* Hero Banner */}
        <section className="px-4 py-6 md:px-8 md:py-8 md:px-10">
          <div className="overflow-hidden rounded-[2rem] border border-surface-container-highest bg-gradient-to-br from-primary-fixed via-white to-surface-container-lowest p-6 shadow-soft md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-full">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-primary shadow-sm">
                  <Sparkles size={16} /> Admin Settings
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <img src={logoicon} alt="Quiz Master logo" className="h-10 w-auto" />
                  <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Account Settings</h2>
                </div>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  Manage your admin profile, update your password, and personalise your experience.
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 cursor-pointer"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-4 pb-6 md:px-8 md:px-10">
          {isLoading ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-slate-500">
              <Loader2 className="animate-spin text-primary" size={36} />
              <p className="mt-3 text-sm font-semibold">Loading settings...</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

              {/* Left: Avatar Card + Tab Nav */}
              <div className="flex flex-col gap-5">
                <Card className="overflow-hidden rounded-[2rem] border border-surface-container-highest bg-white/80 p-6 shadow-soft text-center">
                  <div className="relative mx-auto w-fit">
                    <img
                      src={currentAvatar}
                      alt={admin?.admin_name}
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${admin?.admin_name || 'AD'}&background=%23ffffff`;
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md transition hover:scale-110 cursor-pointer"
                      title="Change avatar"
                    >
                      <Camera size={14} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                    >
                      <X size={12} /> Remove new photo
                    </button>
                  )}

                  <div className="mt-4">
                    <p className="text-lg font-black text-slate-900">{admin?.admin_name}</p>
                    <p className="text-sm text-slate-500">{admin?.email}</p>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-primary">
                      <ShieldCheck size={12} /> Administrator
                    </span>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4 text-left space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Username</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-700">@{admin?.username}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Member Since</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-700">
                        {admin?.joined_at
                          ? new Date(admin.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden rounded-[2rem] border border-surface-container-highest bg-white/80 shadow-soft">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex w-full items-center gap-3 px-5 py-4 text-sm font-bold transition cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-primary-fixed/40 text-primary border-l-4 border-primary'
                            : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                        }`}
                      >
                        <Icon size={18} />
                        {tab.label}
                      </button>
                    );
                  })}
                </Card>
              </div>

              {/* Right: Form Panels */}
              <div>
                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                  <Card className="overflow-hidden rounded-[2rem] border border-surface-container-highest bg-white/80 shadow-soft">
                    <div className="border-b border-slate-100 p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                          <User size={18} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900">Profile Information</h3>
                          <p className="text-sm text-slate-500">Update your display name, email, and profile avatar.</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                      {/* Avatar inline */}
                      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <img
                          src={currentAvatar}
                          alt="Avatar"
                          className="h-16 w-16 rounded-full object-cover border-2 border-white shadow"
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${admin?.admin_name || 'AD'}&background=%23ffffff`;
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Profile Photo</p>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-4 py-2 text-xs font-bold text-primary transition hover:bg-primary-fixed/30 cursor-pointer"
                          >
                            <Camera size={13} /> Change Photo
                          </button>
                          {avatarFile && (
                            <p className="mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 size={12} /> {avatarFile.name}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP · Max 5 MB</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Display Name
                          <input
                            value={profileForm.admin_name}
                            onChange={(e) => setProfileForm((p) => ({ ...p, admin_name: e.target.value }))}
                            placeholder="e.g. Sahan Admin"
                            required
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                          />
                        </label>

                        <label className="block text-sm font-semibold text-slate-700">
                          Email Address
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                            placeholder="admin@quizmaster.lk"
                            required
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                          />
                        </label>
                      </div>

                      <label className="block text-sm font-semibold text-slate-700">
                        Username
                        <input
                          value={admin?.username || ''}
                          disabled
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-400 outline-none cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-slate-400">Username cannot be changed for security reasons.</p>
                      </label>

                      <div className="flex justify-end border-t border-slate-100 pt-5">
                        <ButtonPrimary
                          type="submit"
                          disabled={isSavingProfile}
                          className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold disabled:opacity-55"
                        >
                          {isSavingProfile ? (
                            <><Loader2 size={16} className="animate-spin" /> Saving...</>
                          ) : (
                            <><Save size={16} /> Save Profile</>
                          )}
                        </ButtonPrimary>
                      </div>
                    </form>
                  </Card>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                  <div className="space-y-5">
                    <Card className="overflow-hidden rounded-[2rem] border border-surface-container-highest bg-white/80 shadow-soft">
                      <div className="border-b border-slate-100 p-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                            <KeyRound size={18} />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900">Change Password</h3>
                            <p className="text-sm text-slate-500">Use a strong, unique password for your admin account.</p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleChangePassword} className="p-6 space-y-5">
                        <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4">
                          <p className="text-xs font-bold text-amber-700 mb-2">Password requirements</p>
                          <ul className="space-y-1">
                            {[
                              'Minimum 8 characters',
                              'Mix of letters, numbers and symbols recommended',
                              'Do not reuse old passwords',
                            ].map((tip) => (
                              <li key={tip} className="flex items-center gap-2 text-xs text-amber-600">
                                <ShieldCheck size={12} className="flex-shrink-0" /> {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <label className="block text-sm font-semibold text-slate-700">
                          Current Password
                          <div className="relative mt-2">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              value={passwordForm.current_password}
                              onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                              placeholder="Enter current password"
                              required
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-primary focus:bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </label>

                        <label className="block text-sm font-semibold text-slate-700">
                          New Password
                          <div className="relative mt-2">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordForm.new_password}
                              onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                              placeholder="Enter new password"
                              required
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-primary focus:bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {passwordForm.new_password && (
                            <div className="mt-2">
                              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    passwordForm.new_password.length < 8
                                      ? 'w-1/4 bg-rose-400'
                                      : passwordForm.new_password.length < 12
                                      ? 'w-2/4 bg-amber-400'
                                      : 'w-full bg-emerald-500'
                                  }`}
                                />
                              </div>
                              <p className={`mt-1 text-xs font-semibold ${
                                passwordForm.new_password.length < 8
                                  ? 'text-rose-500'
                                  : passwordForm.new_password.length < 12
                                  ? 'text-amber-500'
                                  : 'text-emerald-600'
                              }`}>
                                {passwordForm.new_password.length < 8
                                  ? 'Too short'
                                  : passwordForm.new_password.length < 12
                                  ? 'Moderate strength'
                                  : 'Strong password ✓'}
                              </p>
                            </div>
                          )}
                        </label>

                        <label className="block text-sm font-semibold text-slate-700">
                          Confirm New Password
                          <div className="relative mt-2">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordForm.confirm_password}
                              onChange={(e) => setPasswordForm((p) => ({ ...p, confirm_password: e.target.value }))}
                              placeholder="Re-enter new password"
                              required
                              className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition focus:bg-white ${
                                passwordForm.confirm_password && passwordForm.confirm_password !== passwordForm.new_password
                                  ? 'border-rose-300 focus:border-rose-400'
                                  : passwordForm.confirm_password && passwordForm.confirm_password === passwordForm.new_password
                                  ? 'border-emerald-300 focus:border-emerald-400'
                                  : 'border-slate-200 focus:border-primary'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {passwordForm.confirm_password && passwordForm.confirm_password !== passwordForm.new_password && (
                            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rose-500">
                              <ShieldOff size={12} /> Passwords do not match
                            </p>
                          )}
                          {passwordForm.confirm_password && passwordForm.confirm_password === passwordForm.new_password && (
                            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <CheckCircle2 size={12} /> Passwords match
                            </p>
                          )}
                        </label>

                        <div className="flex justify-end border-t border-slate-100 pt-5">
                          <ButtonPrimary
                            type="submit"
                            disabled={isSavingPassword}
                            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold disabled:opacity-55"
                          >
                            {isSavingPassword ? (
                              <><Loader2 size={16} className="animate-spin" /> Updating...</>
                            ) : (
                              <><Lock size={16} /> Update Password</>
                            )}
                          </ButtonPrimary>
                        </div>
                      </form>
                    </Card>

                    {/* Danger zone */}
                    <Card className="overflow-hidden rounded-[2rem] border border-rose-200 bg-rose-50/40 shadow-soft">
                      <div className="p-6">
                        <h3 className="text-base font-black text-rose-700 flex items-center gap-2">
                          <ShieldOff size={18} /> Danger Zone
                        </h3>
                        <p className="mt-1 text-sm text-rose-600/80">
                          Signing out will end your current admin session. You will need to log in again to access the panel.
                        </p>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-300 bg-white px-5 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                        >
                          <LogOut size={15} /> Sign Out of Admin Panel
                        </button>
                      </div>
                    </Card>
                  </div>
                 )}

               
              </div>
            </div>
          )}
        </section>

        <Footer />
      </main>

      <ToastContainer />
    </div>
  );
}
