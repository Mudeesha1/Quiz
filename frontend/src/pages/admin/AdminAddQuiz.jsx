import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  X,
  Loader2,
  Calendar,
  Award,
} from 'lucide-react';
import Footer from '../../ui/Footer';
import { AdminHeader, AdminSidebar, ButtonPrimary, Card, ToastContainer, useToast } from '../../ui';
import logoicon from '../../assets/icons/logo.png';
import { getAuthSession } from '../../services/authService';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Quizzes', icon: FileText, to: '/admin/quizzes', active: true },
  { label: 'Past Papers', icon: ShieldCheck, to: '/admin/past-papers' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

const EXTRA_TIME_MINUTES = 2;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Subject accent mapping
const getSubjectAccent = (subjectName) => {
  const name = subjectName?.toLowerCase() || '';
  if (name.includes('math')) return 'from-indigo-500 to-violet-500';
  if (name.includes('science')) return 'from-emerald-500 to-teal-500';
  if (name.includes('social') || name.includes('env')) return 'from-amber-500 to-orange-500';
  if (name.includes('sinhala') || name.includes('english')) return 'from-rose-500 to-pink-500';
  return 'from-slate-500 to-slate-700';
};

// Subject icon mapping
const getSubjectIcon = (subjectName) => {
  const name = subjectName?.toLowerCase() || '';
  if (name.includes('math')) return BrainCircuit;
  if (name.includes('science') || name.includes('env')) return Sparkles;
  return BookOpen;
};

export default function AdminAddQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');

  const [quizzes, setQuizzes] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit: 300,
    grade: 'Grade 5',
    subject: 'Mathematics',
    questions: []
  });

  const loadQuizzes = async () => {
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      navigate('/admin/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/quizzes`, {
        headers: {
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson?.message || 'Failed to fetch quizzes.');
      }

      if (resJson?.data) {
        setQuizzes(resJson.data.quizzes || []);
        
        // Ensure default fallback options if DB lists are empty
        setGradeOptions(resJson.data.grades?.length ? resJson.data.grades : ['Grade 4', 'Grade 5']);
        setSubjectOptions(resJson.data.subjects?.length ? resJson.data.subjects : ['Mathematics', 'Science', 'Sinhala', 'Environment', 'English']);
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred while loading quizzes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Open the add modal if triggered from sidebar navigation state
  useEffect(() => {
    if (location.state?.openAddModal) {
      handleOpenAddModal();
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Automatically calculate and update time limit based on questions count
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      time_limit: (prev.questions.length * 60) + (EXTRA_TIME_MINUTES * 60),
    }));
  }, [formData.questions.length]);

  // Filter quizzes
  const visibleQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const matchesSearch = `${quiz.title} ${quiz.subject} ${quiz.grade}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject === 'All Subjects' || quiz.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [quizzes, searchTerm, selectedSubject]);

  // Statistics calculation
  const totalQuizzes = quizzes.length;
  const activeSubjects = useMemo(() => new Set(quizzes.map((q) => q.subject)).size, [quizzes]);
  const newThisWeek = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return quizzes.filter((q) => {
      if (!q.created_at) return false;
      return new Date(q.created_at) >= oneWeekAgo;
    }).length;
  }, [quizzes]);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingQuiz(null);
    setFormData({
      title: '',
      description: '',
      time_limit: 300,
      grade: gradeOptions[0] || 'Grade 5',
      subject: subjectOptions[0] || 'Mathematics',
      questions: [
        {
          question_text: '',
          question_type: 'single',
          xp_reward: 2,
          image_url: '',
          options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
          ]
        }
      ]
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (quiz) => {
    setEditingQuiz(quiz);
    // Populate form data
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      time_limit: quiz.time_limit || 300,
      grade: quiz.grade,
      subject: quiz.subject,
      questions: quiz.questions?.length
        ? quiz.questions.map((q) => ({
            question_text: q.question_text,
            question_type: q.question_type || 'single',
            xp_reward: q.xp_reward || 2,
            image_url: q.image_url || '',
            options: q.options?.length
              ? q.options.map((o) => ({
                  option_text: o.option_text,
                  is_correct: o.is_correct
                }))
              : [
                  { option_text: '', is_correct: true },
                  { option_text: '', is_correct: false },
                  { option_text: '', is_correct: false },
                  { option_text: '', is_correct: false }
                ]
          }))
        : [
            {
              question_text: '',
              question_type: 'single',
              xp_reward: 2,
              options: [
                { option_text: '', is_correct: true },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false }
              ]
            }
          ]
    });
    setIsModalOpen(true);
  };

  // Delete Quiz
  const handleDeleteQuiz = async (quiz) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete the quiz "${quiz.title}"?`);
    if (!confirmDelete) return;

    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      navigate('/admin/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/quizzes/${quiz.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson?.message || 'Failed to delete the quiz.');
      }

      toast.success('Quiz deleted successfully.');
      setQuizzes((current) => current.filter((q) => q.id !== quiz.id));
    } catch (err) {
      toast.error(err.message || 'Error occurred while deleting quiz.');
    }
  };

  // Add question to form state
  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: '',
          question_type: 'single',
          xp_reward: 2,
          image_url: '',
          options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
          ]
        }
      ]
    }));
  };

  // Remove question from form state
  const handleRemoveQuestion = (qIdx) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIdx)
    }));
  };

  // Handle Question Text Change
  const handleQuestionTextChange = (qIdx, text) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIdx].question_text = text;
      return { ...prev, questions: newQuestions };
    });
  };

  // Handle XP Change
  const handleQuestionXpChange = (qIdx, xp) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIdx].xp_reward = xp;
      return { ...prev, questions: newQuestions };
    });
  };

  // Handle Option Text Change
  const handleOptionTextChange = (qIdx, oIdx, text) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIdx].options[oIdx].option_text = text;
      return { ...prev, questions: newQuestions };
    });
  };

  // Handle Correct Option Change
  const handleMarkOptionCorrect = (qIdx, oIdx) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIdx].options = newQuestions[qIdx].options.map((opt, idx) => ({
        ...opt,
        is_correct: idx === oIdx
      }));
      return { ...prev, questions: newQuestions };
    });
  };

  // Form Submit
  // Question image path resolver
  const getQuestionImageUrl = (imgUrl) => {
    if (!imgUrl) return '';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return imgUrl;
    }
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    const baseUrl = apiBase.replace('/api/v1', '');
    if (imgUrl.startsWith('/api/v1/uploads/')) {
      return `${baseUrl}${imgUrl}`;
    }
    return `${apiBase}/uploads${imgUrl}`;
  };

  // Upload question image
  const handleUploadQuestionImage = async (qIdx, file) => {
    if (!file) return;

    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      navigate('/admin/login');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/quizzes/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: formDataUpload,
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson?.message || 'Failed to upload question image.');
      }

      if (resJson?.data?.url) {
        setFormData((prev) => {
          const newQuestions = [...prev.questions];
          newQuestions[qIdx].image_url = resJson.data.url;
          return { ...prev, questions: newQuestions };
        });
      }
    } catch (err) {
      toast.error(`Error uploading image: ${err.message}`);
    }
  };

  // Remove question image
  const handleRemoveQuestionImage = (qIdx) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIdx].image_url = '';
      return { ...prev, questions: newQuestions };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Quiz Title is required.');
      return;
    }
    if (formData.questions.length === 0) {
      toast.error('A quiz must have at least one question.');
      return;
    }
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question_text.trim()) {
        toast.error(`Question ${i + 1} text is required.`);
        return;
      }
      const hasCorrect = q.options.some((o) => o.is_correct);
      if (!hasCorrect) {
        toast.error(`Question ${i + 1} must have a marked correct option.`);
        return;
      }
      const optionsEmpty = q.options.some((o) => !o.option_text.trim());
      if (optionsEmpty) {
        toast.error(`Question ${i + 1} has empty options. Fill all choices.`);
        return;
      }
    }

    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      navigate('/admin/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingQuiz 
        ? `${API_BASE_URL}/admin/quizzes/${editingQuiz.id}`
        : `${API_BASE_URL}/admin/quizzes`;
      const method = editingQuiz ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          time_limit: parseInt(formData.time_limit),
          grade: formData.grade,
          subject: formData.subject,
          questions: formData.questions
        }),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson?.message || 'Failed to save quiz details.');
      }

      toast.success(editingQuiz ? 'Quiz updated successfully.' : 'New quiz created successfully.');
      setIsModalOpen(false);
      loadQuizzes();
    } catch (err) {
      toast.error(err.message || 'Error occurred while saving quiz details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
      <AdminSidebar
        items={NAV_ITEMS}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddQuizClick={handleOpenAddModal}
      />

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

              <ButtonPrimary
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold cursor-pointer"
              >
                <Plus size={16} /> Add New Quiz
              </ButtonPrimary>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total Quizzes</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{isLoading ? '...' : totalQuizzes}</p>
              </Card>
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Active Subjects</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{isLoading ? '...' : activeSubjects}</p>
              </Card>
              <Card className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">New This Week</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{isLoading ? '...' : newThisWeek}</p>
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
                    className="appearance-none rounded-full border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary focus:bg-white cursor-pointer"
                  >
                    <option>All Subjects</option>
                    {subjectOptions.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </label>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="mt-2 text-sm font-semibold">Loading quizzes...</p>
              </div>
            ) : (
              <div className="space-y-4 p-5 md:p-6">
                {visibleQuizzes.map((quiz) => {
                  const Icon = getSubjectIcon(quiz.subject);
                  const accent = getSubjectAccent(quiz.subject);

                  return (
                    <div key={quiz.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-primary/20 hover:shadow-sm md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4 md:items-center">
                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-sm`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900">{quiz.title}</h4>
                          <p className="mt-1 text-sm text-slate-500">
                            {quiz.grade} • {quiz.subject} • {quiz.questionsCount} Questions • {quiz.time_limit ? `${Math.round(quiz.time_limit / 60)}m` : 'N/A'} Limit
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:justify-end">
                        <button
                          onClick={() => handleOpenEditModal(quiz)}
                          className="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-primary transition hover:bg-slate-50 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz)}
                          className="rounded-full p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          aria-label={`Delete ${quiz.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {visibleQuizzes.length === 0 && (
                  <div className="py-12 text-center text-sm text-slate-400 font-semibold">
                    No quizzes match your current filters.
                  </div>
                )}
              </div>
            )}
          </Card>
        </section>

        {/* Add/Edit Quiz Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl overflow-y-auto max-h-[85vh]">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                    {editingQuiz ? 'Update Existing' : 'Create New'}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    {editingQuiz ? 'Edit Quiz Challenge' : 'Add New Quiz'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
                
                {/* Meta details grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Quiz Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grade 5 Mathematics - Fractions"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid gap-3 grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Grade</label>
                      <select
                        value={formData.grade}
                        onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary cursor-pointer"
                      >
                        {gradeOptions.map((gr, idx) => (
                          <option key={idx} value={gr}>{gr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary cursor-pointer"
                      >
                        {subjectOptions.map((sub, idx) => (
                          <option key={idx} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Time Limit (Sec)
                      </label>
                      <input
                        type="number"
                        disabled
                        value={formData.time_limit}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-3 py-3 text-sm font-medium text-slate-500 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Quiz Description</label>
                  <textarea
                    placeholder="Provide description about what skills this quiz checks..."
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-primary"
                  />
                </div>

                {/* Questions Creator Section */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Award size={18} className="text-primary" /> Questions Configuration
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-800 transition cursor-pointer"
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  </div>

                  <div className="space-y-6">
                    {formData.questions.map((question, qIdx) => (
                      <div key={qIdx} className="rounded-3xl border border-slate-200 bg-slate-50/50 p-4 md:p-6 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid gap-4 md:grid-cols-4 items-start">
                          <div className="md:col-span-3">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              Question {qIdx + 1} Text
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. What is the value of 8 + 4?"
                              value={question.question_text}
                              onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              XP Reward
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              required
                              value={question.xp_reward}
                              onChange={(e) => handleQuestionXpChange(qIdx, e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-primary"
                            />
                          </div>
                        </div>

                        {/* Options Input Block */}
                        <div className="mt-4">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Answer Choices (Mark the single correct choice)
                          </label>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {question.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5">
                                <input
                                  type="radio"
                                  name={`correct-option-${qIdx}`}
                                  checked={opt.is_correct}
                                  onChange={() => handleMarkOptionCorrect(qIdx, oIdx)}
                                  className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                                />
                                <input
                                  type="text"
                                  required
                                  placeholder={`Choice ${oIdx + 1}`}
                                  value={opt.option_text}
                                  onChange={(e) => handleOptionTextChange(qIdx, oIdx, e.target.value)}
                                  className="flex-1 border-none bg-transparent p-0 text-sm font-medium text-slate-800 outline-none focus:ring-0"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Question Image Upload & Preview Block */}
                        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              Question Image (Optional)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadQuestionImage(qIdx, e.target.files[0])}
                              className="w-full text-xs font-semibold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-fixed/40 file:text-primary hover:file:bg-primary-fixed/60 file:cursor-pointer"
                            />
                          </div>

                          {question.image_url && (
                            <div className="relative flex-shrink-0 border border-slate-200 rounded-xl overflow-hidden bg-slate-100 h-56 w-84 group">
                              <img
                                src={getQuestionImageUrl(question.image_url)}
                                alt={`Question ${qIdx + 1} Preview`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestionImage(qIdx)}
                                className="absolute inset-0 bg-rose-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white rounded-xl cursor-pointer font-bold"
                                title="Remove Image"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit actions */}
                <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-soft"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Saving Quiz...
                      </>
                    ) : (
                      editingQuiz ? 'Save Changes' : 'Create Quiz'
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        <Footer />
      </main>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}
