import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  GraduationCap,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  NotebookPen,
  PencilLine,
  Calculator,
  UserRound,
  BookText,
  UserCheck,
  ChevronLeft,
} from 'lucide-react';
import logoicon from '../assets/icons/logo.png';
import { Toast, useToast } from '../ui/Toast';
import { registerUser } from '../services/authService';

function Field({ label, id, icon: Icon, type = 'text', placeholder, error = '', value, onChange, children }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-bold text-on-surface">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 pointer-events-none text-outline">
          <Icon size={18} strokeWidth={2} />
        </span>
        {children ?? (
          <input
            id={id}
            name={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`h-12 w-full rounded-full border bg-surface-container-low px-4 pl-12 pr-4 text-sm text-on-surface shadow-[0_1px_0_rgba(255,255,255,0.7)_inset] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-fixed/60 ${error ? 'border-error focus:ring-error/20' : 'border-outline-variant'}`}
          />
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="px-1 text-xs font-semibold text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PasswordField({ label, id, placeholder, value, onChange, error = '' }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-bold text-on-surface">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-outline">
          <LockKeyhole size={18} strokeWidth={2} />
        </span>
        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-12 w-full rounded-full border border-outline-variant bg-surface-container-low px-4 pl-12 pr-14 text-sm text-on-surface shadow-[0_1px_0_rgba(255,255,255,0.7)_inset] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-fixed/60"
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-4 transition text-outline hover:text-primary"
        >
          {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="px-1 text-xs font-semibold text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ConfirmPasswordField({ label, id, placeholder, value, onChange, error = '' }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-bold text-on-surface">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-outline">
          <LockKeyhole size={18} strokeWidth={2} />
        </span>
        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-12 w-full rounded-full border bg-surface-container-low px-4 pl-12 pr-14 text-sm text-on-surface shadow-[0_1px_0_rgba(255,255,255,0.7)_inset] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-fixed/60 ${error ? 'border-error focus:ring-error/20' : 'border-outline-variant'}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? 'Hide confirm password' : 'Show confirm password'}
          className="absolute inset-y-0 right-0 flex items-center pr-4 transition text-outline hover:text-primary"
        >
          {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="px-1 text-xs font-semibold text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function getPasswordChecks(password) {
  return {
    length: password.length > 5 && password.length < 12,
    number: /\d/.test(password),
    uppercase: /[A-Z]/.test(password),
  };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [grades, setGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '0',
    schoolName: '',
  });
  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    schoolName: '',
  });

  const passwordChecks = getPasswordChecks(values.password);
  const passwordLengthError =
    values.password.length > 0 && (values.password.length <= 5 || values.password.length >= 12)
      ? 'Password must be between 6 and 11 characters.'
      : '';
  const passwordsMatch = values.confirmPassword.length > 0 && values.password === values.confirmPassword;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      grade: '',
      schoolName: '',
    };

    if (!values.fullName.trim()) nextErrors.fullName = 'Full Name is required.';
    if (!values.username.trim()) nextErrors.username = 'Username is required.';

    if (!values.email.trim()) {
      nextErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!values.password) {
      nextErrors.password = 'Password is required.';
    } else if (!passwordChecks.length || !passwordChecks.number || !passwordChecks.uppercase) {
      nextErrors.password = 'Password must be 6-11 chars, with one number and one capital letter.';
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm Password is required.';
    } else if (!passwordsMatch) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!values.grade || values.grade === '0') nextErrors.grade = 'Grade is required.';
    if (!values.schoolName.trim()) nextErrors.schoolName = 'School Name is required.';

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await registerUser({
        fullName: values.fullName,
        username: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        grade: Number(values.grade),
        schoolName: values.schoolName,
      });

      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 900);
    } catch (error) {
      const fieldErrors = error?.fieldErrors || {};

      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({
          ...current,
          ...fieldErrors,
        }));
      } else {
        toast.error(error?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load grades from backend
  useEffect(() => {
    const loadGrades = async () => {
      try {
        setLoadingGrades(true);
        const base = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${base}/app/grades`);
        if (!res.ok) throw new Error('Failed to fetch grades');
        const json = await res.json();
        // Expecting { status: 'success', data: [...] }
        const data = json?.data ?? [];
        setGrades(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Load grades error', err);
        setGrades([]);
      } finally {
        setLoadingGrades(false);
      }
    };

    loadGrades();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f6f7ff_0%,#fbfbff_52%,#f8f9fb_100%)] px-4 py-10 text-on-background sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,185,95,0.16),transparent_24%),radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_20%)]" />
        <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(79,70,229,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.08)_1px,transparent_1px)] bg-size-[42px_42px] mask-[radial-gradient(circle_at_center,black_50%,transparent_88%)]" />
        <div className="absolute right-[-6%] top-[-4%] h-56 w-56 rounded-full bg-primary-fixed/45 blur-3xl" />
        <div className="absolute left-[-8%] bottom-[-6%] h-64 w-64 rounded-full bg-secondary-fixed/40 blur-3xl" />
        <div className="absolute right-8 top-10 rotate-12 text-primary/10">
          <BookText size={110} strokeWidth={1.2} />
        </div>
        <div className="absolute left-8 bottom-12 -rotate-12 text-secondary/10">
          <GraduationCap size={120} strokeWidth={1.2} />
        </div>
        <div className="absolute left-[18%] top-[16%] -rotate-12 text-indigo-400/10">
          <NotebookPen size={52} strokeWidth={1.5} />
        </div>
        <div className="absolute right-[18%] top-[28%] rotate-6 text-amber-400/10">
          <Calculator size={58} strokeWidth={1.5} />
        </div>
        <div className="absolute right-[12%] bottom-[18%] rotate-[-18deg] text-emerald-500/10">
          <PencilLine size={48} strokeWidth={1.5} />
        </div>
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <section className="relative z-10 w-full max-w-130 overflow-hidden rounded-[2rem] border border-outline-variant/70 bg-surface-container-lowest px-6 py-8 shadow-[0_24px_60px_-18px_rgba(17,24,39,0.18)] sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute right-[-4rem] top-[-4rem] h-36 w-36 rounded-full bg-primary-fixed/45 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-18 left-[-4rem] h-40 w-40 rounded-full bg-secondary-fixed/45 blur-3xl" />

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 mb-6 text-sm font-semibold transition text-primary hover:text-primary-container"
            aria-label="Back to home"
          >
            <ChevronLeft size={18} /> Back to Home
          </button>

          <div className="relative z-10">
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-white shadow-[0_16px_28px_-14px_rgba(79,70,229,0.75)]">
                <img src={logoicon} alt="Quiz Master logo" className="object-contain w-12 h-12" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-[2rem] sm:leading-tight">
                Join the Adventure!
              </h1>
              <p className="mt-2 text-sm font-medium text-on-surface-variant sm:text-base">
                Create your account to start playing and learning.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <Field
                label="Full Name"
                id="fullName"
                icon={UserRound}
                placeholder="e.g. Mudeesha Deshan"
                value={values.fullName}
                onChange={handleChange}
                error={errors.fullName}
              />

              <Field
                label="Username"
                id="username"
                icon={UserRound}
                placeholder="Pick a fun name!"
                value={values.username}
                onChange={handleChange}
                error={errors.username}
              />

              <Field
                label="Email Address"
                id="email"
                icon={Mail}
                type="email"
                placeholder="parent@email.com"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <PasswordField
                    label="Password"
                    id="password"
                    placeholder="Secret code"
                    value={values.password}
                    onChange={handleChange}
                    error={errors.password || passwordLengthError}
                  />
                  <div className="px-2 py-2 space-y-1 font-semibold border text-[8px] rounded-sm border-outline-variant bg-surface-container-low text-on-surface-variant">
                    <p className={passwordChecks.length ? 'text-tertiary text-xs font-semibold' : 'text-error text-xs font-semibold'}>
                      {passwordChecks.length ? '✓' : '•'} More than 5 characters
                    </p>
                    <p className={passwordChecks.number ? 'text-tertiary text-xs font-semibold' : 'text-error text-xs font-semibold'}>
                      {passwordChecks.number ? '✓' : '•'} Contains a number
                    </p>
                    <p className={passwordChecks.uppercase ? 'text-tertiary text-xs font-semibold' : 'text-error text-xs font-semibold'}>
                      {passwordChecks.uppercase ? '✓' : '•'} Contains a capital letter
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <ConfirmPasswordField
                    label="Confirm Password"
                    id="confirmPassword"
                    placeholder="Type it again"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                  />
                  <p className={`text-xs font-semibold ${values.confirmPassword && passwordsMatch ? 'text-tertiary' : 'text-error'}`}>
                    {values.confirmPassword
                      ? passwordsMatch
                        ? '✓ Passwords match'
                        : 'Passwords do not match'
                      : ' '}
                  </p>
                </div>
              </div>

                <Field label="Grade" id="grade" icon={GraduationCap} error={errors.grade}>
                  <div className="relative">
                    <select
                      id="grade"
                      name="grade"
                      value={values.grade}
                      onChange={handleChange}
                      className="w-full h-12 px-4 pl-12 text-sm transition border rounded-full outline-none appearance-none border-outline-variant bg-surface-container-low pr-11 text-on-surface focus:border-primary focus:ring-4 focus:ring-primary-fixed/60"
                    >
                      <option value="0" disabled>
                        {loadingGrades ? 'Loading grades...' : 'Select your grade'}
                      </option>
                      {grades.length > 0
                        ? grades.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.grade_name}
                            </option>
                          ))
                        : !loadingGrades && (
                            <>
                              <option value="1">Grade 1</option>
                              <option value="2">Grade 2</option>
                              <option value="3">Grade 3</option>
                              <option value="4">Grade 4</option>
                              <option value="5">Grade 5</option>
                            </>
                          )}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-outline">
                      <ChevronDown size={18} strokeWidth={2.25} />
                    </span>
                  </div>
                </Field>
              <Field
                label="School Name"
                id="schoolName"
                icon={Building2}
                placeholder="e.g. Kirindiwela Central College"
                value={values.schoolName}
                onChange={handleChange}
                error={errors.schoolName}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#10B981] px-6 text-sm font-extrabold text-white shadow-[0_14px_24px_-10px_rgba(16,185,129,0.8)] transition hover:-translate-y-0.5 hover:bg-[#13c18b] focus:outline-none focus:ring-4 focus:ring-emerald-300/60 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{isSubmitting ? 'Registering...' : 'Register Now'} </span>
                <span className="text-base"> <UserCheck size={22} strokeWidth={2} /></span>
              </button>
            </form>

            <div className="fixed z-50 space-y-3 top-4 right-4">
              {toast.toasts.map((item) => (
                <Toast
                  key={item.id}
                  type={item.type}
                  message={item.message}
                  duration={item.duration}
                  onClose={() => toast.removeToast(item.id)}
                />
              ))}
            </div>

            <p className="relative z-10 mt-8 text-sm font-medium text-center text-on-surface-variant">
              Already have an account?{' '}
              <a href="/login" className="font-extrabold underline transition text-primary decoration-primary/40 underline-offset-4 hover:text-primary-container">
                Log In here
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}