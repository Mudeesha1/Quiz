import { Home, RefreshCw, Sparkles, TriangleAlert } from 'lucide-react';
import logoicon from '../../assets/icons/logo.png';
import errorIllustration from '../../assets/images/500.png';
import Footer from '../../ui/Footer';

export default function Error500Page() {
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
                <h1 className="text-xl font-black text-slate-900">The server is having a tough moment</h1>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-3 py-1 text-sm font-semibold text-primary">
              <Sparkles size={16} /> Student-friendly error page
            </div>
          </div>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex justify-center lg:justify-start">
              <div className="relative flex h-72 w-72 items-center justify-center rounded-[2rem] border border-slate-200 bg-gradient-to-br from-primary-fixed via-white to-secondary-fixed p-6 shadow-xl sm:h-80 sm:w-80">
                <img src={errorIllustration} alt="Friendly illustration for a 500 error page" className="h-full w-full object-contain p-4" />
              </div>
            </div>

            <div className="max-w-full">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
                <TriangleAlert size={16} /> Error 500
              </div>
              <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
                Server Melt Down
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Our systems are overheating, but the team is already working to bring the mission back online.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3 text-sm font-bold text-white transition hover:opacity-95"
                >
                  <Home size={16} /> Back to Home
                </a>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-primary transition hover:bg-primary-fixed/40"
                >
                  <RefreshCw size={16} /> Try Again
                </button>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                <p className="font-semibold text-slate-800">Note:</p>
                <p className="mt-1">
                  If this keeps happening, please come back in a few moments while we stabilize the experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
