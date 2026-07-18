import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
  Loader2,
  Plus,
  Quote,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import Footer from '../../ui/Footer';
import { AdminHeader, AdminSidebar, ButtonPrimary, Card, ToastContainer, useToast } from '../../ui';
import logoicon from '../../assets/icons/logo.png';
import { getAuthSession } from '../../services/authService';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Quizzes', icon: FileText, to: '/admin/quizzes' },
  { label: 'Past Papers', icon: ShieldCheck, to: '/admin/past-papers' },
  { label: 'Users', icon: Users, to: '/admin/users', active: true },

  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export default function AdminUserManage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  
  const [users, setUsers] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    school_name: '',
    grade: 'Grade 5',
    status: 'Active',
    file: null,
  });

  // Performance Modal State
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [performanceUser, setPerformanceUser] = useState(null);
  const [performanceData, setPerformanceData] = useState({ quizAttempts: [], badges: [] });
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(false);

  const handleOpenPerformanceModal = async (user) => {
    setPerformanceUser(user);
    setPerformanceData({ quizAttempts: [], badges: [] });
    setIsPerformanceModalOpen(true);
    setIsPerformanceLoading(true);

    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      toast.error('Authorization expired. Please login again.');
      setIsPerformanceLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}/performance`, {
        headers: {
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson?.message || 'Failed to fetch performance data.');
      }

      if (resJson?.data) {
        setPerformanceData({
          quizAttempts: resJson.data.quizAttempts || [],
          badges: resJson.data.badges || [],
        });
        if (resJson.data.user) {
          setPerformanceUser(resJson.data.user);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error loading performance details.');
    } finally {
      setIsPerformanceLoading(false);
    }
  };

  // Fetch Users and Grades
  const loadData = async () => {
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      navigate('/admin/login');
      return;
    }

    setIsLoading(true);
    try {
      const [usersResponse, gradesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${session.tokens.accessToken}`,
          },
        }),
        fetch(`${API_BASE_URL}/app/grades`, {
          headers: {
            Authorization: `Bearer ${session.tokens.accessToken}`,
          },
        }),
      ]);

      if (!usersResponse.ok) {
        const errJson = await usersResponse.json().catch(() => ({}));
        throw new Error(errJson?.message || 'Failed to fetch users.');
      }
      const usersData = await usersResponse.json();
      if (Array.isArray(usersData?.data?.users)) {
        setUsers(usersData.data.users);
      }

      if (!gradesResponse.ok) {
        const errJson = await gradesResponse.json().catch(() => ({}));
        throw new Error(errJson?.message || 'Failed to fetch grades.');
      }
      const gradesData = await gradesResponse.json();
      const grades = Array.isArray(gradesData?.data)
        ? gradesData.data
            .map((grade) => grade.grade_name || grade.name || grade.title)
            .filter(Boolean)
        : [];
      setGradeOptions(grades);
      if (grades.length > 0) {
        setFormData((prev) => ({ ...prev, grade: grades[0] }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load user directories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      fullname: '',
      username: '',
      email: '',
      password: '',
      school_name: '',
      grade: gradeOptions[0] || 'Grade 5',
      status: 'Active',
      file: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      fullname: user.fullname || '',
      username: user.username || '',
      email: user.email || '',
      password: '', // Not editing password here
      school_name: user.school_name || '',
      grade: user.grade || 'Grade 5',
      status: user.status || 'Active',
      file: null,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      toast.error('Authorization expired. Please login again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingUser
        ? `${API_BASE_URL}/admin/users/${editingUser.id}`
        : `${API_BASE_URL}/admin/users`;
      const method = editingUser ? 'PUT' : 'POST';

      // Build FormData payload
      const payload = new FormData();
      payload.append('fullname', formData.fullname.trim());
      payload.append('email', formData.email.trim());
      payload.append('school_name', formData.school_name.trim());
      payload.append('grade', formData.grade);

      if (editingUser) {
        payload.append('status', formData.status);
      } else {
        payload.append('username', formData.username.trim());
        payload.append('password', formData.password);
      }

      if (formData.file) {
        payload.append('file', formData.file);
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: payload,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to save the user.');
      }

      setIsModalOpen(false);
      toast.success(editingUser ? 'User details updated successfully.' : 'New user created successfully.');

      // Update local state immediately from the API response (avoids stale profile_url)
      const savedUser = data?.data?.user;
      if (savedUser) {
        if (editingUser) {
          // Replace the matching user in state with the full updated record
          setUsers((current) =>
            current.map((u) => (u.id === savedUser.id ? { ...u, ...savedUser } : u))
          );
        } else {
          // Prepend new user
          setUsers((current) => [savedUser, ...current]);
        }
      } else {
        // Fallback: full re-fetch if API didn't return the user object
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred while saving the user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete the user "${user.fullname}"?`);
    if (!confirmDelete) return;

    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      toast.error('Authorization expired. Please login again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to delete the user.');
      }

      toast.success('User account deleted successfully.');
      setUsers((current) => current.filter((u) => u.id !== user.id));
    } catch (err) {
      toast.error(err.message || 'Error occurred while deleting user.');
    }
  };

  const handleToggleReviewVisibility = async (user) => {
    if (!user.review) return;

    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      toast.error('Authorization expired. Please login again.');
      return;
    }

    const newVisibility = !user.review.show_on_landing_page;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}/review/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: JSON.stringify({ show_on_landing_page: newVisibility }),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson?.message || 'Failed to toggle review visibility.');
      }

      toast.success(newVisibility ? 'Review is now displaying on the landing page.' : 'Review is now hidden from the landing page.');

      // Update local state immediately
      setUsers((current) =>
        current.map((u) => {
          if (u.id === user.id) {
            return {
              ...u,
              review: {
                ...u.review,
                show_on_landing_page: newVisibility,
              },
            };
          }
          return u;
        })
      );

      // If performanceUser is open, update its review too
      if (performanceUser && performanceUser.id === user.id) {
        setPerformanceUser((prev) => ({
          ...prev,
          review: {
            ...prev.review,
            show_on_landing_page: newVisibility,
          },
        }));
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred while updating review visibility.');
    }
  };

  // Helper to generate full profile image path
  const getProfileImageUrl = (profileUrl, fullname) => {
    if (profileUrl) {
      if (profileUrl.startsWith('/')) {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
        const baseUrl = apiBase.replace('/api/v1', '');
        if (profileUrl.startsWith('/api/v1/uploads/')) {
          return `${baseUrl}${profileUrl}`;
        }
        return `${apiBase}${profileUrl}`;
      }
      return profileUrl;
    }
    const initials = fullname
      ?.split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase() || 'U';
    return `https://api.dicebear.com/9.x/initials/svg?seed=${initials}&background=%23ffffff`;
  };

  const USERS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = `${user.fullname} ${user.email} ${user.grade} ${user.school_name || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All Status' || user.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, selectedStatus]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const visibleUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const activeCount = useMemo(() => users.filter((u) => u.status === 'Active').length, [users]);
  const inactiveCount = useMemo(() => users.filter((u) => u.status === 'Inactive').length, [users]);

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

              <ButtonPrimary
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
              >
                <Plus size={16} /> Add New User
              </ButtonPrimary>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total Users</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{users.length}</p>
              </Card>
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Active Students</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{activeCount}</p>
              </Card>
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Inactive Students</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{inactiveCount}</p>
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

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="mt-2 text-sm">Loading users from database...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">Email</th>
                        <th className="px-6 py-4 font-semibold font-semibold">School</th>
                        <th className="px-6 py-4 font-semibold text-center">Grade</th>
                        <th className="px-6 py-4 font-semibold text-center">Review</th>
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
                              <img
                                src={getProfileImageUrl(user.profile_url, user.fullname)}
                                alt={user.fullname}
                                className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm"
                                onError={(e) => {
                                  e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${user.fullname}&background=%23ffffff`;
                                }}
                              />
                              <span className="font-semibold text-slate-900">{user.fullname}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{user.email}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium max-w-[180px] truncate">
                            {user.school_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-primary">
                              {user.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {!user.review ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-400 border border-slate-200/60 select-none">
                                None
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleReviewVisibility(user)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs hover:scale-105 active:scale-95 ${
                                  user.review.show_on_landing_page
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                }`}
                                title="Click to toggle landing page visibility"
                              >
                                {user.review.show_on_landing_page ? <Eye size={12} /> : <EyeOff size={12} />}
                                {user.review.show_on_landing_page ? 'Displaying' : 'Hidden'}
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {user.joined_at
                              ? new Date(user.joined_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: '2-digit',
                                })
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                                user.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {user.status === 'Active' ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                              {user.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenPerformanceModal(user)}
                                className="rounded-full p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
                                aria-label={`View performance of ${user.fullname}`}
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(user)}
                                className="rounded-full p-2 text-slate-500 transition hover:bg-primary-fixed hover:text-primary cursor-pointer"
                                aria-label={`Edit ${user.fullname}`}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="rounded-full p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                aria-label={`Delete ${user.fullname}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {visibleUsers.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 m-6">
                    No users match your search criteria.
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <span className="text-sm text-slate-500">
                    Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * USERS_PER_PAGE + 1}–{Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} students
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                      .reduce((acc, page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) {
                          acc.push('...');
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-sm">…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setCurrentPage(item)}
                            className={`h-9 w-9 rounded-full text-sm font-bold transition cursor-pointer ${
                              currentPage === item
                                ? 'bg-primary text-white shadow-sm'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next <ArrowRight size={16} className="ml-1 inline" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </section>

        {/* Add/Edit Modal */}
        {isModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                    {editingUser ? 'Edit User' : 'New User'}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">
                    {editingUser ? 'Edit Student Details' : 'Register a new student'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Full Name
                    <input
                      value={formData.fullname}
                      onChange={(event) => setFormData((value) => ({ ...value, fullname: event.target.value }))}
                      placeholder="Sahan Kaushalya"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                      required
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Email Address
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) => setFormData((value) => ({ ...value, email: event.target.value }))}
                      placeholder="sahan@example.com"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Username
                    <input
                      value={formData.username}
                      onChange={(event) => setFormData((value) => ({ ...value, username: event.target.value }))}
                      placeholder="sahan123"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white disabled:opacity-50 disabled:bg-slate-100"
                      required
                      disabled={!!editingUser}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Grade
                    <select
                      value={formData.grade}
                      onChange={(event) => setFormData((value) => ({ ...value, grade: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                    >
                      {gradeOptions.length > 0 ? (
                        gradeOptions.map((grade) => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))
                      ) : (
                        <>
                          <option value="Grade 5">Grade 5</option>
                          <option value="Grade 6">Grade 6</option>
                        </>
                      )}
                    </select>
                  </label>
                </div>

                {!editingUser && (
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(event) => setFormData((value) => ({ ...value, password: event.target.value }))}
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                      required
                    />
                  </label>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    School Name
                    <input
                      value={formData.school_name}
                      onChange={(event) => setFormData((value) => ({ ...value, school_name: event.target.value }))}
                      placeholder="Central College"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                      required
                    />
                  </label>

                  {editingUser && (
                    <label className="block text-sm font-semibold text-slate-700">
                      Account Status
                      <select
                        value={formData.status}
                        onChange={(event) => setFormData((value) => ({ ...value, status: event.target.value }))}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </label>
                  )}
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Profile Picture
                  <div className="mt-2 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <img
                      src={
                        formData.file
                          ? URL.createObjectURL(formData.file)
                          : getProfileImageUrl(editingUser?.profile_url, formData.fullname)
                      }
                      alt="Avatar Preview"
                      className="h-16 w-16 rounded-full object-cover border border-slate-200 bg-white"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${formData.fullname || 'U'}&background=%23ffffff`;
                      }}
                    />
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setFormData((value) => ({ ...value, file }));
                        }}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-primary-container file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:cursor-pointer"
                      />
                      <p className="mt-1 text-xs text-slate-400">Allowed formats: JPG, PNG, WEBP. Max size: 3MB.</p>
                    </div>
                  </div>
                </label>

                <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingUser(null);
                    }}
                    className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <ButtonPrimary
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold disabled:opacity-55"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-1 animate-spin" size={16} /> Saving...
                      </>
                    ) : (
                      'Save Student'
                    )}
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* User Performance Modal */}
        {isPerformanceModalOpen && performanceUser ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={getProfileImageUrl(performanceUser.profile_url, performanceUser.fullname)}
                    alt={performanceUser.fullname}
                    className="h-16 w-16 rounded-full object-cover border border-slate-200"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${performanceUser.fullname}&background=%23ffffff`;
                    }}
                  />
                  <div>
                    <span className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Student Performance</span>
                    <h3 className="text-2xl font-black text-slate-900">{performanceUser.fullname}</h3>
                    <p className="text-xs text-slate-500">{performanceUser.email} • {performanceUser.school_name || 'No school'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPerformanceModalOpen(false)}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Student Stats Summary Bar */}
              <div className="mt-4 grid grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4 text-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Grade</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">{performanceUser.grade || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Student Rank/Level</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">{performanceUser.level || 'Starter'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">XP Gained</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">{performanceUser.current_xp} XP</p>
                </div>
              </div>

              {/* Scholarship & Review Section */}
              {performanceUser.review ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">Student Testimony</p>
                      <h4 className="mt-1 text-lg font-black text-slate-900">Scholarship & Review</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-700">
                        Score: {performanceUser.review.scholarship_marks}/200
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < performanceUser.review.review_rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => handleToggleReviewVisibility(performanceUser)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition shadow-xs hover:scale-105 active:scale-95 ${
                          performanceUser.review.show_on_landing_page
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {performanceUser.review.show_on_landing_page ? <Eye size={12} /> : <EyeOff size={12} />}
                        {performanceUser.review.show_on_landing_page ? 'Showing on Landing Page' : 'Hidden on Landing Page'}
                      </button>
                    </div>
                  </div>
                  <div className="relative mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 italic text-slate-600">
                    <Quote size={24} className="absolute text-slate-200 right-3 top-3 pointer-events-none rotate-180" />
                    <p className="text-sm leading-relaxed pr-8">"{performanceUser.review.review_text}"</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
                  <p className="text-sm font-semibold text-slate-400">No Scholarship & Review submitted by this student yet.</p>
                </div>
              )}

              {isPerformanceLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="mt-2 text-sm">Fetching student badges and quiz scores...</p>
                </div>
              ) : (
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  
                  {/* Left Column: Quiz History */}
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                      <Sparkles size={18} className="text-primary" /> Quiz Attempts ({performanceData.quizAttempts.length})
                    </h4>
                    
                    <div className="overflow-y-auto max-h-[300px] border border-slate-100 rounded-2xl bg-white shadow-inner p-2 space-y-2">
                      {performanceData.quizAttempts.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8">No quiz attempts yet.</p>
                      ) : (
                        performanceData.quizAttempts.map((attempt) => (
                          <div key={attempt.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate" title={attempt.quiz_name}>{attempt.quiz_name}</p>
                              <p className="text-xxs text-slate-400">
                                {attempt.completed_at
                                  ? new Date(attempt.completed_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'In Progress'}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                                attempt.score >= 75 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : attempt.score >= 50 
                                  ? 'bg-amber-50 text-amber-700' 
                                  : 'bg-rose-50 text-rose-700'
                              }`}>
                                {attempt.score !== null ? `${Math.round(attempt.score)}%` : 'N/A'}
                              </span>
                              <p className="text-xxs text-emerald-600 font-bold mt-0.5">+{attempt.xp_gained || 0} XP</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Badge Gallery */}
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-primary" /> Collected Badges ({performanceData.badges.length})
                    </h4>
                    
                    <div className="overflow-y-auto max-h-[300px] border border-slate-100 rounded-2xl bg-white shadow-inner p-3">
                      {performanceData.badges.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8">No badges earned yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {performanceData.badges.map((badge) => (
                            <div key={badge.id} className="flex gap-2.5 items-center p-2 rounded-xl bg-slate-50 border border-slate-100 hover:scale-101 transition-transform">
                              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-fixed/20 flex items-center justify-center text-primary font-bold">
                                {badge.icon_url ? (
                                  <img
                                    src={
                                      badge.icon_url.startsWith('/')
                                        ? `${API_BASE_URL}/uploads${badge.icon_url}`
                                        : badge.icon_url
                                    }
                                    alt={badge.name}
                                    className="h-8 w-8 object-contain"
                                    onError={(e) => {
                                      e.target.src = `https://api.dicebear.com/9.x/shapes/svg?seed=${badge.name}`;
                                    }}
                                  />
                                ) : (
                                  '🏆'
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate" title={badge.name}>{badge.name}</p>
                                <p className="text-sm text-slate-400 truncate text-wrap" title={badge.description}>{badge.description}</p>
                                <p className="text-[9px] text-slate-400 font-semibold text-emerald-700">
                                  {badge.earned_at
                                    ? new Date(badge.earned_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                      })
                                    : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* Close Button Footer */}
              <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPerformanceModalOpen(false)}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 cursor-pointer shadow-soft"
                >
                  Close Profile
                </button>
              </div>

            </div>
          </div>
        ) : null}

        <Footer />
      </main>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}
