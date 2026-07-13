import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  AlertTriangle,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  MoreHorizontal,
  Share2,
} from 'lucide-react';
import Footer from '../../ui/Footer';
import { AdminHeader, AdminSidebar, ButtonPrimary, ButtonSecondary, Card, ToastContainer, useToast } from '../../ui';
import logoicon from '../../assets/icons/logo.png';
import { getAuthSession } from '../../services/authService';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Quizzes', icon: FileText, to: '/admin/quizzes' },
  { label: 'Past Papers', icon: ShieldCheck, to: '/admin/past-papers' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'AI Assistant', icon: Sparkles, to: '/admin/ai-assistant', active: true },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const GRADE_OPTIONS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11'];
const SUBJECT_OPTIONS = ['Mathematics', 'Science', 'Sinhala', 'Environment', 'English', 'History'];
const AI_MODELS = [
  { id: 'tencent/hy3:free', name: 'Tencent HY3' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B IT' },
  { id: 'poolside/laguna-m.1:free', name: 'Laguna M.1' },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'NVIDIA Nemotron 3' },
  { id: 'openai/gpt-oss-120b:free', name: 'GPT-OSS-120B' },
  { id: 'google/lyria-3-clip-preview', name: 'Google Lyria 3' },
  { id: 'poolside/laguna-xs-2.1:free', name: 'Laguna XS 2.1' },
];

