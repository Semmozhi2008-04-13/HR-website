import { useState } from 'react';
import toast from 'react-hot-toast';
import { apiPost } from '../services/api';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'HR' // Default value matching your selection requirements
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    
    // Payload optimization: Sign Up requires name, login doesn't
    const payload = isSignUp 
      ? formData 
      : { email: formData.email, password: formData.password, role: formData.role };

    try {
      const res = await apiPost(endpoint, payload);
      
      if (isSignUp) {
        toast.success('Account created successfully! Please log in.');
        setIsSignUp(false); // Toggle view directly to login form
      } else {
        toast.success(`Welcome back! Logged in as ${formData.role}`);
        // Store system tokens or contextual authorization weights
        if (res.token) {
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('userRole', formData.role);
        }
        // Redirect logic to dashboard dashboard can be safely declared here
        window.location.href = '/dashboard';
      }
    } catch (err) {
      toast.error(err?.message || `Failed to ${isSignUp ? 'sign up' : 'log in'}. Please check your credentials.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-[440px] bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        
        {/* Portal Branding and Header Layout */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl text-indigo-900 font-bold text-xl mb-3">
            <span className="material-symbols-outlined text-[26px]">school</span>
          </div>
          <h2 className="text-xl font-extrabold text-indigo-950 tracking-tight uppercase">
            FACULTY RECRUITMENT SYSTEM
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {isSignUp ? 'Create an authorized administrative profile' : 'Sign in to access your dashboard evaluation portal'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Conditional Name Field (Only visible during Sign Up) */}
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">person</span>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Dr. John Doe"
                  className="w-full pl-9 pr-4 h-11 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Input Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">mail</span>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@institution.edu"
                className="w-full pl-9 pr-4 h-11 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">lock</span>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 h-11 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Custom Role Selector Field (HR vs. Interpanelist Toggle) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Portal Access Role</label>
            <div className="grid grid-cols-2 gap-3">
              
              {/* HR Option Card */}
              <label className={`flex items-center justify-center gap-2 h-11 rounded-lg border text-[13px] font-semibold cursor-pointer select-none transition-all ${
                formData.role === 'HR' 
                  ? 'bg-indigo-50 border-indigo-900 text-indigo-900 ring-2 ring-indigo-900/5' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="HR"
                  checked={formData.role === 'HR'}
                  onChange={handleInputChange}
                  className="sr-only" // Hidden natively, customized styled with wrapper classes
                />
                <span className="material-symbols-outlined text-[18px]">badge</span>
                <span>HR Manager</span>
              </label>

              {/* Interpanelist Option Card */}
              <label className={`flex items-center justify-center gap-2 h-11 rounded-lg border text-[13px] font-semibold cursor-pointer select-none transition-all ${
                formData.role === 'Interpanelist' 
                  ? 'bg-indigo-50 border-indigo-900 text-indigo-900 ring-2 ring-indigo-900/5' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="Interpanelist"
                  checked={formData.role === 'Interpanelist'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className="material-symbols-outlined text-[18px]">groups</span>
                <span>Interpanelist</span>
              </label>

            </div>
          </div>

          {/* Primary Submit Action Trigger */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-indigo-950 text-white rounded-lg flex items-center justify-center font-bold text-sm hover:bg-indigo-900 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span>{isSignUp ? 'Register Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Dynamic Mode Switcher Links */}
        <div className="mt-6 text-center text-xs font-medium text-gray-500 border-t border-gray-100 pt-4">
          {isSignUp ? (
            <p>
              Already have a core recruitment profile?{' '}
              <button 
                type="button" 
                onClick={() => setIsSignUp(false)} 
                className="text-indigo-700 font-bold hover:underline"
              >
                Sign In Instead
              </button>
            </p>
          ) : (
            <p>
              New member of the institutional registry?{' '}
              <button 
                type="button" 
                onClick={() => setIsSignUp(true)} 
                className="text-indigo-700 font-bold hover:underline"
              >
                Request Authorization / Sign Up
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}