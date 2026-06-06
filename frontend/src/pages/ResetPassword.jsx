import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ChevronLeft, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import logoicon from '../assets/icons/logo.png';
import Footer from '../ui/Footer';
import { Toast, useToast } from '../ui/Toast';
import { resetPassword, clearAuthSession } from '../services/authService';

export default function ResetPassword() {
    const navigate = useNavigate();
    const toast = useToast();
    const location = useLocation();
    const emailFromState = location.state?.email || '';
    
    // States
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({
        otp: '',
        password: '',
        confirmPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only keep the last character
        setOtp(newOtp);

        // Clear OTP error
        if (errors.otp) {
            setErrors(prev => ({ ...prev, otp: '' }));
        }

        // Focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
            }
        }
    };

    const validateForm = () => {
        const nextErrors = { otp: '', password: '', confirmPassword: '' };
        let isValid = true;

        if (otp.some(digit => !digit)) {
            nextErrors.otp = 'Please enter the full 6-digit verification code.';
            isValid = false;
        }

        if (!password) {
            nextErrors.password = 'New password is required.';
            isValid = false;
        } else if (password.length < 6 || password.length > 11) {
            nextErrors.password = 'Password must be between 6 and 11 characters.';
            isValid = false;
        } else if (!/[A-Z]/.test(password) || !/\d/.test(password)) {
            nextErrors.password = 'Password must include at least one capital letter and one number.';
            isValid = false;
        }

        if (!confirmPassword) {
            nextErrors.confirmPassword = 'Confirm new password is required.';
            isValid = false;
        } else if (password !== confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match.';
            isValid = false;
        }

        setErrors(nextErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!emailFromState) {
            toast.error('Missing email address. Please request a new recovery code.');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const verificationCode = otp.join('');
            await resetPassword({
                email: emailFromState,
                otp: verificationCode,
                password,
            });
            
            toast.success('Your password has been successfully reset!');
            
            // Clear auth session / log out the user
            clearAuthSession();
            
            // Redirect to login page after toast
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 1500);
        } catch (err) {
            const errMsg = err.message || 'Failed to reset password. Please try again.';
            toast.error(errMsg);
            setErrors(prev => ({
                ...prev,
                otp: err.fieldErrors?.otp || '',
                password: err.fieldErrors?.password || '',
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f8ff_0%,#fbfbff_55%,#f6f7fb_100%)] text-gray-800 flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop">
            {/* Playful Background Accents (LoginPage Theme aligned) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(255,185,95,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_22%)]" />
                <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(to_right,rgba(79,70,229,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.08)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(circle_at_center,black_42%,transparent_86%)]" />   
                <div className="absolute top-0 rounded-full -left-20 h-80 w-80 bg-indigo-200/40 blur-3xl" />
                <div className="absolute rounded-full -right-20 top-16 h-96 w-96 bg-amber-200/30 blur-3xl" />
                <div className="absolute rounded-full -bottom-24 left-1/4 h-96 w-96 bg-emerald-200/30 blur-3xl" />
            </div>

            {/* Brand Anchor */}
            <header className="mb-10 text-center relative z-10 flex flex-col items-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-indigo-100 shadow-[0_12px_24px_-10px_rgba(79,70,229,0.85)]">
                    <img src={logoicon} alt="Quiz Master logo" className="object-contain w-10 h-10" />
                </div>
                <h1 className="font-headline-lg text-headline-lg font-black text-primary">Quiz Master</h1>
            </header>

            <main className="w-full max-w-[560px] relative z-10 flex-grow flex items-center justify-center">
                {/* Reset Password Card */}
                <div className="bg-white/80 rounded-[2.5rem] shadow-[0_12px_40px_-18px_rgba(17,24,39,0.24)] border border-outline-variant p-8 md:p-10 text-center relative overflow-hidden backdrop-blur-md w-full">
                    
                    {/* Playful Decorative Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-fixed rounded-full mb-6 text-primary">
                        <LockKeyhole size={40} className="text-primary" />
                    </div>

                    <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">Reset Your Password</h2>
                    {emailFromState ? (
                        <p className="font-body-md text-body-md text-on-surface-variant mb-10 max-w-[400px] mx-auto">
                            Enter the code sent to <span className="font-semibold text-primary">{emailFromState}</span> and choose a new secret password.
                        </p>
                    ) : (
                        <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl max-w-[400px] mx-auto text-sm font-semibold">
                            ⚠️ Missing email address. Please request a recovery code first.
                        </div>
                    )}

                    <form className="space-y-8 text-left" onSubmit={handleSubmit}>
                        {/* 6-Digit Code Input Section */}
                        <div>
                            <label className="block font-label-lg text-label-lg text-on-surface mb-4 text-center">Verification Code</label>
                            <div className="flex justify-between gap-2 md:gap-4 max-w-[400px] mx-auto">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        className="w-12 h-14 md:w-14 md:h-16 text-center font-headline-md text-headline-md rounded-lg border-2 border-outline-variant bg-surface-container outline-none transition-all text-primary focus:border-primary focus:ring-4 focus:ring-primary-fixed/60"
                                        maxLength={1}
                                        placeholder="•"
                                        type="text"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    />
                                ))}
                            </div>
                            {errors.otp && (
                                <p className="mt-2 text-center text-xs font-semibold text-error">
                                    {errors.otp}
                                </p>
                            )}
                        </div>

                        {/* Password Fields */}
                        <div className="space-y-6">
                            <div className="relative">
                                <label className="block font-label-lg text-label-lg text-on-surface mb-2 px-1">New Password</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors flex items-center pointer-events-none">
                                        <KeyRound size={18} strokeWidth={2} />
                                    </span>
                                    <input
                                        className={`w-full pl-12 pr-4 py-4 rounded-lg border-2 bg-surface-container focus:ring-0 transition-all font-body-md text-body-md text-on-surface ${
                                            errors.password ? 'border-error' : 'border-outline-variant focus:border-primary'
                                        }`}
                                        placeholder="6-11 characters, 1 uppercase, 1 digit"
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                                        }}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1 px-1 text-xs font-semibold text-error">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="relative">
                                <label className="block font-label-lg text-label-lg text-on-surface mb-2 px-1">Confirm New Password</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors flex items-center pointer-events-none">
                                        <ShieldCheck size={18} strokeWidth={2} />
                                    </span>
                                    <input
                                        className={`w-full pl-12 pr-4 py-4 rounded-lg border-2 bg-surface-container focus:ring-0 transition-all font-body-md text-body-md text-on-surface ${
                                            errors.confirmPassword ? 'border-error' : 'border-outline-variant focus:border-primary'
                                        }`}
                                        placeholder="Repeat your new password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                        }}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 px-1 text-xs font-semibold text-error">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="w-full bg-amber-400 text-gray-900 font-button-text text-button-text py-4 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_0_0_#b37400] hover:bg-amber-300 active:translate-y-[2px] active:shadow-[0_2px_0_0_#b37400] transition-all disabled:cursor-not-allowed disabled:opacity-70"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
                            <CheckCircle size={20} strokeWidth={2.5} />
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            className="font-label-lg text-label-lg text-primary hover:underline flex items-center justify-center gap-1 transition-all group"
                            to="/login"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                            Back to Sign In
                        </Link>
                    </div>

                    {/* Playful Security Graphic */}
                    <div className="absolute -right-16 -bottom-16 opacity-10 pointer-events-none">
                        <img
                            alt=""
                            className="w-64 h-64 rotate-12"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbRrVFmJpIZe15FUB3vLexDFc8tm-9A36L6NLnMHdc-G-GZTvAhMHb08JSENaZNunGWOhvPHvqpKAANu1ZpYeTGv5Kp5Et9e1HZF8-XR7MkZCSAfhA1mSp8PLf0rPyQDH0uHWz8bOXLQGIKN1Ul9GCqRiSZjcTU8akmwDgdgjI_kUCVEtg3UZn0PIZ0m7pVDLktWGBS20x7mMpBVK-fGJSjrcNigFTXciqif0irgH-7r8_aX_kyDZwR0UuQ8Z_MUd1aNyTuUNkJYc"
                        />
                    </div>
                </div>
            </main>

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
