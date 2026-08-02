import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { Store, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
 email: z.string().email('Please enter a valid email'),
});

const confirmResetSchema = z.object({
 code: z.string().min(1, 'Code is required'),
 newPassword: z.string().min(8, 'Password must be at least 8 characters'),
 confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
 message:"Passwords don't match",
 path: ["confirmPassword"],
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type ConfirmResetForm = z.infer<typeof confirmResetSchema>;

export default function ForgotPassword() {
 const navigate = useNavigate();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [step, setStep] = useState<'request'| 'reset'>('request');
 const [email, setEmail] = useState('');

 const { register: reqRegister, handleSubmit: reqSubmit, formState: { errors: reqErrors } } = useForm<ForgotPasswordForm>({
 resolver: zodResolver(forgotPasswordSchema)
 });

 const { register: resRegister, handleSubmit: resSubmit, formState: { errors: resErrors } } = useForm<ConfirmResetForm>({
 resolver: zodResolver(confirmResetSchema)
 });

 const onRequest = async (data: ForgotPasswordForm) => {
 setIsSubmitting(true);
 try {
 await resetPassword({ username: data.email });
 setEmail(data.email);
 setStep('reset');
 toast.success('Check your email for the reset code');
 } catch (error: any) {
 if (error.name === 'UserNotFoundException') {
 toast.error('No account found with this email');
 } else if (error.name === 'LimitExceededException') {
 toast.error('Too many attempts. Please try again later.');
 } else {
 toast.error(error.message || 'Failed to request reset');
 }
 } finally {
 setIsSubmitting(false);
 }
 };

 const onReset = async (data: ConfirmResetForm) => {
 setIsSubmitting(true);
 try {
 await confirmResetPassword({ 
 username: email, 
 confirmationCode: data.code, 
 newPassword: data.newPassword 
 });
 toast.success('Password reset successfully! Please log in.');
 navigate('/login');
 } catch (error: any) {
 if (error.name === 'CodeMismatchException') {
 toast.error('Invalid verification code');
 } else if (error.name === 'ExpiredCodeException') {
 toast.error('Verification code expired');
 } else if (error.name === 'InvalidPasswordException') {
 toast.error('Password does not meet requirements');
 } else {
 toast.error(error.message || 'Failed to reset password');
 }
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-bg-secondary dark:bg-bg-primary px-4 transition-colors duration-200">
 <div className="w-full max-w-md bg-bg-card dark:bg-bg-card rounded-3xl shadow-xl p-8 border border-border-subtle dark:border-border-subtle">
 <div className="flex flex-col items-center mb-8">
 <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4">
 <Store className="h-6 w-6 text-white" />
 </div>
 <h1 className="text-2xl font-bold text-text-primary">
 {step === 'request'? 'Forgot Password': 'Reset Password'}
 </h1>
 <p className="text-text-secondary dark:text-text-secondary text-sm mt-2 text-center">
 {step === 'request'
 ? 'Enter your email to reset your password'
 :`We sent a code to ${email}`}
 </p>
 </div>

 {step === 'request'? (
 <form onSubmit={reqSubmit(onRequest)} className="space-y-5">
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
 <input id="input_sdll" 
 {...reqRegister('email')}
 type="email"
 className="w-full h-11 px-4 rounded-xl border border-border-subtle dark:border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:bg-bg-primary"
 placeholder="you@example.com"
 />
 {reqErrors.email && <p className="text-red-500 text-xs mt-1">{reqErrors.email.message}</p>}
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full h-11 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-all disabled:opacity-50"
 >
 {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
 </button>
 </form>
 ) : (
 <form onSubmit={resSubmit(onReset)} className="space-y-5">
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Reset Code</label>
 <input id="input_dmfh" 
 {...resRegister('code')}
 type="text"
 className="w-full h-11 px-4 rounded-xl border border-border-subtle dark:border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:bg-bg-primary text-center tracking-widest uppercase"
 placeholder="000000"
 />
 {resErrors.code && <p className="text-red-500 text-xs mt-1">{resErrors.code.message}</p>}
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
 <input id="input_bqms" 
 {...resRegister('newPassword')}
 type="password"
 className="w-full h-11 px-4 rounded-xl border border-border-subtle dark:border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:bg-bg-primary"
 placeholder="••••••••"
 />
 {resErrors.newPassword && <p className="text-red-500 text-xs mt-1">{resErrors.newPassword.message}</p>}
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
 <input id="input_mvrn" 
 {...resRegister('confirmPassword')}
 type="password"
 className="w-full h-11 px-4 rounded-xl border border-border-subtle dark:border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:bg-bg-primary"
 placeholder="••••••••"
 />
 {resErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{resErrors.confirmPassword.message}</p>}
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full h-11 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-all disabled:opacity-50"
 >
 {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
 </button>
 </form>
 )}

 <div className="flex justify-center mt-8">
 <Link to="/login" className="text-sm text-text-secondary dark:text-text-secondary hover:text-text-primary transition-colors">
 Back to login
 </Link>
 </div>
 </div>
 </div>
 );
}