export default function AdminAIAssistant() {
  const navigate = useNavigate();
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);

  // Generator states
  const [subject, setSubject] = useState('Mathematics');
  const [grade, setGrade] = useState('Grade 5');
  const [questionsCount, setQuestionsCount] = useState(5);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // New settings parameters
  const [dbGrades, setDbGrades] = useState(GRADE_OPTIONS);
  const [dbSubjects, setDbSubjects] = useState(SUBJECT_OPTIONS);
  const [topic, setTopic] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState(['English', 'Sinhala']);
  const [difficulty, setDifficulty] = useState('Medium');
  const [focusStyle, setFocusStyle] = useState('Conceptual');
  const [distractorStrength, setDistractorStrength] = useState('Standard');
  const [imagePreference, setImagePreference] = useState('none');

  // Workspace navigation tab
  const [activeMode, setActiveMode] = useState('generator'); // 'generator' or 'chat'
  const [errorMessage, setErrorMessage] = useState(null);

  // Profile metadata state
  const [adminProfile, setAdminProfile] = useState(null);

  // Chat parameters
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('quiz_master_ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        role: 'assistant',
        content: 'Hello! I am your AI assistant. How can I help you design quizzes, curriculum questions, or learning materials today?',
      },
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);

  // Sync chat messages to localStorage
  useEffect(() => {
    localStorage.setItem('quiz_master_ai_chat_history', JSON.stringify(chatMessages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isSendingChatMessage]);

  // Quiz review state
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Load database filters (grades & subjects list) and admin profile details
  const loadDbFilters = async () => {
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/quizzes`, {
        headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
      });
      const resJson = await response.json();
      if (response.ok && resJson?.data) {
        if (resJson.data.grades?.length) setDbGrades(resJson.data.grades);
        if (resJson.data.subjects?.length) setDbSubjects(resJson.data.subjects);
      }

      // Fetch admin profile details
      const profileResponse = await fetch(`${API_BASE_URL}/admin/settings/profile`, {
        headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
      });
      const profileJson = await profileResponse.json();
      if (profileResponse.ok && profileJson?.data) {
        setAdminProfile(profileJson.data);
      }
    } catch (err) {
      console.error('Error loading DB metadata:', err);
    }
  };

  const handleLanguageToggle = (lang) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(lang)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter((l) => l !== lang);
      }
      return [...prev, lang];
    });
  };

  // Check if OpenRouter key exists in database
  const checkApiKey = async () => {
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      navigate('/admin/login');
      return;
    }

    setCheckingKey(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/openrouter-key`, {
        headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
      });
      const resJson = await response.json();
      if (response.ok && resJson?.data?.hasKey) {
        setHasApiKey(true);
      } else {
        setHasApiKey(false);
      }
    } catch (err) {
      console.error('Error checking API key:', err);
      setHasApiKey(false);
    } finally {
      setCheckingKey(false);
    }
  };

  useEffect(() => {
    checkApiKey();
    loadDbFilters();
  }, []);

  // Handle generation action
  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      navigate('/admin/login');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/ai-assistant/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: JSON.stringify({
          subject,
          grade,
          questionsCount: parseInt(questionsCount),
          model: selectedModel,
          topic,
          languages: selectedLanguages,
          difficulty,
          style: focusStyle,
          distractorStrength,
          imagePreference,
          customInstructions,
        }),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson?.message || 'Failed to generate quiz from OpenRouter.');
      }

      const generatedData = resJson.data;
      // Populate defaults if missing
      const formattedData = {
        title: generatedData.title || `${subject} Challenge`,
        description: generatedData.description || `AI generated quiz for ${grade} ${subject}.`,
        time_limit: (generatedData.questions?.length || 5) * 60 + 120, // default time limit
        questions_to_show: '',
        questions: (generatedData.questions || []).map((q, idx) => ({
          question_text: q.question_text || `Question ${idx + 1}`,
          question_type: q.question_type || 'single',
          xp_reward: q.xp_reward || 2,
          hint: q.hint || '',
          image_url: q.image_url || '',
          options: (q.options || []).map((o) => ({
            option_text: o.option_text || '',
            is_correct: !!o.is_correct,
            explanation: o.explanation || '',
          })),
        })),
      };

      setGeneratedQuiz(formattedData);
      setExpandedQuestion(0); // expand first question
      toast.success('Bilingual Quiz generated successfully! 🪄');
    } catch (err) {
      setErrorMessage(err.message || 'Error occurred while generating quiz.');
      toast.error(err.message || 'Error occurred while generating quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle direct AI chat message submit
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setErrorMessage(null);
    setIsSendingChatMessage(true);

    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      navigate('/admin/login');
      return;
    }

    try {
      const chatHistory = [...chatMessages, userMsg];
      const response = await fetch(`${API_BASE_URL}/admin/ai-assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: JSON.stringify({
          messages: chatHistory.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
        }),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson?.message || 'Failed to get assistant response.');
      }

      setChatMessages((prev) => [...prev, resJson.data]);
    } catch (err) {
      setErrorMessage(err.message || 'Error occurred during AI Chat session.');
      toast.error(err.message || 'Failed to send message.');
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  // Modify generated quiz values locally
  const updateQuizMeta = (field, value) => {
    setGeneratedQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const updateQuestionField = (qIdx, field, value) => {
    setGeneratedQuiz((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIdx][field] = value;
      return { ...prev, questions: newQuestions };
    });
  };

  const updateOptionField = (qIdx, oIdx, field, value) => {
    setGeneratedQuiz((prev) => {
      const newQuestions = [...prev.questions];
      const newOptions = [...newQuestions[qIdx].options];
      newOptions[oIdx] = { ...newOptions[oIdx], [field]: value };
      newQuestions[qIdx].options = newOptions;
      return { ...prev, questions: newQuestions };
    });
  };

  const toggleOptionCorrect = (qIdx, oIdx) => {
    setGeneratedQuiz((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIdx].options = newQuestions[qIdx].options.map((opt, idx) => ({
        ...opt,
        is_correct: idx === oIdx,
      }));
      return { ...prev, questions: newQuestions };
    });
  };

  const addOption = (qIdx) => {
    setGeneratedQuiz((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIdx].options.push({
        option_text: '',
        is_correct: false,
        explanation: '',
      });
      return { ...prev, questions: newQuestions };
    });
  };

  const removeOption = (qIdx, oIdx) => {
    setGeneratedQuiz((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIdx].options = newQuestions[qIdx].options.filter((_, idx) => idx !== oIdx);
      return { ...prev, questions: newQuestions };
    });
  };

  const deleteQuestion = (qIdx) => {
    setGeneratedQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIdx),
    }));
    setExpandedQuestion(null);
  };

  const addNewQuestion = () => {
    setGeneratedQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: 'New Question / නව ප්‍රශ්නය',
          question_type: 'single',
          xp_reward: 2,
          hint: '',
          image_url: '',
          options: [
            { option_text: 'Choice A / පිළිතුර A', is_correct: true, explanation: '' },
            { option_text: 'Choice B / පිළිතුර B', is_correct: false, explanation: '' },
          ],
        },
      ],
    }));
    setExpandedQuestion(generatedQuiz.questions.length);
  };

  // Submit/save verified quiz to backend DB
  const handleSaveQuiz = () => {
    // Validate
    if (!generatedQuiz.title.trim()) {
      toast.error('Quiz title is required.');
      return;
    }
    if (generatedQuiz.questions.length === 0) {
      toast.error('At least one question is required.');
      return;
    }
    for (let i = 0; i < generatedQuiz.questions.length; i++) {
      const q = generatedQuiz.questions[i];
      if (!q.question_text.trim()) {
        toast.error(`Question ${i + 1} text is required.`);
        return;
      }
      const hasCorrect = q.options.some((o) => o.is_correct);
      if (!hasCorrect) {
        toast.error(`Question ${i + 1} must have a correct answer selected.`);
        return;
      }
      const optionsEmpty = q.options.some((o) => !o.option_text.trim());
      if (optionsEmpty) {
        toast.error(`Question ${i + 1} has blank options. Fill all choices.`);
        return;
      }
    }

    // Redirect to Quizzes manager and auto-open creation modal with prepopulated draft data
    navigate('/admin/quizzes', {
      state: {
        openAddModal: true,
        generatedQuiz: {
          title: generatedQuiz.title,
          description: generatedQuiz.description,
          time_limit: parseInt(generatedQuiz.time_limit),
          questions_to_show: generatedQuiz.questions_to_show ? parseInt(generatedQuiz.questions_to_show) : '',
          grade: grade,
          subject: subject,
          questions: generatedQuiz.questions.map(q => ({
            question_text: q.question_text,
            question_type: q.question_type || 'single',
            xp_reward: parseInt(q.xp_reward) || 2,
            image_url: q.image_url || '',
            hint: q.hint || '',
            options: q.options.map(opt => ({
              option_text: opt.option_text,
              is_correct: opt.is_correct,
              explanation: opt.explanation || '',
            }))
          }))
        }
      }
    });
    toast.success('Opening Quiz in modal editor...');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
      <AdminSidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen pb-16 md:ml-72">
        <AdminHeader onMenuClick={() => setSidebarOpen((v) => !v)} />

        {/* Hero banner */}
        <section className="px-4 py-6 md:px-8 md:py-8 md:px-10">
          <div className="overflow-hidden rounded-[2rem] border border-surface-container-highest bg-gradient-to-br from-primary-fixed via-white to-surface-container-lowest p-6 shadow-soft md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                    <Sparkles size={14} className="text-primary animate-pulse" /> AI Assistant Studio
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 shadow-sm border border-emerald-100">
                    Owned & Powered by Infonade Software Solutions
                  </div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 md:text-4xl">AI Quiz Assistant</h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-full">
                  Generate high-quality bilingual (Sinhala & English) quizzes automatically using advanced LLMs, review/edit them manually, and save them directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workspace Mode switch tabs */}
        {hasApiKey && !checkingKey && (
          <section className="px-4 mb-5 md:px-8 md:px-10">
            <div className="flex gap-4 border-b border-slate-200">
              <button
                type="button"
                onClick={() => { setActiveMode('generator'); setErrorMessage(null); }}
                className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeMode === 'generator'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <BrainCircuit size={16} />
                Quiz Generator
              </button>
              <button
                type="button"
                onClick={() => { setActiveMode('chat'); setErrorMessage(null); }}
                className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeMode === 'chat'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <MessageSquare size={16} />
                AI Chat Space
              </button>
            </div>
          </section>
        )}

        {/* Error notice banner */}
        {errorMessage && (
          <section className="px-4 mb-6 md:px-8 md:px-10">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-rose-600 mt-0.5 shrink-0" size={20} />
                <div>
                  <h4 className="text-sm font-black text-rose-800">Quiz Assistant Encountered an Error</h4>
                  <p className="mt-0.5 text-xs text-rose-600 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <a
                href="https://www.infonade.com/book-meeting"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-rose-700 transition cursor-pointer shrink-0"
              >
                Report & Book a Meeting
              </a>
            </div>
          </section>
        )}

        {/* Workspace panels */}
        <section className="px-4 pb-6 md:px-8 md:px-10">
          {checkingKey ? (
            <div className="flex min-h-[30vh] flex-col items-center justify-center text-slate-500">
              <Loader2 className="animate-spin text-primary" size={36} />
              <p className="mt-3 text-sm font-semibold">Verifying API configuration...</p>
            </div>
          ) : !hasApiKey ? (
            /* Key Missing State */
            <Card className="max-w-2xl mx-auto overflow-hidden rounded-[2rem] border border-amber-200 bg-amber-50/20 p-8 shadow-soft text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <KeyRound size={28} />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900">OpenRouter Key Required</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                To generate quizzes using AI models, you must first configure your OpenRouter API Key in the settings panel.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <ButtonPrimary
                  onClick={() => navigate('/admin/settings')}
                  className="rounded-full px-6 py-2.5 font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Settings size={15} /> Configure API Key
                </ButtonPrimary>
              </div>
            </Card>
          ) : activeMode === 'generator' ? (
            /* Generator Workspace */
            <div className="grid gap-6 lg:grid-cols-[380px_1fr] items-start">
              
              {/* Left Config Card */}
              <Card className="rounded-[2rem] border border-surface-container-highest bg-white/80 p-6 shadow-soft sticky top-24">
                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <BrainCircuit size={18} className="text-primary" /> Parameters
                </h3>
                <form onSubmit={handleGenerateQuiz} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Grade (Loaded from DB)</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:bg-white cursor-pointer"
                    >
                      {dbGrades.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subject (Loaded from DB)</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:bg-white cursor-pointer"
                    >
                      {dbSubjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Specific Topic (Optional)</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Fractions, Photosynthesis, Triangles"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Target Language(s)</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['English', 'Sinhala', 'Tamil'].map((lang) => {
                        const isSelected = selectedLanguages.includes(lang);
                        return (
                          <button
                            type="button"
                            key={lang}
                            onClick={() => handleLanguageToggle(lang)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                              isSelected
                                ? 'bg-primary border-primary text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:bg-white cursor-pointer"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Focus Style</label>
                      <select
                        value={focusStyle}
                        onChange={(e) => setFocusStyle(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:bg-white cursor-pointer"
                      >
                        <option value="Conceptual">Conceptual</option>
                        <option value="Calculation-focused">Calculation-focused</option>
                        <option value="Practical/Scenario-based">Practical/Scenario-based</option>
                        <option value="General Knowledge">General Knowledge</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Distractors</label>
                      <select
                        value={distractorStrength}
                        onChange={(e) => setDistractorStrength(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:bg-white cursor-pointer"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Strong">Strong (Challenging)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Illustrations</label>
                      <select
                        value={imagePreference}
                        onChange={(e) => setImagePreference(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:bg-white cursor-pointer"
                      >
                        <option value="none">No Images</option>
                        <option value="required">Require Images for all questions</option>
                        <option value="optional">Add related image links if needed (අවශ්‍ය නම් පමණක්)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Questions</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={questionsCount}
                        onChange={(e) => setQuestionsCount(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-primary focus:bg-white text-center font-bold text-slate-800"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">AI Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary focus:bg-white cursor-pointer"
                      >
                        {AI_MODELS.map((model) => (
                          <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Extra Instructions (Optional)</label>
                    <textarea
                      rows="2"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="e.g. Include questions with simple Sinhala vocabulary."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs outline-none transition focus:border-primary focus:bg-white resize-none"
                    />
                  </div>

                  <ButtonPrimary
                    type="submit"
                    disabled={isGenerating || isSubmittingQuiz}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold disabled:opacity-55 cursor-pointer"
                  >
                    {isGenerating ? (
                      <><Loader2 className="animate-spin" size={16} /> Generating...</>
                    ) : (
                      <><Sparkles size={16} /> Generate Quiz</>
                    )}
                  </ButtonPrimary>
                </form>
              </Card>

              {/* Right Workspace / Quiz Editor */}
              <div className="space-y-6">
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center py-24 text-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 p-6">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <h4 className="mt-4 text-lg font-black text-slate-900">Quiz Generation in Progress</h4>
                    <p className="mt-2 text-sm text-slate-500 max-w-full">
                      Generating questions in Sinhala & English using {AI_MODELS.find(m => m.id === selectedModel)?.name || 'selected model'}. This may take up to a minute...
                    </p>
                  </div>
                )}

                {!isGenerating && !generatedQuiz && (
                  <div className="flex flex-col items-center justify-center py-28 text-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 p-6">
                    <Sparkles className="text-slate-300" size={56} />
                    <h4 className="mt-4 text-base font-black text-slate-700">Ready to Generate</h4>
                    <p className="mt-1 text-xs text-slate-400 max-w-full leading-relaxed">
                      Select subject parameters on the left sidebar to generate a fully editable quiz draft.
                    </p>
                  </div>
                )}

                {/* Edit & Review Suite */}
                {!isGenerating && generatedQuiz && (
                  <Card className="rounded-[2rem] border border-surface-container-highest bg-white/80 p-6 shadow-soft">
                    
                    {/* Header Controls */}
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-5 mb-5 gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">Draft Editor</span>
                        <h3 className="text-xl font-black text-slate-900">Review & Save Quiz</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setGeneratedQuiz(null)}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                        >
                          Discard
                        </button>
                        <ButtonPrimary
                          onClick={handleSaveQuiz}
                          disabled={isSubmittingQuiz}
                          className="rounded-full px-5 py-2 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                        >
                          {isSubmittingQuiz ? (
                            <><Loader2 size={12} className="animate-spin" /> Saving...</>
                          ) : (
                            <><Check size={14} /> Create Quiz</>
                          )}
                        </ButtonPrimary>
                      </div>
                    </div>

                    {/* Meta section */}
                    <div className="space-y-4 bg-slate-50/60 rounded-[1.5rem] p-4 border border-slate-200/50 mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quiz Settings</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Quiz Title</label>
                          <input
                            type="text"
                            required
                            value={generatedQuiz.title}
                            onChange={(e) => updateQuizMeta('title', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-primary"
                          />
                        </div>

                        <div className="grid gap-3 grid-cols-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Time Limit (seconds)</label>
                            <input
                              type="number"
                              required
                              value={generatedQuiz.time_limit}
                              onChange={(e) => updateQuizMeta('time_limit', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Questions to Show</label>
                            <input
                              type="number"
                              placeholder="All"
                              value={generatedQuiz.questions_to_show}
                              onChange={(e) => updateQuizMeta('questions_to_show', e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Description</label>
                        <textarea
                          rows="2"
                          value={generatedQuiz.description}
                          onChange={(e) => updateQuizMeta('description', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Questions editor list */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Questions List ({generatedQuiz.questions.length})</h4>
                        <button
                          type="button"
                          onClick={addNewQuestion}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          <Plus size={14} /> Add Question
                        </button>
                      </div>

                      {generatedQuiz.questions.map((question, qIdx) => {
                        const isExpanded = expandedQuestion === qIdx;
                        return (
                          <div key={qIdx} className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                            
                            {/* Accordion header */}
                            <div
                              onClick={() => setExpandedQuestion(isExpanded ? null : qIdx)}
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition bg-slate-50/30"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 shrink-0">
                                  {qIdx + 1}
                                </span>
                                <p className="text-sm font-bold text-slate-800 truncate">
                                  {question.question_text || '(Empty Question)'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); deleteQuestion(qIdx); }}
                                  className="p-1 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 cursor-pointer"
                                  title="Delete question"
                                >
                                  <Trash2 size={14} />
                                </button>
                                {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                              </div>
                            </div>

                            {/* Accordion content */}
                            {isExpanded && (
                              <div className="p-4 border-t border-slate-100 space-y-4 bg-white">
                                <div className="grid gap-4 md:grid-cols-3">
                                  <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Question Text</label>
                                    <input
                                      type="text"
                                      value={question.question_text}
                                      onChange={(e) => updateQuestionField(qIdx, 'question_text', e.target.value)}
                                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-primary"
                                    />
                                  </div>

                                  <div className="grid gap-2 grid-cols-2">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">XP Reward</label>
                                      <input
                                        type="number"
                                        value={question.xp_reward}
                                        onChange={(e) => updateQuestionField(qIdx, 'xp_reward', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary text-center font-bold"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label>
                                      <select
                                        value={question.question_type}
                                        onChange={(e) => updateQuestionField(qIdx, 'question_type', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-2 py-2 text-sm outline-none focus:border-primary cursor-pointer font-semibold"
                                      >
                                        <option value="single">Single Choice</option>
                                        <option value="multiple">Multiple Choice</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hint Text</label>
                                    <input
                                      type="text"
                                      value={question.hint}
                                      onChange={(e) => updateQuestionField(qIdx, 'hint', e.target.value)}
                                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary"
                                      placeholder="Leave blank if none"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Image URL</label>
                                    <input
                                      type="text"
                                      value={question.image_url}
                                      onChange={(e) => updateQuestionField(qIdx, 'image_url', e.target.value)}
                                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary"
                                      placeholder="https://images.unsplash.com/..."
                                    />
                                  </div>
                                </div>

                                {question.image_url && (
                                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 max-w-sm">
                                    <img
                                      src={question.image_url}
                                      alt="AI Preview"
                                      className="h-14 w-20 object-cover rounded border bg-white"
                                      onError={(e) => { e.target.src = 'https://placehold.co/100x70?text=Invalid+Image'; }}
                                    />
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase">Image Preview</p>
                                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{question.image_url}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Options choices */}
                                <div className="space-y-2 border-t border-slate-100 pt-3">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Answer Choices</p>
                                    <button
                                      type="button"
                                      onClick={() => addOption(qIdx)}
                                      className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                                    >
                                      + Add Choice
                                    </button>
                                  </div>

                                  <div className="space-y-3">
                                    {question.options.map((option, oIdx) => (
                                      <div key={oIdx} className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 bg-slate-50/50">
                                        <div className="flex items-center gap-3">
                                          {/* Check if correct */}
                                          <button
                                            type="button"
                                            onClick={() => toggleOptionCorrect(qIdx, oIdx)}
                                            className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition cursor-pointer ${
                                              option.is_correct
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                                : 'border-slate-300 bg-white text-transparent hover:border-slate-400'
                                            }`}
                                          >
                                            <Check size={12} strokeWidth={3} />
                                          </button>

                                          {/* Choice input */}
                                          <input
                                            type="text"
                                            value={option.option_text}
                                            onChange={(e) => updateOptionField(qIdx, oIdx, 'option_text', e.target.value)}
                                            placeholder={`Choice ${oIdx + 1}`}
                                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-primary"
                                          />

                                          {/* Delete choice */}
                                          {question.options.length > 2 && (
                                            <button
                                              type="button"
                                              onClick={() => removeOption(qIdx, oIdx)}
                                              className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                            >
                                              <X size={14} />
                                            </button>
                                          )}
                                        </div>

                                        {/* Explanation */}
                                        <div className="pl-8">
                                          <input
                                            type="text"
                                            value={option.explanation}
                                            onChange={(e) => updateOptionField(qIdx, oIdx, 'explanation', e.target.value)}
                                            placeholder="Explanation for this choice (Bilingual)"
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-500 outline-none focus:border-primary"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-5">
                      <ButtonPrimary
                        onClick={handleSaveQuiz}
                        disabled={isSubmittingQuiz}
                        className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold disabled:opacity-55 cursor-pointer"
                      >
                        {isSubmittingQuiz ? (
                          <><Loader2 size={16} className="animate-spin" /> Saving Quiz...</>
                        ) : (
                          <><Save size={16} /> Save and Create Quiz</>
                        )}
                      </ButtonPrimary>
                    </div>

                  </Card>
                )}
              </div>

            </div>
          ) : (
            /* AI Chat Workspace */
            <div className="grid gap-6 lg:grid-cols-[300px_1fr] items-start">
              
              {/* Left Model Config Card */}
              <Card className="rounded-[2rem] border border-surface-container-highest bg-white/80 p-6 shadow-soft sticky top-24">
                <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                  <Settings size={16} className="text-primary" /> Chat Model
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Select Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary cursor-pointer"
                    >
                      {AI_MODELS.map((model) => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-500 leading-relaxed">
                    Chat with models to brainstorming math questions, generate reading passages, or translate curriculum texts.
                  </div>
                </div>
              </Card>

              {/* Chat Console */}
              <Card className="rounded-[2rem] border border-surface-container-highest bg-white shadow-soft overflow-hidden flex flex-col h-[75vh]">
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes chatSlideIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  .chat-msg-animate {
                    animation: chatSlideIn 0.25s ease-out forwards;
                  }
                `}} />
                
                <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-700">AI Assistant Console</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear the chat history?")) {
                        setChatMessages([
                          {
                            role: 'assistant',
                            content: 'Hello! I am your AI assistant. How can I help you design quizzes, curriculum questions, or learning materials today?',
                          },
                        ]);
                        toast.success("Chat history cleared.");
                      }
                    }}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:underline transition cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>

                {/* Messages scroll list */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
                  {chatMessages.map((msg, idx) => {
                    const isUser = msg.role === 'user';

                    if (isUser) {
                      return (
                        <div key={idx} className="flex justify-end w-full chat-msg-animate">
                          <div className="relative group bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[70%] text-xs leading-relaxed shadow-soft border border-indigo-500/20">
                            <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                            
                            {/* Delete button */}
                            {chatMessages.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setChatMessages((prev) => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute left-[-30px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition duration-150 p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                                title="Delete message"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Assistant response styling: un-bubbled raw text with action row
                    return (
                      <div key={idx} className="flex flex-col items-start w-full chat-msg-animate group pb-4">
                        <div className="text-slate-800 text-xs leading-relaxed max-w-[90%] whitespace-pre-wrap font-medium">
                          {msg.content}
                        </div>
                        
                        {/* Feedbacks Action row */}
                        <div className="flex items-center gap-3 mt-3 text-slate-400">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content);
                              toast.success("Copied to clipboard! 📋");
                            }}
                            className="p-1 hover:text-slate-700 transition cursor-pointer"
                            title="Copy message"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toast.success("Feedback submitted! 👍")}
                            className="p-1 hover:text-emerald-600 transition cursor-pointer"
                            title="Helpful"
                          >
                            <ThumbsUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toast.success("Feedback submitted! 👎")}
                            className="p-1 hover:text-rose-600 transition cursor-pointer"
                            title="Not helpful"
                          >
                            <ThumbsDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toast.success("Shared message link.")}
                            className="p-1 hover:text-slate-700 transition cursor-pointer"
                            title="Share"
                          >
                            <Share2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              // Regenerate last user message response if possible
                              const lastUserIdx = chatMessages.slice(0, idx).reduce((acc, curr, i) => curr.role === 'user' ? i : acc, -1);
                              if (lastUserIdx !== -1) {
                                const userMsg = chatMessages[lastUserIdx];
                                setErrorMessage(null);
                                setIsSendingChatMessage(true);
                                try {
                                  const response = await fetch(`${API_BASE_URL}/admin/ai-assistant/chat`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${getAuthSession()?.tokens?.accessToken}`,
                                    },
                                    body: JSON.stringify({
                                      messages: chatMessages.slice(0, lastUserIdx + 1).map((m) => ({ role: m.role, content: m.content })),
                                      model: selectedModel,
                                    }),
                                  });
                                  const resJson = await response.json();
                                  if (!response.ok) throw new Error(resJson?.message || 'Failed to regenerate.');
                                  setChatMessages((prev) => [...prev.slice(0, idx), resJson.data]);
                                  toast.success("Response regenerated successfully!");
                                } catch (err) {
                                  toast.error(err.message);
                                } finally {
                                  setIsSendingChatMessage(false);
                                }
                              }
                            }}
                            className="p-1 hover:text-slate-700 transition cursor-pointer"
                            title="Regenerate"
                          >
                            <RotateCw size={13} />
                          </button>
                          <button
                            type="button"
                            className="p-1 hover:text-slate-700 transition cursor-pointer"
                            title="More options"
                          >
                            <MoreHorizontal size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isSendingChatMessage && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-2 chat-msg-animate">
                      <div className="flex space-x-1 items-center h-2">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">AI Assistant is thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat input box */}
                <form onSubmit={handleSendChatMessage} className="border-t border-slate-100 p-4 bg-slate-50/50 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isSendingChatMessage}
                    placeholder="Type your curriculum or quiz question here..."
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-primary disabled:opacity-55"
                  />
                  <button
                    type="submit"
                    disabled={isSendingChatMessage || !chatInput.trim()}
                    className="rounded-2xl bg-indigo-600 text-white px-5 py-3 text-xs font-bold shadow hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              </Card>
            </div>
          )}
        </section>

        <Footer />
      </main>

      <ToastContainer />
    </div>
  );
}
