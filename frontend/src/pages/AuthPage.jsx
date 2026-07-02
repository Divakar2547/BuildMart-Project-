import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HardHat, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all required fields'); return; }
    if (!isLogin && !form.name) { toast.error('Please enter your name'); return; }
    if (!isLogin && form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    if (isLogin) {
      const result = await login(form.email, form.password);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
        const destination = from !== '/' ? from : result.user.role === 'admin' ? '/admin' : '/';
        navigate(destination, { replace: true });
      } else {
        toast.error(result.message);
      }
    } else {
      const result = await register(form.name, form.email, form.password, form.phone);
      if (result.success) {
        toast.success('Account created successfully!');
        navigate(from, { replace: true });
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center py-12 px-4" style={{ backgroundColor: '#f9fafb' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="bg-primary-500 p-2 rounded-xl">
              <HardHat size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold" style={{ color: '#1f2937' }}>Build<span style={{ color: '#f59e0b' }}>Mart</span></span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#1f2937' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>
            {isLogin ? 'Sign in to continue shopping' : 'Join BuildMart to start ordering'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-xl p-1 mb-6 border" style={{ backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' }}>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all`}
            style={{ backgroundColor: isLogin ? '#f59e0b' : 'transparent', color: isLogin ? '#000000' : '#6b7280' }}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all`}
            style={{ backgroundColor: !isLogin ? '#f59e0b' : 'transparent', color: !isLogin ? '#000000' : '#6b7280' }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="label">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label">Email Address *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={isLogin ? 'Your password' : 'Min. 6 characters'}
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><div className="spinner" /> {isLogin ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

        </div>

        <p className="text-center text-sm mt-4" style={{ color: '#6b7280' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-400 font-semibold hover:underline"
          >
            {isLogin ? 'Register here' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
