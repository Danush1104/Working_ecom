import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const { register: signupAuth, confirmEmail } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'signup' | 'confirm'>('signup');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupForm) => {
    setIsSubmitting(true);
    try {
      await signupAuth({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email
          }
        }
      });
      setEmail(data.email);
      setStep('confirm');
      toast.success('Check your email for the confirmation code');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await confirmEmail({ username: email, confirmationCode: code });
      toast.success('Account confirmed! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm email');
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
            {step === 'signup' ? 'Create an Account' : 'Verify Email'}
          </h1>
          <p className="text-text-secondary dark:text-text-secondary text-sm mt-2 text-center">
            {step === 'signup' ? 'Sign up to get started' : `We sent a code to ${email}`}
          </p>
        </div>

        {step === 'signup' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full h-11 px-4 rounded-xl border border-border-subtle dark:border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:bg-bg-primary"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  className="w-full h-11 pl-4 pr-11 rounded-xl border border-border-subtle dark:border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:bg-bg-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full h-11 pl-4 pr-11 rounded-xl border border-border-subtle dark:border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:bg-bg-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full h-11 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-all disabled:opacity-50"
 >
 {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign Up'}
 </button>
 </form>
 ) : (
 <form onSubmit={onConfirm} className="space-y-5">
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1">Confirmation Code</label>
 <input id="input_qtnc" 
 value={code}
 onChange={(e) => setCode(e.target.value)}
 type="text"
 className="w-full h-11 px-4 rounded-xl border border-border-subtle dark:border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:bg-bg-primary text-center text-lg tracking-widest uppercase"
 placeholder="000000"
 required
 />
 </div>
 <button
 type="submit"
 disabled={isSubmitting || !code}
 className="w-full h-11 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-all disabled:opacity-50"
 >
 {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Account'}
 </button>
 </form>
 )}

 <p className="text-center text-sm text-text-secondary dark:text-text-secondary mt-8">
 Already have an account?{''}
 <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
 Sign in
 </Link>
 </p>
 </div>
 </div>
 );
}
