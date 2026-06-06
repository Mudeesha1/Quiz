import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Mail, LockKeyhole } from 'lucide-react';
import logoicon from '../assets/icons/logo.png';
import Footer from '../ui/Footer';
import { Toast, useToast } from '../ui/Toast';

export default function ForgetPassWord() {
    const navigate = useNavigate();
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError('Email is required.');
            return;
        }
        
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            // Mock API submission
            await new Promise((resolve) => setTimeout(resolve, 1200));
            toast.success(`Recovery code sent successfully to ${email}! Check your inbox.`);
            setEmail('');
        } catch (err) {
            toast.error('Failed to send recovery code. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f8ff_0%,#fbfbff_55%,#f6f7fb_100%)] text-gray-800 flex flex-col">
            {/* Playful Background Accents (LoginPage Theme aligned) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(255,185,95,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_22%)]" />
                <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(to_right,rgba(79,70,229,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.08)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(circle_at_center,black_42%,transparent_86%)]" />   
                <div className="absolute top-0 rounded-full -left-20 h-80 w-80 bg-indigo-200/40 blur-3xl" />
                <div className="absolute rounded-full -right-20 top-16 h-96 w-96 bg-amber-200/30 blur-3xl" />
                <div className="absolute rounded-full -bottom-24 left-1/4 h-96 w-96 bg-emerald-200/30 blur-3xl" />
            </div>

            <main className="relative z-10 flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-12">
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="absolute inline-flex items-center gap-1 text-sm font-semibold transition left-4 top-4 text-primary hover:text-primary-container sm:left-6 sm:top-6"
                    aria-label="Back to home"
                >
                    <ChevronLeft size={18} /> Back to Home
                </button>

                {/* Main Content Card */}
                <div className="w-full max-w-[520px] bg-white/80 border border-outline-variant rounded-[2rem] p-6 md:p-10 shadow-[0_12px_40px_-18px_rgba(17,24,39,0.24)] backdrop-blur-md relative overflow-hidden">
                    {/* Playful Background Accents */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-fixed rounded-full opacity-30"></div>
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-tertiary-fixed-dim rounded-full opacity-20"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Rotated Square with Logo Icon */}
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center mb-8 shadow-md transform rotate-3">
                            <img src={logoicon} alt="Quiz Master logo" className="object-contain w-10 h-10 md:w-12 md:h-12" />
                        </div>

                        {/* Title & Subtext */}
                        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary text-center mb-4">
                            Forgot Your Password?
                        </h1>
                        <p className="font-body-md text-body-md text-on-surface-variant text-center mb-10 max-w-[360px]">
                            Don't worry! Enter your email and we'll send you a recovery code.
                        </p>

                        {/* Recovery Form */}
                        <form className="w-full space-y-8" onSubmit={handleSubmit}>
                            <div className="space-y-3">
                                <label className="font-label-lg text-label-lg text-on-surface-variant ml-2 block" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline flex items-center pointer-events-none">
                                        <Mail size={18} strokeWidth={2} />
                                    </span>
                                    <input
                                        className={`w-full pl-12 pr-4 py-4 bg-surface-container border-2 focus:ring-0 rounded-xl font-body-md text-body-md placeholder:text-outline-variant transition-all text-on-surface ${
                                            error ? 'border-error' : 'border-transparent focus:border-primary'
                                        }`}
                                        id="email"
                                        name="email"
                                        placeholder="student@quizmaster.lk"
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (error) setError('');
                                        }}
                                    />
                                </div>
                                {error && (
                                    <p className="px-2 text-xs font-semibold text-error">
                                        {error}
                                    </p>
                                )}
                            </div>

                            {/* CTA Button */}
                            <button
                                className="w-full py-5 bg-amber-400 text-gray-900 font-button-text text-button-text rounded-full shadow-[0_4px_0_0_#855300] hover:bg-amber-300 active:translate-y-[2px] active:shadow-[0_2px_0_0_#855300] transition-all flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-70"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                <span>{isSubmitting ? 'Sending...' : 'Send Recovery Code'}</span>
                                <ArrowRight size={20} strokeWidth={2.5} />
                            </button>
                        </form>

                        {/* Alternative Action */}
                        <div className="mt-10 pt-8 border-t border-outline-variant w-full text-center">
                            <Link
                                className="inline-flex items-center gap-2 font-label-lg text-label-lg text-primary hover:text-indigo-600 transition-colors group"
                                to="/login"
                            >
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Decorative Illustration Side Elements (Visible on larger screens) */}
            <div className="hidden xl:block fixed left-12 top-1/2 -translate-y-1/2 w-[300px] h-[400px] rounded-lg overflow-hidden border border-outline-variant shadow-sm rotate-[-2deg] pointer-events-none">
                <img
                    alt="Learning Concept"
                    className="w-full h-full object-cover grayscale opacity-40 mix-blend-multiply"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdU_j0gA5ND3zz0vVqmYBQzlwhG_oIlNJwMqZpr-7Ptz0g1yY6slHMuxgBecxN7k8f1Z7AozvYV89MJ6bo1imPx0MC5azPUcWl32kzRZKLepGFKyhlWt_DUiQw0GQ0vtP1jCI5853ReiRiOx0dxr5cV1bU7NQOX70PB9tKC8jV2UA2OuEdbedt283leZ4LZU69IJYMV8zAgpJSFHyKT7zrqmH61aFNEqmEoWEI7pQ1uH3_zXM-Bx5m-fOCHKMykJzXzdOygqya-JI"
                />
            </div>
            <div className="hidden xl:block fixed right-12 top-1/2 -translate-y-1/2 w-[300px] h-[400px] rounded-lg overflow-hidden border border-outline-variant shadow-sm rotate-[2deg] pointer-events-none">
                <img
                    alt="Knowledge Concept"
                    className="w-full h-full object-cover grayscale opacity-40 mix-blend-multiply"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCafOrXtmI99aWjJi761gYGhlZkmYAkKI6T-KI-pTJlzkafkBrjxWexvP2dZsSJS-hhq9ityMarSemuI6hvBe65iCyd33DvLWz-i468p8mJgvKHlHjAhysnR8IbLZW3zJ73hHWQXQYby1OqHCGo8JQ1nwzr66tu9Ufm-BkiScZhMe87YfBTm-TP2FSc4SBE-w2uoxwT2Z6SrFpp05e2MbMWEifbFaX6b1oebgapvJVfSlaIZIRMS5_FkM7_ig2zaDPrBaqwcRWUxfI"
                />
            </div>

            {/* Toasts list */}
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

            {/* Footer Component */}
            <Footer />
        </div>
    );
}
