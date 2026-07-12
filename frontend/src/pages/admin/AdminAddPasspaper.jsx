import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  BrainCircuit,
  CalendarDays,
  ChevronDown,
  Download,
  Eye,
  FilePlus2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';
import Footer from '../../ui/Footer';
import { AdminHeader, AdminSidebar } from '../../ui';
import logoicon from '../../assets/icons/logo.png';
import { getAuthSession } from '../../services/authService';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Quizzes', icon: FileText, to: '/admin/quizzes' },
  { label: 'Past Papers', icon: ShieldCheck, to: '/admin/past-papers', active: true },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

const PAPER_DATA = [
  {
    id: 1,
    title: '2023 Grade 5 Mathematics Paper',
    description: 'Official scholarship paper covering advanced arithmetic, geometry, and problem solving.',
    year: '2023',
    grade: 'Grade 5',
    subject: 'Mathematics',
    size: '4.2 MB',
    accent: 'from-indigo-500 to-violet-500',
    icon: BrainCircuit,
  },
  {
    id: 2,
    title: '2023 Grade 5 English Paper',
    description: 'Reading comprehension, grammar drills, and creative writing prompts.',
    year: '2023',
    grade: 'Grade 5',
    subject: 'English',
    size: '3.8 MB',
    accent: 'from-amber-500 to-orange-500',
    icon: BookOpen,
  },
  {
    id: 3,
    title: '2022 Grade 5 Science Paper',
    description: 'A strong foundation pack for life science, earth science, and physics concepts.',
    year: '2022',
    grade: 'Grade 5',
    subject: 'Science',
    size: '4.7 MB',
    accent: 'from-emerald-500 to-teal-500',
    icon: Sparkles,
  },
  {
    id: 4,
    title: '2021 Grade 5 Logical Reasoning',
    description: 'Reasoning and analytical challenge questions curated for exam prep.',
    year: '2021',
    grade: 'Grade 5',
    subject: 'IQ',
    size: '2.9 MB',
    accent: 'from-rose-500 to-pink-500',
    icon: GraduationCap,
  },
  {
    id: 5,
    title: '2020 Grade 6 Scholarship Paper',
    description: 'A complete practice pack with mixed difficulty and answer explanations.',
    year: '2020',
    grade: 'Grade 6',
    subject: 'Mathematics',
    size: '5.1 MB',
    accent: 'from-sky-500 to-cyan-500',
    icon: FileText,
  },
  {
    id: 6,
    title: '2019 Grade 5 Environment Paper',
    description: 'Focused on local environment, general knowledge, and study-friendly sections.',
    year: '2019',
    grade: 'Grade 5',
    subject: 'Environment',
    size: '3.3 MB',
    accent: 'from-violet-500 to-fuchsia-500',
    icon: CalendarDays,
  },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const CURRENT_YEAR = String(new Date().getFullYear());

function getAccentClass(subject) {
  switch (subject) {
    case 'English':
      return 'from-amber-500 to-orange-500';
    case 'Science':
      return 'from-emerald-500 to-teal-500';
    case 'IQ':
      return 'from-rose-500 to-pink-500';
    case 'Environment':
      return 'from-violet-500 to-fuchsia-500';
    default:
      return 'from-indigo-500 to-violet-500';
  }
}

function formatFileSize(size) {
  if (!size) return '0 KB';
  if (typeof size === 'string') return size;
  const inMb = size / (1024 * 1024);
  return inMb >= 1 ? `${inMb.toFixed(1)} MB` : `${(size / 1024).toFixed(0)} KB`;
}

const getPaperFileUrl = (path) => {
  if (!path) return '';
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const baseUrl = apiBase.replace('/api/v1', '');
  return `${baseUrl}/api/v1/uploads${path}`;
};

export default function AdminAddPasspaper() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [papers, setPapers] = useState(PAPER_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    detail: '',
    grade: 'Grade 5',
    subject: 'Mathematics',
    year: CURRENT_YEAR,
    file: null,
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // New states for Advanced Features
  const [editingPaper, setEditingPaper] = useState(null);
  const [filterMonth, setFilterMonth] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkProgress, setBulkProgress] = useState('');
  const [bulkPapers, setBulkPapers] = useState([
    { title: '', detail: '', grade: 'Grade 5', subject: 'Mathematics', year: CURRENT_YEAR, file: null, image: null }
  ]);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [metadataType, setMetadataType] = useState('subject'); // 'subject' or 'year'
  const [metadataValue, setMetadataValue] = useState('');

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) return;

    const loadFilters = async () => {
      try {
        const [papersResponse, gradesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/app/papers`, {
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

        if (papersResponse.ok) {
          const data = await papersResponse.json();
          const subjects = Array.isArray(data?.data?.subjects) ? data.data.subjects.filter((item) => item !== 'All Subjects') : [];
          const years = Array.isArray(data?.data?.years) ? data.data.years.filter((item) => item !== 'All Years') : [];

          setSubjectOptions(subjects);
          setYearOptions(years);

          if (Array.isArray(data?.data?.papers)) {
            setPapers(data.data.papers);
          }
        }

        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          const grades = Array.isArray(gradesData?.data)
            ? gradesData.data
                .map((grade) => grade.grade_name || grade.name || grade.title)
                .filter(Boolean)
            : [];

          setGradeOptions(grades);
        }
      } catch {
        // Ignore and keep fallback options empty.
      }
    };

    loadFilters();
  }, []);

  const availableSubjects = subjectOptions.length > 0 ? subjectOptions : ['Mathematics', 'English', 'Science', 'IQ', 'Environment'];
  const availableGrades = gradeOptions.length > 0 ? gradeOptions : ['Grade 5', 'Grade 6'];
  const availableYears = yearOptions.length > 0 ? yearOptions : [CURRENT_YEAR, String(Number(CURRENT_YEAR) - 1), String(Number(CURRENT_YEAR) - 2), String(Number(CURRENT_YEAR) - 3)];

  const uploadedThisMonthPapers = useMemo(() => {
    const now = new Date();
    return papers.filter((paper) => {
      if (!paper.created_at) return false;
      const d = new Date(paper.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [papers]);

  const visiblePapers = useMemo(() => {
    const basePapers = filterMonth ? uploadedThisMonthPapers : papers;
    return basePapers.filter((paper) => {
      const matchesSearch = `${paper.title} ${paper.description || paper.detail || ''} ${paper.subject}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesGrade = selectedGrade === 'All Grades' || paper.grade === selectedGrade || (selectedGrade === 'Grade 5' && !paper.grade);
      const matchesSubject = selectedSubject === 'All Subjects' || paper.subject === selectedSubject;
      const matchesYear = selectedYear === 'All Years' || String(paper.year) === String(selectedYear);

      return matchesSearch && matchesGrade && matchesSubject && matchesYear;
    });
  }, [papers, searchTerm, selectedGrade, selectedSubject, selectedYear, filterMonth, uploadedThisMonthPapers]);

  useEffect(() => {
    if (gradeOptions.length > 0 && !gradeOptions.includes(formData.grade)) {
      setFormData((value) => ({ ...value, grade: gradeOptions[0] }));
    }
  }, [gradeOptions, formData.grade]);

  useEffect(() => {
    if (subjectOptions.length > 0 && !subjectOptions.includes(formData.subject)) {
      setFormData((value) => ({ ...value, subject: subjectOptions[0] }));
    }
  }, [subjectOptions, formData.subject]);

  useEffect(() => {
    if (yearOptions.length > 0 && !yearOptions.includes(formData.year)) {
      setFormData((value) => ({ ...value, year: yearOptions[0] }));
    }
  }, [yearOptions, formData.year]);

  const resetForm = () => {
    setFormData({
      title: '',
      detail: '',
      grade: 'Grade 5',
      subject: 'Mathematics',
      year: CURRENT_YEAR,
      file: null,
      image: null,
    });
  };

  const handleOpenEditModal = (paper) => {
    setEditingPaper(paper);
    setFormData({
      title: paper.title || '',
      detail: paper.detail || paper.description || '',
      grade: paper.grade || 'Grade 5',
      subject: paper.subject || '',
      year: String(paper.year || CURRENT_YEAR),
      file: null,
      image: null,
    });
    setErrorMessage('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleOpenMetadataModal = (type) => {
    setMetadataType(type);
    setMetadataValue('');
    setErrorMessage('');
    setSuccessMessage('');
    setIsMetadataModalOpen(true);
  };

  const handleMetadataSubmit = async (e) => {
    e.preventDefault();
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      setErrorMessage('Please sign in again.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const url = metadataType === 'subject'
        ? `${API_BASE_URL}/app/subjects`
        : `${API_BASE_URL}/app/years`;
      
      const payload = metadataType === 'subject'
        ? { subject_name: metadataValue.trim() }
        : { year: metadataValue.trim() };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to save metadata');
      }

      setIsMetadataModalOpen(false);
      setMetadataValue('');

      if (metadataType === 'subject') {
        const newSub = data?.data?.subject_name || metadataValue.trim();
        setSubjectOptions((current) => current.includes(newSub) ? current : [...current, newSub]);
        setSuccessMessage('Subject added successfully.');
      } else {
        const newYr = String(data?.data?.years_name || metadataValue.trim());
        setYearOptions((current) => current.includes(newYr) ? current : [...current, newYr]);
        setSuccessMessage('Year added successfully.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBulkRow = () => {
    setBulkPapers((current) => [
      ...current,
      { title: '', detail: '', grade: 'Grade 5', subject: 'Mathematics', year: CURRENT_YEAR, file: null, image: null }
    ]);
  };

  const removeBulkRow = (index) => {
    setBulkPapers((current) => current.filter((_, i) => i !== index));
  };

  const updateBulkRow = (index, field, value) => {
    setBulkPapers((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      setErrorMessage('Please sign in again.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    const uploadedPapers = [];

    try {
      for (let i = 0; i < bulkPapers.length; i++) {
        const paper = bulkPapers[i];
        if (!paper.title.trim() || !paper.file) {
          throw new Error(`Paper #${i + 1} is missing title or PDF file.`);
        }
        
        setBulkProgress(`Uploading paper ${i + 1} of ${bulkPapers.length}: "${paper.title}"...`);

        const payload = new FormData();
        payload.append('title', paper.title.trim());
        payload.append('detail', paper.detail.trim());
        payload.append('subject', paper.subject);
        payload.append('year', paper.year.trim());
        payload.append('file', paper.file);
        if (paper.image) {
          payload.append('image', paper.image);
        }

        const response = await fetch(`${API_BASE_URL}/app/papers`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.tokens.accessToken}`,
          },
          body: payload,
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.message || `Failed uploading paper: ${paper.title}`);
        }

        const createdPaper = data?.data?.paper;
        const newPaper = {
          id: createdPaper?.id || Date.now(),
          title: createdPaper?.title || paper.title.trim(),
          detail: createdPaper?.detail || paper.detail.trim(),
          description: createdPaper?.detail || paper.detail.trim() || 'Uploaded from the admin panel.',
          year: String(createdPaper?.year ?? paper.year.trim() ?? CURRENT_YEAR),
          grade: paper.grade,
          subject: createdPaper?.subject || paper.subject,
          size: formatFileSize(paper.file.size),
          accent: getAccentClass(paper.subject),
          icon: BookOpen,
          image_url: createdPaper?.image_url,
          pdf_url: createdPaper?.pdf_url,
        };
        uploadedPapers.push(newPaper);
      }

      setIsBulkModalOpen(false);
      setPapers((current) => [...uploadedPapers, ...current]);
      setBulkPapers([{ title: '', detail: '', grade: 'Grade 5', subject: 'Mathematics', year: CURRENT_YEAR, file: null, image: null }]);
      setBulkProgress('');
      setSuccessMessage(`Successfully published pack of ${uploadedPapers.length} papers.`);
    } catch (err) {
      setErrorMessage(err.message || 'Error occurred during bulk upload');
    } finally {
      setIsSubmitting(false);
      setBulkProgress('');
    }
  };

  const handleCreatePaper = async (event) => {
    event.preventDefault();

    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      setErrorMessage('Please sign in again to upload a paper.');
      return;
    }

    if (!formData.title.trim() || (!editingPaper && !formData.file)) {
      setErrorMessage('Please add a title and select a PDF file.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('detail', formData.detail.trim());
      payload.append('subject', formData.subject);
      payload.append('year', formData.year.trim());
      if (formData.file) {
        payload.append('file', formData.file);
      }
      if (formData.image) {
        payload.append('image', formData.image);
      }

      const url = editingPaper
        ? `${API_BASE_URL}/app/papers/${editingPaper.id}`
        : `${API_BASE_URL}/app/papers`;
      const method = editingPaper ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: payload,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || 'Unable to save the paper.');
      }

      const savedPaper = data?.data?.paper;
      const displaySize = formData.file ? formData.file.size : (savedPaper?.size || editingPaper?.size || 0);
      const updatedPaperItem = {
        id: savedPaper?.id || editingPaper?.id || Date.now(),
        title: savedPaper?.title || formData.title.trim(),
        detail: savedPaper?.detail || formData.detail.trim(),
        description: savedPaper?.detail || formData.detail.trim() || 'Uploaded from the admin panel.',
        year: String(savedPaper?.year ?? formData.year.trim() ?? CURRENT_YEAR),
        grade: formData.grade,
        subject: savedPaper?.subject || formData.subject,
        size: displaySize,
        accent: getAccentClass(formData.subject),
        icon: BookOpen,
        image_url: savedPaper?.image_url || editingPaper?.image_url,
        pdf_url: savedPaper?.pdf_url || editingPaper?.pdf_url,
      };

      // Close modal immediately
      setIsModalOpen(false);
      
      // Update data after modal closes
      setTimeout(() => {
        if (editingPaper) {
          setPapers((current) => current.map((p) => (p.id === editingPaper.id ? updatedPaperItem : p)));
          setSuccessMessage('Paper updated successfully.');
        } else {
          setPapers((current) => [updatedPaperItem, ...current]);
          setSuccessMessage('Paper uploaded successfully.');
        }
        setSubjectOptions((current) => (current.includes(formData.subject) ? current : [...current, formData.subject]));
        setYearOptions((current) => (current.includes(formData.year.trim()) ? current : [...current, formData.year.trim()]));
        resetForm();
        setEditingPaper(null);
      }, 100);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save the paper.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <Sparkles size={16} /> Paper Library
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <img src={logoicon} alt="Quiz Master logo" className="h-10 w-auto" />
                  <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Past Scholarship Papers</h2>
                </div>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  Organize and publish scholarship past papers with the same polished experience as the rest of Quiz Master.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPaper(null);
                    setErrorMessage('');
                    setSuccessMessage('');
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary-fixed/40"
                >
                  <FilePlus2 size={16} /> Add New Paper
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setIsBulkModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
                >
                  <BookOpen size={16} /> Publish Pack
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenMetadataModal('subject')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary-fixed/40"
                >
                  <Sparkles size={16} /> Add Subject
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenMetadataModal('year')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary-fixed/40"
                >
                  <CalendarDays size={16} /> Add Year
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {successMessage ? (
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  {successMessage}
                </div>
              ) : null}
              {errorMessage ? (
                <div className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                  {errorMessage}
                </div>
              ) : null}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedSubject('All Subjects');
                  setSelectedGrade('All Grades');
                  setSelectedYear('All Years');
                  setSearchTerm('');
                  setFilterMonth(false);
                }}
                className="text-left rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:scale-102 hover:shadow-md cursor-pointer"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total Papers</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{papers.length}</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedSubject('All Subjects');
                  setSelectedGrade('All Grades');
                  setSelectedYear('All Years');
                  setSearchTerm('');
                  setFilterMonth(false);
                }}
                className="text-left rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:scale-102 hover:shadow-md cursor-pointer"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Total Subjects</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{availableSubjects.length}</p>
              </button>

              <button
                type="button"
                onClick={() => setFilterMonth((current) => !current)}
                className={`text-left rounded-3xl border p-5 shadow-sm transition hover:scale-102 hover:shadow-md cursor-pointer ${
                  filterMonth ? 'border-primary bg-primary-fixed/20' : 'border-slate-200 bg-white/80'
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Uploaded This Month</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{uploadedThisMonthPapers.length}</p>
              </button>
            </div>
          </div>
        </section>

        <section className="px-4 pb-6 md:px-8 md:px-10">
          <div className="rounded-[2rem] border border-surface-container-highest bg-white/80 p-5 shadow-soft md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Paper Collection</h3>
                <p className="mt-1 text-sm text-slate-500">Filter by grade, subject, or title to find the right resource quickly.</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <label className="relative block">
                  <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search papers"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:bg-white"
                  />
                </label>

                <label className="relative">
                  <select
                    value={selectedGrade}
                    onChange={(event) => setSelectedGrade(event.target.value)}
                    className="appearance-none rounded-full border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary focus:bg-white"
                  >
                    <option>All Grades</option>
                    {availableGrades.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </label>

                <label className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(event) => setSelectedSubject(event.target.value)}
                    className="appearance-none rounded-full border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary focus:bg-white"
                  >
                    <option>All Subjects</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </label>

                <label className="relative block">
                  <input
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(event.target.value)}
                    placeholder="Filter year"
                    list="year-filter-options"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary focus:bg-white"
                  />
                  <datalist id="year-filter-options">
                    <option value="All Years" />
                    {availableYears.map((year) => (
                      <option key={year} value={year} />
                    ))}
                  </datalist>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </label>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {visiblePapers.map((paper) => {
                const Icon = paper.icon || BookOpen;
                const accent = paper.accent || getAccentClass(paper.subject);
                const grade = paper.grade || 'Grade 5';
                const description = paper.detail || paper.description || 'No description available.';

                const handlePreview = () => {
                  if (paper.pdf_url) {
                    window.open(getPaperFileUrl(paper.pdf_url), '_blank');
                  }
                };

                const handleDownload = () => {
                  if (paper.pdf_url) {
                    const link = document.createElement('a');
                    link.href = getPaperFileUrl(paper.pdf_url);
                    link.setAttribute('download', paper.title + '.pdf');
                    link.setAttribute('target', '_blank');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                };

                return (
                  <article
                    key={paper.id}
                    className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className={`absolute -right-5 -top-5 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-20 transition duration-300 group-hover:scale-110`} />
                    <div className="relative flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-sm`}>
                        <Icon size={20} />
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                        {paper.year}
                      </span>
                    </div>

                    {/* Paper Image Cover */}
                    {paper.image_url ? (
                      <div className="mt-4 h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        <img
                          src={getPaperFileUrl(paper.image_url)}
                          alt={paper.title}
                          className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="mt-4 h-32 w-full bg-white flex items-center justify-center gap-2 rounded-xl border border-slate-200 shadow-sm">
                        <img src={logoicon} alt="Quiz Master Logo" className="h-10 w-auto opacity-35" />
                        <span className="text-lg font-black text-primary/45 tracking-tight">Quiz Master</span>
                      </div>
                    )}

                    <div className="relative mt-5">
                      <h4 className="text-lg font-black text-slate-900 line-clamp-1">{paper.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">{description}</p>
                    </div>

                    <div className="relative mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">{grade}</span>
                      <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">{paper.subject}</span>
                      <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">{formatFileSize(paper.size)}</span>
                    </div>

                    <div className="relative mt-6 flex gap-2">
                      <button
                        type="button"
                        onClick={handlePreview}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-white px-2 py-2 text-xs font-bold text-primary transition hover:bg-primary-fixed/40"
                      >
                        <Eye size={14} /> Preview
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-container px-2 py-2 text-xs font-bold text-white transition hover:opacity-95"
                      >
                        <Download size={14} /> Download
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(paper)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                      >
                        <Settings size={14} /> Edit
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {visiblePapers.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No papers match your current filters yet.
              </div>
            ) : null}
          </div>
        </section>

        {isModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                    {editingPaper ? 'Edit Paper' : 'Upload paper'}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">
                    {editingPaper ? 'Edit Scholarship Paper' : 'Create a new scholarship paper'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                    setEditingPaper(null);
                    setErrorMessage('');
                  }}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreatePaper} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Paper title
                    <input
                      value={formData.title}
                      onChange={(event) => setFormData((value) => ({ ...value, title: event.target.value }))}
                      placeholder="2024 Grade 5 Mathematics Paper"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                      required
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
                        <option value="Grade 5">Grade 5</option>
                      )}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Subject
                    <select
                      value={formData.subject}
                      onChange={(event) => setFormData((value) => ({ ...value, subject: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                    >
                      {subjectOptions.length > 0 ? (
                        subjectOptions.map((subject) => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))
                      ) : (
                        <option value="Mathematics">Mathematics</option>
                      )}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Year
                    <select
                      value={formData.year}
                      onChange={(event) => setFormData((value) => ({ ...value, year: event.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                      required
                    >
                      {availableYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Description
                  <textarea
                    value={formData.detail}
                    onChange={(event) => setFormData((value) => ({ ...value, detail: event.target.value }))}
                    rows="4"
                    placeholder="Add a short description of the paper."
                    className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    PDF file
                    <div className="mt-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => setFormData((value) => ({ ...value, file: event.target.files?.[0] || null }))}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-primary-container file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                        required={!editingPaper}
                      />
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                        <UploadCloud size={16} className="text-primary" />
                        <span>{formData.file ? formData.file.name : editingPaper ? 'Leave empty to keep existing PDF' : 'Select a PDF file to upload'}</span>
                      </div>
                    </div>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Cover image (optional)
                    <div className="mt-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => setFormData((value) => ({ ...value, image: event.target.files?.[0] || null }))}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-primary-container file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                      />
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                        <UploadCloud size={16} className="text-primary" />
                        <span>{formData.image ? formData.image.name : editingPaper ? 'Leave empty to keep existing cover' : 'Optional image for the paper preview'}</span>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                      setEditingPaper(null);
                      setErrorMessage('');
                    }}
                    className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : editingPaper ? <Settings size={16} /> : <FilePlus2 size={16} />}
                    {isSubmitting ? 'Saving...' : editingPaper ? 'Save Changes' : 'Create Paper'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* Publish Pack (Bulk Upload) Modal */}
        {isBulkModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl my-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Bulk Upload</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">Publish Pack (Multiple Papers)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setBulkPapers([{ title: '', detail: '', grade: 'Grade 5', subject: 'Mathematics', year: CURRENT_YEAR, file: null, image: null }]);
                    setBulkProgress('');
                    setErrorMessage('');
                  }}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {bulkProgress && (
                <div className="mt-4 p-4 rounded-2xl bg-primary-fixed/20 border border-primary/20 text-primary font-semibold text-sm">
                  {bulkProgress}
                </div>
              )}

              <form onSubmit={handleBulkSubmit} className="mt-6 space-y-6">
                <div className="max-h-[50vh] overflow-y-auto space-y-6 pr-2">
                  {bulkPapers.map((paper, index) => (
                    <div key={index} className="p-4 rounded-3xl border border-slate-200 bg-slate-50 relative space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-primary">Paper #{index + 1}</span>
                        {bulkPapers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBulkRow(index)}
                            className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-rose-700 inset-ring inset-ring-rose-600/10"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Paper title
                          <input
                            value={paper.title}
                            onChange={(e) => updateBulkRow(index, 'title', e.target.value)}
                            placeholder="e.g. 2024 Grade 5 Mathematics Paper"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                            required
                          />
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                          Grade
                          <select
                            value={paper.grade}
                            onChange={(e) => updateBulkRow(index, 'grade', e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                          >
                            {availableGrades.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Subject
                          <select
                            value={paper.subject}
                            onChange={(e) => updateBulkRow(index, 'subject', e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                          >
                            {availableSubjects.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                          Year
                          <select
                            value={paper.year}
                            onChange={(e) => updateBulkRow(index, 'year', e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                            required
                          >
                            {availableYears.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label className="block text-sm font-semibold text-slate-700">
                        Description
                        <textarea
                          value={paper.detail}
                          onChange={(e) => updateBulkRow(index, 'detail', e.target.value)}
                          rows="2"
                          placeholder="Add a short description."
                          className="mt-2 w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                        />
                      </label>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          PDF file
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => updateBulkRow(index, 'file', e.target.files?.[0] || null)}
                            className="mt-2 block w-full text-sm text-slate-100 inline-flex items-center rounded-md bg-indigo-500 px-2 py-1 text-xs font-medium text-indigo-700 inset-ring inset-ring-indigo-600/10"
                            required
                          />
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                          Cover image (optional)
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => updateBulkRow(index, 'image', e.target.files?.[0] || null)}
                            className="mt-2 block w-full text-sm text-slate-100 inline-flex items-center rounded-md bg-indigo-500 px-2 py-1 text-xs font-medium text-indigo-700 inset-ring inset-ring-indigo-600/10"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={addBulkRow}
                    className="rounded-full border border-primary/20 bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary-fixed/40"
                  >
                    + Add Another Paper
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBulkModalOpen(false);
                        setBulkPapers([{ title: '', detail: '', grade: 'Grade 5', subject: 'Mathematics', year: CURRENT_YEAR, file: null, image: null }]);
                        setBulkProgress('');
                      }}
                      className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-70"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
                      {isSubmitting ? 'Publishing...' : 'Publish Pack'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* Metadata Modal */}
        {isMetadataModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-[500px] rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Add New {metadataType === 'subject' ? 'Subject' : 'Year'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the new {metadataType === 'subject' ? 'subject name' : 'year'} to save in the system.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMetadataModalOpen(false);
                    setMetadataValue('');
                  }}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleMetadataSubmit} className="mt-6 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  {metadataType === 'subject' ? 'Subject Name' : 'Year Value'}
                  <input
                    type={metadataType === 'subject' ? 'text' : 'number'}
                    value={metadataValue}
                    onChange={(e) => setMetadataValue(e.target.value)}
                    placeholder={metadataType === 'subject' ? 'e.g. History' : 'e.g. 2025'}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                    required
                  />
                </label>

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMetadataModalOpen(false);
                      setMetadataValue('');
                    }}
                    className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        <Footer />
      </main>
    </div>
  );
}
