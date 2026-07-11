import { ArrowLeft, Home, LockKeyhole, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoicon from '../../assets/icons/logo.png';
import errorIllustration from '../../assets/images/403 Error Forbidden-amico.png';
import Footer from '../../ui/Footer';

const TIPS = [
  'Complete a few more practice quizzes to unlock this zone.',
  'Ask your teacher or admin for access to this mission.',
  'Keep your account details updated to avoid blocked access.',
];

export default function Error403Page() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface font-body-md">
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute left-[-60px] top-[-60px] h-56 w-56 rounded-full bg-primary-fixed/50 blur-3xl" />
        <div className="absolute bottom-[-70px] right-[-40px] h-72 w-72 rounded-full bg-secondary-fixed/40 blur-3xl" />

        <div className="relative z-10 w-full max-w-6xl rounded-[2rem] border border-surface-container-highest bg-white/80 p-6 shadow-soft backdrop-blur md:p-10 lg:p-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <img src={logoicon} alt="Quiz Master logo" className="h-10 w-auto" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Quiz Master</p>
                <h1 className="text-xl font-black text-slate-900">This mission is locked for now</h1>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-3 py-1 text-sm font-semibold text-primary">
              <Sparkles size={16} /> Student-friendly error page
            </div>
          </div>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex justify-center lg:justify-start">
              <div className="relative flex h-72 w-72 items-center justify-center rounded-[2rem] border border-slate-200 bg-gradient-to-br from-primary-fixed via-white to-secondary-fixed p-6 shadow-xl sm:h-80 sm:w-80">
                <img src={errorIllustration} alt="Friendly illustration for a 403 error page" className="h-full w-full object-contain p-4" />
                <div className="absolute -bottom-4 -right-4 rounded-lg border-4 border-white bg-rose-600 px-7 py-2 text-3xl font-black text-white shadow-lg rotate-3">
                  403
                </div>
              </div>
            </div>

            <div className="max-w-full">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
                <ShieldAlert size={16} /> Error 403
              </div>
              <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
                Access Denied
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                You don’t have the required access to open this area yet. Keep practicing, complete your missions, and unlock new learning zones.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3 text-sm font-bold text-white transition hover:opacity-95"
                >
                  <Home size={16} /> Back to Safety
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-primary transition hover:bg-primary-fixed/40"
                >
                  <LockKeyhole size={16} /> Help Center
                </Link>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                <p className="font-semibold text-slate-800">Pro Tip:</p>
                <ul className="mt-2 space-y-2">
                  {TIPS.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
