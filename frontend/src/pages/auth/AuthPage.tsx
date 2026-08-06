import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, Loader2, Mail, Lock, Eye, EyeOff, User, Shield, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// --- SCHEMAS ---
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type SignupForm = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const { login, register: signupAuth, confirmEmail, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Decide if we start on signup side based on URL
  const isInitialSignup = location.pathname === '/signup';
  const [isFlipped, setIsFlipped] = useState(isInitialSignup);
  
  useEffect(() => {
    setIsFlipped(location.pathname === '/signup');
  }, [location.pathname]);

  // Auth Context state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  
  // Login form state
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  // Signup form state
  const [step, setStep] = useState<'signup' | 'confirm'>('signup');
  const [signupEmail, setSignupEmail] = useState('');
  const [code, setCode] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerSignup, handleSubmit: handleSignupSubmit, formState: { errors: signupErrors } } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  // Effect to redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onLogin = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login({ username: data.email, password: data.password });
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignup = async (data: SignupForm) => {
    setIsSubmitting(true);
    try {
      await signupAuth({
        username: data.email,
        password: data.password,
        options: { userAttributes: { email: data.email } }
      });
      setSignupEmail(data.email);
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
      await confirmEmail({ username: signupEmail, confirmationCode: code });
      toast.success('Account confirmed! Please sign in.');
      setIsFlipped(false);
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm email');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch to Signup handler (trigger flip)
  const flipToSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFlipped(true);
    window.history.pushState(null, '', '/signup');
  };

  // Switch to Login handler (trigger flip)
  const flipToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFlipped(false);
    window.history.pushState(null, '', '/login');
  };

  return (
    <div className="h-screen w-full flex bg-bg-primary overflow-hidden font-sans">
      
      {/* LEFT SIDE - Hero Section */}
      <div className="hidden lg:flex w-1/2 relative bg-bg-primary overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80")'}}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/80 to-[#7C3AED]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 p-16 flex flex-col h-full text-white">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <Store className="w-8 h-8 text-white" />
            Storefront.
          </div>
          
          <div className="mt-auto mb-32">
            <h1 className="text-6xl font-serif font-medium leading-[1.1] mb-6">
              Discover.<br />
              Shop.<br />
              <span className="text-white/70">Elevate.</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md leading-relaxed font-light mb-12">
              Premium products. Curated for you.<br />
              Experience shopping like never before.
            </p>
            
            <div className="inline-flex items-start gap-4 p-4 rounded-2xl bg-bg-card/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <div className="p-3 bg-bg-card/20 rounded-full shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Secure & Trusted</h3>
                <p className="text-sm text-white/70 max-w-[220px]">
                  Your data is protected with enterprise-grade security.
                </p>
              </div>
            </div>
          </div>
          
          {/* Bottom Floating Pill */}
          <div className="absolute bottom-12 left-16 inline-flex items-center gap-4 py-2.5 px-4 rounded-full bg-bg-card/10 backdrop-blur-md border border-white/20">
            <div className="flex -space-x-3">
              <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-8 h-8 rounded-full border-2 border-transparent/20" />
              <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-8 h-8 rounded-full border-2 border-transparent/20" />
              <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-8 h-8 rounded-full border-2 border-transparent/20" />
            </div>
            <p className="text-sm font-medium text-white/90">
              Join 10,000+ happy<br />customers worldwide
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Auth Forms (No padding between left and right side) */}
      <div className="w-full lg:w-1/2 relative bg-bg-card [perspective:2000px]">
        <motion.div
          className="w-full h-full relative"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT (LOGIN) */}
          <div 
            className="absolute inset-0 flex items-center justify-center p-6 sm:p-12 overflow-y-auto"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="w-full max-w-[440px] relative">
              <h2 className="text-[32px] font-bold text-text-primary tracking-tight flex items-center gap-2">
                Welcome back <span className="text-3xl origin-bottom-right animate-wave">👋</span>
              </h2>
              <p className="text-text-secondary mt-2 mb-8 text-[15px]">Login to continue to your account</p>

              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email</label>
                  <div className="relative">
                    <input
                      {...registerLogin('email')}
                      type="email"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-border-subtle bg-bg-primary/50 text-[15px] focus:bg-bg-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-text-primary placeholder:text-text-secondary/50"
                      placeholder="you@example.com"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary/60" />
                  </div>
                  {loginErrors.email && <p className="text-red-500 text-xs mt-1.5">{loginErrors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      {...registerLogin('password')}
                      type={showPassword ? "text" : "password"}
                      className="w-full h-12 pl-11 pr-11 rounded-xl border border-border-subtle bg-bg-primary/50 text-[15px] focus:bg-bg-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-text-primary placeholder:text-text-secondary/50"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary/60" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary/60 hover:text-text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {loginErrors.password && <p className="text-red-500 text-xs mt-1.5">{loginErrors.password.message}</p>}
                </div>

                <div className="flex items-center justify-end pt-1">
                  <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} className="text-[14px] font-medium text-primary hover:text-primary-hover transition-colors">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-[#5b21b6] hover:from-blue-700 hover:to-[#4c1d95] text-white rounded-xl font-medium text-[15px] transition-all shadow-[0_4px_14px_0_rgb(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] disabled:opacity-70 disabled:hover:shadow-[0_4px_14px_0_rgb(37,99,235,0.2)] mt-2"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign in'}
                </button>
              </form>

              <div className="mt-8 text-center text-[14.5px] text-text-secondary">
                Don't have an account?{' '}
                <a href="/signup" onClick={flipToSignup} className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Sign up
                </a>
              </div>
            </div>
          </div>

          {/* BACK (SIGNUP) */}
          <div 
            className="absolute inset-0 flex items-center justify-center p-6 sm:p-12 overflow-y-auto"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="w-full max-w-[440px] relative">
              <div className="flex flex-col items-center mb-8">
                <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {step === 'signup' ? 'Create an Account' : 'Verify Email'}
                </h1>
                <p className="text-text-secondary text-sm mt-2 text-center">
                  {step === 'signup' ? 'Sign up to get started' : `We sent a code to ${signupEmail}`}
                </p>
              </div>

              {step === 'signup' ? (
                <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email</label>
                    <input
                      {...registerSignup('email')}
                      type="email"
                      className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-primary/50 text-[15px] focus:bg-bg-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-text-primary"
                      placeholder="you@example.com"
                    />
                    {signupErrors.email && <p className="text-red-500 text-xs mt-1">{signupErrors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        {...registerSignup('password')}
                        type={showSignupPassword ? "text" : "password"}
                        className="w-full h-11 pl-4 pr-11 rounded-xl border border-border-subtle bg-bg-primary/50 text-[15px] focus:bg-bg-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-text-primary"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signupErrors.password && <p className="text-red-500 text-xs mt-1">{signupErrors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input
                        {...registerSignup('confirmPassword')}
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full h-11 pl-4 pr-11 rounded-xl border border-border-subtle bg-bg-primary/50 text-[15px] focus:bg-bg-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-text-primary"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signupErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{signupErrors.confirmPassword.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-all shadow-[0_4px_14px_0_rgb(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign Up'}
                  </button>
                </form>
              ) : (
                <form onSubmit={onConfirm} className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Confirmation Code</label>
                    <input 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      type="text"
                      className="w-full h-12 px-4 rounded-xl border border-border-subtle bg-bg-primary/50 text-center text-lg tracking-widest uppercase focus:bg-bg-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-text-primary"
                      placeholder="000000"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !code}
                    className="w-full h-12 flex items-center justify-center bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-all shadow-[0_4px_14px_0_rgb(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Account'}
                  </button>
                </form>
              )}

              <div className="mt-8 text-center text-[14.5px] text-text-secondary">
                Already have an account?{' '}
                <a href="/login" onClick={flipToLogin} className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
