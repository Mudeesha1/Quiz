import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound, ShieldUser } 
from 'lucide-react';

import { ButtonPrimary, ButtonSecondary } from '../../ui/Button';

function LoginField({ label, id, icon: Icon, type = 'text', placeholder, value, onChange }) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-bold text-slate-900">
                {label}
            </label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400">
                    <Icon size={18} strokeWidth={2} />
                </span>
                <input
                    id={id}
                    name={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-4 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
            </div>
        </div>
    );
}

function PasswordField({ label, id, icon: Icon, placeholder, value, onChange }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-bold text-slate-900">
                {label}
            </label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Icon size={18} strokeWidth={2} />
                </span>
                <input
                    id={id}
                    name={id}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-4 pl-12 pr-14 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 transition hover:text-indigo-600"
                >
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
            </div>
        </div>
    );
}

export default function AdminLogin() {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        username: '',
        password: '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues((current) => ({
            ...current,
            [name]: value,
        }));
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f8ff_0%,#fbfbff_55%,#f6f7fb_100%)] text-gray-800">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(255,185,95,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_22%)]" />
                <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(to_right,rgba(79,70,229,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.08)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(circle_at_center,black_42%,transparent_86%)]" />   
                <div className="absolute top-0 rounded-full -left-20 h-80 w-80 bg-indigo-200/40 blur-3xl" />
                <div className="absolute rounded-full -right-20 top-16 h-96 w-96 bg-amber-200/30 blur-3xl" />
                <div className="absolute rounded-full -bottom-24 left-1/4 h-96 w-96 bg-emerald-200/30 blur-3xl" />
            </div>

            <main className="relative z-10 flex min-h-[calc(100vh-1px)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="absolute inline-flex items-center gap-1 text-sm font-semibold transition left-4 top-4 text-primary hover:text-primary-container sm:left-6 sm:top-6"
                    aria-label="Back to home"
                >
                    <ChevronLeft size={18} /> Back to Home
                </button>

                <div className="w-full max-w-4/12 max-sm:max-w-full max-md:max-w-3/4 max-lg:max-w-2/4">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-indigo-100 shadow-[0_18px_30px_-16px_rgba(79,70,229,0.85)]">
                            <ShieldUser  size={44} className="text-indigo-700" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-indigo-700 sm:text-[2.7rem] sm:leading-tight">
                            Quiz Master
                        </h1>
                        <p className="mt-2 text-base font-medium text-slate-600">
                            Admin portal for the Quiz Master experience.
                        </p>
                    </div>

                    <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_12px_40px_-18px_rgba(17,24,39,0.24)] backdrop-blur-md sm:p-8">
                        <form className="space-y-5">
                            <LoginField
                                label="Admin Email"
                                id="username"
                                icon={UserRound}
                                placeholder="admin@quizmaster.com"
                                value={values.username}
                                onChange={handleChange}
                            />

                            <PasswordField
                                label="Password"
                                id="password"
                                icon={LockKeyhole}
                                placeholder="••••••••"
                                value={values.password}
                                onChange={handleChange}
                            />

                            <ButtonSecondary type="button" className="w-full justify-center gap-2 py-4 text-base bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300">
                              LOGIN AS ADMIN
                                <ArrowRight size={18} />
                            </ButtonSecondary>
                        </form>

                    </section>
                </div>
            </main>

            
        </div>
    );
}
