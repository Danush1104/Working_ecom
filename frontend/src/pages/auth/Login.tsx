import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, Loader2, Mail, Lock, Eye, EyeOff, User, Shield, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'customer' | 'admin'>('customer');

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    if (role === 'admin') {
      toast.error('Admin login is currently handled via main login. Just use your admin credentials.');
    }
    
    setIsSubmitting(true);
    try {
      await login({ username: data.email, password: data.password });
      toast.success('Logged in successfully');
      // Redirection is handled by the effect below
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F7F8FA] overflow-hidden font-sans">
      
      {/* LEFT SIDE - Hero Section */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80")' }}
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
            
            <div className="inline-flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <div className="p-3 bg-white/20 rounded-full shrink-0">
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
          <div className="absolute bottom-12 left-16 inline-flex items-center gap-4 py-2.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
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

      {/* RIGHT SIDE - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[440px] bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative">
          
          {/* Top decorative blur (optional subtle touch) */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <h2 className="text-[32px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Welcome back <span className="text-3xl origin-bottom-right animate-wave">👋</span>
          </h2>
          <p className="text-gray-500 mt-2 mb-8 text-[15px]">Login to continue to your account</p>

          {/* Role Toggle */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Login as</label>
            <div className="flex p-1 bg-gray-50/80 rounded-[14px] border border-gray-100">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex-1 py-2.5 text-[14px] font-medium rounded-[10px] flex items-center justify-center gap-2 transition-all duration-200 ${
                  role === 'customer'
                    ? 'bg-white shadow-sm border border-gray-200/60 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className={`w-[18px] h-[18px] ${role === 'customer' ? 'text-orange-500' : ''}`} /> Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2.5 text-[14px] font-medium rounded-[10px] flex items-center justify-center gap-2 transition-all duration-200 ${
                  role === 'admin'
                    ? 'bg-white shadow-sm border border-gray-200/60 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Shield className={`w-[18px] h-[18px] ${role === 'admin' ? 'text-blue-600' : ''}`} /> Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full h-12 pl-11 pr-4 bg-white rounded-xl border border-gray-200 text-gray-900 text-[15px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  className="w-full h-12 pl-11 pr-11 bg-white rounded-xl border border-gray-200 text-gray-900 text-[15px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-end pt-1 pb-2">
              <Link to="/forgot-password" className="text-[14px] font-medium text-[#8d522e] hover:text-[#6e3f22] transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-[#5b21b6] hover:from-blue-700 hover:to-[#4c1d95] text-white rounded-xl font-medium text-[15px] transition-all shadow-[0_4px_14px_0_rgb(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] disabled:opacity-70 disabled:hover:shadow-[0_4px_14px_0_rgb(37,99,235,0.2)]"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Login 
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.33334 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 3.33331L12.6667 7.99998L8 12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          </form>



          <p className="text-center text-[14px] text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#8d522e] hover:text-[#6e3f22] font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
