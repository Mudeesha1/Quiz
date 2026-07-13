import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Settings,
  Users,
  Loader2,
  TrendingUp,
  Award,
  Sparkles,
  PieChart,
  Calendar,
  X,
  Flame,
} from 'lucide-react';
import Footer from '../../ui/Footer';
import { AdminHeader, AdminSidebar, ButtonPrimary, Card, ToastContainer, useToast } from '../../ui';
import { getAuthSession } from '../../services/authService';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard', active: true },
  { label: 'Quizzes', icon: FileText, to: '/admin/quizzes' },
  { label: 'Past Papers', icon: ShieldCheck, to: '/admin/past-papers' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'AI Assistant', icon: Sparkles, to: '/admin/ai-assistant' },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Modal for all activity
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      navigate('/admin/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson?.message || 'Failed to fetch dashboard metrics.');
      }

      if (resJson?.data) {
        setStats(resJson.data);
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred while loading dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
      <AdminSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen pb-12 md:ml-72">
        <AdminHeader onMenuClick={() => setSidebarOpen((value) => !value)} />

        {/* Dashboard Title & Quick Actions */}
        <section className="p-4 md:p-8 md:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Admin Dashboard</h2>
              <p className="mt-2 text-slate-600">Review learning analytics, user registration, and system overview.</p>
            </div>
            <ButtonPrimary 
              onClick={() => navigate('/admin/quizzes')}
              className="w-full justify-center gap-2 py-3 text-sm md:w-auto md:px-6 md:text-base cursor-pointer"
            >
              Add New Quiz
              <ArrowRight size={16} />
            </ButtonPrimary>
          </div>
        </section>

        {isLoading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-slate-500">
            <Loader2 className="animate-spin text-primary" size={36} />
            <p className="mt-3 text-sm font-semibold">Aggregating database stats...</p>
          </div>
        ) : stats ? (
          <>
            {/* Stat Cards */}
            <section className="p-4 md:p-8 md:px-10 pt-0">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft hover:shadow-md transition">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total Students</p>
                      <p className="mt-4 text-3xl font-black text-slate-900">{stats.totalStudents}</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-700">
                      <Users size={24} />
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft hover:shadow-md transition">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total Quizzes</p>
                      <p className="mt-4 text-3xl font-black text-slate-900">{stats.totalQuizzes}</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-50 text-amber-700">
                      <FileText size={24} />
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft hover:shadow-md transition">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total Papers</p>
                      <p className="mt-4 text-3xl font-black text-slate-900">{stats.totalPapers}</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
                      <LayoutDashboard size={24} />
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Custom SVG Charts (5 Charts) */}
            <section className="p-4 md:p-8 md:px-10 pt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Chart 1: Grade Distribution */}
                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <PieChart size={18} className="text-primary" /> Grade Distribution
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Number of active student accounts per Grade</p>
                  
                  {stats.gradeDistribution.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-12">No grade information available.</p>
                  ) : (
                    <div className="mt-6 flex flex-col gap-4">
                      {stats.gradeDistribution.map((item, idx) => {
                        const maxCount = Math.max(...stats.gradeDistribution.map(g => g.count), 1);
                        const percentage = (item.count / maxCount) * 100;
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-16 text-xs font-bold text-slate-600 truncate" title={item.grade}>
                              {item.grade}
                            </span>
                            <div className="flex-1 h-3.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary/95 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs font-black text-slate-800">{item.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* Chart 2: Monthly Registrations Trend */}
                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp size={18} className="text-primary" /> Sign-up Trends
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Student registrations over last 6 months</p>
                  
                  {stats.monthlyRegistrations.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-12">No registration history available.</p>
                  ) : (
                    <div className="mt-8 flex h-40 items-end gap-3.5 px-2">
                      {stats.monthlyRegistrations.map((item, idx) => {
                        const maxRegCount = Math.max(...stats.monthlyRegistrations.map(r => r.count), 1);
                        const heightPercentage = (item.count / maxRegCount) * 80;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group cursor-pointer">
                            <div className="relative w-full flex items-end justify-center" style={{ height: `${Math.max(heightPercentage, 5)}%` }}>
                              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                                {item.count} users
                              </div>
                              <div
                                className="w-full max-w-[20px] h-full rounded-t-md bg-indigo-500 group-hover:bg-indigo-600 transition-all duration-500"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 truncate w-full text-center">
                              {item.month.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* Chart 3: Quiz Score Ranges */}
                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Award size={18} className="text-primary" /> Quiz Score Distribution
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Quiz performance metrics range groups</p>
                  
                  {stats.performanceRanges.reduce((acc, r) => acc + r.count, 0) === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-12">No attempts completed yet.</p>
                  ) : (
                    <div className="mt-6">
                      <div className="h-6 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                        {stats.performanceRanges.map((range, idx) => {
                          const totalAttempts = stats.performanceRanges.reduce((acc, r) => acc + r.count, 0) || 1;
                          const percentage = (range.count / totalAttempts) * 100;
                          if (range.count === 0) return null;
                          return (
                            <div
                              key={idx}
                              className="h-full transition-all duration-500"
                              style={{ width: `${percentage}%`, backgroundColor: range.color }}
                              title={`${range.name}: ${range.count} (${Math.round(percentage)}%)`}
                            />
                          );
                        })}
                      </div>
                      
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        {stats.performanceRanges.map((range, idx) => {
                          const totalAttempts = stats.performanceRanges.reduce((acc, r) => acc + r.count, 0) || 1;
                          const pct = totalAttempts > 0 ? (range.count / totalAttempts) * 100 : 0;
                          return (
                            <div key={idx} className="flex flex-col p-2.5 rounded-md border border-slate-100 bg-slate-50/50">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 truncate">
                                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: range.color }} />
                                {range.name}
                              </div>
                              <p className="mt-1 text-sm font-black text-slate-800">
                                {range.count} <span className="text-[10px] font-normal text-slate-400">({Math.round(pct)}%)</span>
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Chart 4: Student Account Status (Radial Donut Chart) */}
                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-indigo-500" /> Account Verification
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Comparison of Active vs. Inactive student profiles</p>
                  </div>
                  
                  <div className="my-6 flex items-center justify-center gap-6">
                    {/* SVG Radial Progress */}
                    {(() => {
                      const active = stats.accountStatus.active;
                      const inactive = stats.accountStatus.inactive;
                      const total = active + inactive || 1;
                      const activePercent = (active / total) * 100;
                      const radius = 35;
                      const circumference = 2 * Math.PI * radius;
                      const strokeDashoffset = circumference - (activePercent / 100) * circumference;

                      return (
                        <>
                          <div className="relative h-24 w-24 flex items-center justify-center">
                            <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                              {/* Track Circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                className="stroke-slate-100"
                                strokeWidth="8"
                                fill="transparent"
                              />
                              {/* Fill Circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                className="stroke-indigo-600 transition-all duration-1000 ease-out"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="text-lg font-black text-slate-800">{Math.round(activePercent)}%</span>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-indigo-600" />
                              Active: {active}
                            </div>
                            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-slate-200" />
                              Inactive: {inactive}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </Card>

                {/* Chart: Trending Subjects */}
                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <PieChart size={18} className="text-emerald-500" /> Trending Subjects
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Quiz attempts volume per Subject</p>
                  
                  {!stats.trendingSubjects || stats.trendingSubjects.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-12">No subject attempt data available.</p>
                  ) : (
                    <div className="mt-6 flex flex-col gap-4">
                      {stats.trendingSubjects.map((item, idx) => {
                        const maxCount = Math.max(...stats.trendingSubjects.map(s => s.count), 1);
                        const percentage = (item.count / maxCount) * 100;
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-24 text-xs font-bold text-slate-600 truncate" title={item.subject}>
                              {item.subject}
                            </span>
                            <div className="flex-1 h-3.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs font-black text-slate-800">{item.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* Quiz Overview Card */}
                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-500" /> Quiz Overview
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Overall quiz performance snapshot</p>
                  </div>

                  <div className="mt-6 flex flex-col gap-4">
                    {/* Total Questions */}
                    <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-3 border border-indigo-100">
                      <div>
                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Total Questions</p>
                        <p className="text-2xl font-black text-indigo-700 mt-0.5">
                          {stats.quizOverview?.totalQuestions ?? 0}
                        </p>
                      </div>
                      <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                        <FileText size={18} />
                      </div>
                    </div>

                    {/* Completed Attempts */}
                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 border border-emerald-100">
                      <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Completed Attempts</p>
                        <p className="text-2xl font-black text-emerald-700 mt-0.5">
                          {stats.quizOverview?.completedAttempts ?? 0}
                        </p>
                      </div>
                      <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                        <Award size={18} />
                      </div>
                    </div>

                    {/* Average Score */}
                    <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3 border border-amber-100">
                      <div>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Avg. Score</p>
                        <p className="text-2xl font-black text-amber-700 mt-0.5">
                          {stats.quizOverview?.avgScore ?? 0}%
                        </p>
                      </div>
                      <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                        <TrendingUp size={18} />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Chart 5: Attempts Volume Trend (SVG Area Line Chart) */}
                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft lg:col-span-2">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-500" /> Quiz Attempts Volumetrics
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Quiz attempts volume month-by-month</p>
                  
                  {stats.attemptsTrend.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-12">No attempts data recorded.</p>
                  ) : (
                    <div className="mt-4 relative">
                      {/* Interactive Area Chart */}
                      {(() => {
                        const maxVal = Math.max(...stats.attemptsTrend.map(a => a.count), 1);
                        const width = 500;
                        const height = 130;
                        const padding = 20;
                        const chartWidth = width - padding * 2;
                        const chartHeight = height - padding * 2;
                        
                        const points = stats.attemptsTrend.map((item, index) => {
                          const x = padding + (index * (chartWidth / (stats.attemptsTrend.length - 1)));
                          const y = padding + chartHeight - ((item.count / maxVal) * chartHeight);
                          return { x, y, label: item.month.split(' ')[0], value: item.count };
                        });
                        
                        const linePath = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
                        const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

                        return (
                          <div className="w-full">
                            <svg className="w-full h-auto max-h-[140px]" viewBox={`0 0 ${width} ${height}`}>
                              <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              
                              {/* Grid lines */}
                              <line x1={padding} y1={padding} x2={width - padding} y2={padding} className="stroke-slate-100" strokeWidth="0.5" strokeDasharray="3" />
                              <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} className="stroke-slate-100" strokeWidth="0.5" strokeDasharray="3" />
                              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-slate-200" strokeWidth="0.5" />
                              
                              {/* Filled Area */}
                              <path d={areaPath} fill="url(#areaGrad)" />
                              
                              {/* Stroke Line */}
                              <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              
                              {/* Circles and text labels */}
                              {points.map((p, idx) => (
                                <g key={idx}>
                                  <circle cx={p.x} cy={p.y} r="3.5" className="fill-white stroke-emerald-600" strokeWidth="2" />
                                  <text x={p.x} y={p.y - 7} className="text-[9px] font-black fill-slate-800" textAnchor="middle">{p.value}</text>
                                  <text x={p.x} y={height - 5} className="text-[9px] font-bold fill-slate-400" textAnchor="middle">{p.label}</text>
                                </g>
                              ))}
                            </svg>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </Card>

                {/* Peak Activity Hours Line Chart */}
                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Calendar size={18} className="text-violet-500" /> Peak Activity Hours
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">System usage by hour of day</p>

                  {(() => {
                    const data = stats.peakHours || [];
                    const visible = data.filter(d => d.hour >= 6 && d.hour <= 23);
                    const maxCount = Math.max(...visible.map(d => d.count), 1);
                    const peakHour = visible.reduce((best, d) => d.count > best.count ? d : best, visible[0] || { hour: 0, count: 0 });

                    if (visible.every(d => d.count === 0)) {
                      return <p className="text-xs text-slate-400 text-center py-12">No activity data available yet.</p>;
                    }

                    const svgW = 300;
                    const svgH = 130;
                    const padX = 10;
                    const padY = 20;
                    const chartW = svgW - padX * 2;
                    const chartH = svgH - padY * 2;

                    const pts = visible.map((d, i) => ({
                      x: padX + (i / (visible.length - 1)) * chartW,
                      y: padY + chartH - (d.count / maxCount) * chartH,
                      hour: d.hour,
                      count: d.count,
                      isPeak: d.hour === peakHour.hour,
                    }));

                    const formatHour = h => {
                      if (h === 0) return '12am';
                      if (h < 12) return `${h}am`;
                      if (h === 12) return '12pm';
                      return `${h - 12}pm`;
                    };

                    const linePath = pts.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
                    const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${svgH - padY} L ${pts[0].x} ${svgH - padY} Z`;

                    return (
                      <div className="mt-4">
                        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-100 px-3 py-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                          <span className="text-[11px] font-bold text-violet-700">
                            Peak: {formatHour(peakHour.hour)} — {peakHour.count} attempts
                          </span>
                        </div>

                        <svg className="w-full h-auto" viewBox={`0 0 ${svgW} ${svgH}`}>
                          <defs>
                            <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <line x1={padX} y1={padY} x2={svgW - padX} y2={padY} stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="3" />
                          <line x1={padX} y1={padY + chartH / 2} x2={svgW - padX} y2={padY + chartH / 2} stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="3" />
                          <line x1={padX} y1={svgH - padY} x2={svgW - padX} y2={svgH - padY} stroke="#e2e8f0" strokeWidth="0.5" />
                          <path d={areaPath} fill="url(#peakGrad)" />
                          <path d={linePath} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          {pts.map((p, idx) => (
                            <g key={idx}>
                              {p.isPeak ? (
                                <>
                                  <circle cx={p.x} cy={p.y} r="5" fill="#7c3aed" opacity="0.15" />
                                  <circle cx={p.x} cy={p.y} r="3.5" fill="#7c3aed" stroke="white" strokeWidth="1.5" />
                                  <text x={p.x} y={p.y - 8} fill="#7c3aed" fontSize="8" fontWeight="900" textAnchor="middle">{p.count}</text>
                                </>
                              ) : p.count > 0 ? (
                                <circle cx={p.x} cy={p.y} r="2" fill="#7c3aed" opacity="0.5" />
                              ) : null}
                              {idx % 3 === 0 && (
                                <text x={p.x} y={svgH - 4} fill="#94a3b8" fontSize="7.5" fontWeight="600" textAnchor="middle">
                                  {formatHour(p.hour)}
                                </text>
                              )}
                            </g>
                          ))}
                        </svg>
                      </div>
                    );
                  })()}
                </Card>

              </div>
            </section>

            {/* Additional Metrics Tables Section (2 Tables Grid) */}
            <section className="p-4 md:p-8 md:px-10 pt-0">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Table 1: Popular Quizzes */}
                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Flame size={18} className="text-rose-500" /> Popular Quizzes
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Most attempted quizzes across students</p>
                  
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-bold tracking-wider">
                          <th className="pb-3">Quiz Name</th>
                          <th className="pb-3 text-right">Attempt Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.popularQuizzes.length === 0 ? (
                          <tr>
                            <td colSpan="2" className="py-8 text-xs text-slate-400 text-center">No popular quizzes found.</td>
                          </tr>
                        ) : (
                          stats.popularQuizzes.map((q, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition">
                              <td className="py-3 font-semibold text-slate-800 line-clamp-1">{q.quiz_name}</td>
                              <td className="py-3 text-right font-black text-slate-900">{q.attempts}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Table 2: Top Performing Students */}
                <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Award size={18} className="text-emerald-500" /> Top Performing Students
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Global ranking based on XP points collected</p>
                  
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-bold tracking-wider">
                          <th className="pb-3">Student</th>
                          <th className="pb-3">Grade/Level</th>
                          <th className="pb-3 text-right">Total XP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.topPerformers.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="py-8 text-xs text-slate-400 text-center">No student records found.</td>
                          </tr>
                        ) : (
                          stats.topPerformers.map((student, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition">
                              <td className="py-3">
                                <p className="font-semibold text-slate-800 leading-none">{student.fullname}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]" title={student.school_name}>
                                  {student.school_name}
                                </p>
                              </td>
                              <td className="py-3">
                                <span className="inline-block text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                  {student.grade} • {student.level}
                                </span>
                              </td>
                              <td className="py-3 text-right font-black text-emerald-600">+{student.xp} XP</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </section>

            {/* Recent Activity Section */}
            <section className="p-4 md:p-8 md:px-10 pt-0">
              <Card className="overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest p-6 shadow-soft">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Recent Student Activity</h3>
                    <p className="mt-1 text-sm text-slate-500">Track the latest quiz activity across your learners.</p>
                  </div>
                  <button 
                    onClick={() => setIsActivityModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-slate-50 cursor-pointer shadow-soft"
                  >
                    View All
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold">
                        <th className="pb-3 font-semibold">Student</th>
                        <th className="pb-3 font-semibold">Grade</th>
                        <th className="pb-3 font-semibold">Quiz Name</th>
                        <th className="pb-3 font-semibold">Score</th>
                        <th className="pb-3 font-semibold text-right">Completion Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {stats.recentActivity.slice(0, 5).map((activity, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 font-semibold text-slate-900">{activity.name}</td>
                          <td className="py-4 text-slate-500 font-medium">{activity.grade}</td>
                          <td className="py-4 text-slate-700 font-semibold">{activity.quiz}</td>
                          <td className="py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                              activity.score.endsWith('%') && parseInt(activity.score, 10) >= 75
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : activity.score.endsWith('%') && parseInt(activity.score, 10) >= 50
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {activity.score}
                            </span>
                          </td>
                          <td className="py-4 text-right text-slate-500">{formatDate(activity.date)}</td>
                        </tr>
                      ))}
                      {stats.recentActivity.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-xs text-slate-400 font-medium">No quiz activity logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          </>
        ) : null}

        {/* View All Recent Activity Modal */}
        {isActivityModalOpen && stats ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl overflow-y-auto max-h-[85vh]">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Activity Logs</span>
                  <h3 className="text-2xl font-black text-slate-900">Recent Student Quizzes</h3>
                </div>
                <button
                  onClick={() => setIsActivityModalOpen(false)}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="pb-3">Student</th>
                      <th className="pb-3">Grade</th>
                      <th className="pb-3">Quiz Name</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3 text-right">Completion Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentActivity.map((activity, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 font-semibold text-slate-900">{activity.name}</td>
                        <td className="py-3.5 text-slate-500 font-semibold">{activity.grade}</td>
                        <td className="py-3.5 text-slate-700 font-semibold">{activity.quiz}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-black ${
                            activity.score.endsWith('%') && parseInt(activity.score, 10) >= 75
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : activity.score.endsWith('%') && parseInt(activity.score, 10) >= 50
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {activity.score}
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-slate-500">{formatDate(activity.date)}</td>
                      </tr>
                    ))}
                    {stats.recentActivity.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-xs text-slate-400 font-medium">No quiz activity logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                <button
                  onClick={() => setIsActivityModalOpen(false)}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 cursor-pointer shadow-soft"
                >
                  Close Logs
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
