import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Lightbulb, Clock, AlertCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { loginWithToken, me } from '../lib/api';
import userService from '../services/userService';

interface LoginProps {
  onLogin?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { login } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // Forgot password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUserId: '',
    email: '',
    password: '',
    username: '',
    fullName: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login with entered credentials
        const raw = (formData.emailOrUserId || '').trim().toLowerCase();
        const token = raw.includes('@') ? raw.split('@')[0] : raw;
        if (!token) throw new Error('Please enter your username or email');
        await loginWithToken(token);
        const you = await me();
        // Minimal shape for UserContext
        const userPayload = {
          id: you.id,
          username: you.id,
          email: formData.emailOrUserId.includes('@') ? formData.emailOrUserId : `${you.id}@example.com`,
          fullName: you.name || you.id,
          avatar: you.avatar,
          bio: '', location: '', joinedDate: new Date().toISOString(), followers: 0, following: 0, posts: 0,
        } as any;
        login(userPayload);
        // Best-effort: seed backend so Explore search can find this user across profiles
        try {
          await userService.register({
            username: userPayload.username,
            email: userPayload.email,
            fullName: userPayload.fullName,
            password: formData.password,
          } as any);
        } catch {}
        onLogin?.();
      } else {
        // Register with entered credentials
        const token = (formData.username || formData.email || '').toLowerCase();
        await loginWithToken(token);
        const you = await me();
        const userPayload2 = {
          id: you.id,
          username: you.id,
          email: formData.email || `${you.id}@example.com`,
          fullName: you.name || you.id,
          avatar: you.avatar,
          bio: '', location: '', joinedDate: new Date().toISOString(), followers: 0, following: 0, posts: 0,
        } as any;
        login(userPayload2);
        try {
          await userService.register({
            username: userPayload2.username,
            email: userPayload2.email,
            fullName: userPayload2.fullName,
            password: formData.password,
          } as any);
        } catch {}
        onLogin?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReset = async () => {
    setForgotStatus('');
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotStatus('Please enter a valid email address.');
      return;
    }
    try {
      setForgotLoading(true);
      // Simulate API call to request reset link
      await new Promise((res) => setTimeout(res, 800));
      setForgotStatus('Password reset link sent to your email.');
    } catch (e) {
      setForgotStatus('Failed to send reset link. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      // Simulate social login - in real app, this would use OAuth
      const mockUser = {
        id: 'social-' + Date.now(),
        username: `${provider}user`,
        email: `user@${provider}.com`,
        fullName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        avatar: `https://ui-avatars.com/api/?name=${provider}+User&background=random`,
        bio: `Joined via ${provider}`,
        followers: 0,
        following: 0,
        posts: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      login(mockUser);
      onLogin?.();
    } catch (err) {
      setError('Social login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = isLogin 
    ? formData.emailOrUserId && formData.password
    : formData.email && formData.password && formData.username && formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-app-background flex flex-col items-center justify-center">
      {/* Header similar to Home page */}
      <motion.div 
        className="mx-4 sm:mx-6 md:mx-8 lg:mx-auto lg:max-w-3xl pt-2 sm:pt-3 md:pt-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-app-card-surface rounded-xl border border-app-borders"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-lg font-semibold text-app-primary-accent">PEDAL</span>
          </div>

          <p className="text-app-text-muted text-sm sm:text-base leading-relaxed max-w-2xl mx-auto px-2">
            Connect with like minded buddies with Pedal  
          </p>
          
          
        </div>
      </motion.div>

      {/* Login Form Card */}
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 pb-6">
        <motion.div
          className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-app-card-surface rounded-xl border border-app-borders p-4 sm:p-5 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Form Header */}
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-app-text-muted text-sm sm:text-base">
              {isLogin 
                ? 'Continue your Pedal journey' 
                : 'Create your account and start exploring'
              }
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-app-background rounded-lg p-1 mb-4 sm:mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all ${
                isLogin 
                  ? 'bg-app-primary-accent text-white' 
                  : 'text-app-text-muted hover:text-app-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all ${
                !isLogin 
                  ? 'bg-app-primary-accent text-white' 
                  : 'text-app-text-muted hover:text-app-text-primary'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-app-text-primary mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-app-text-muted" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Choose a username"
                        className="w-full pl-10 pr-4 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-app-primary-accent/50 focus:border-app-primary-accent/50 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Field - Email or User ID */}
            {isLogin ? (
              <div>
                <label className="block text-sm font-medium text-app-text-primary mb-2">
                  Email or User ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-app-text-muted" />
                  <input
                    type="text"
                    name="emailOrUserId"
                    value={formData.emailOrUserId}
                    onChange={handleInputChange}
                    placeholder="Enter your email or user ID"
                    className="w-full pl-10 pr-4 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-app-primary-accent/50 focus:border-app-primary-accent/50 transition-all"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-app-text-primary mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-app-text-muted" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-app-primary-accent/50 focus:border-app-primary-accent/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-app-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-app-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-app-primary-accent/50 focus:border-app-primary-accent/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-app-text-muted hover:text-app-text-primary transition-colors"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-app-text-primary mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-app-text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-4 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-app-primary-accent/50 focus:border-app-primary-accent/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password Link */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-app-primary-accent hover:text-app-primary-accent/80 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={!isFormValid}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                isFormValid
                  ? 'bg-gradient-to-r from-app-primary-accent to-orange-600 text-white hover:shadow-lg hover:shadow-app-primary-accent/25'
                  : 'bg-app-background text-app-text-muted cursor-not-allowed border border-app-borders'
              }`}
              whileHover={isFormValid ? { scale: 1.02 } : {}}
              whileTap={isFormValid ? { scale: 0.98 } : {}}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-dark-border"></div>
            <span className="text-sm text-app-text-muted">or continue with</span>
            <div className="flex-1 h-px bg-dark-border"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-3 p-3 rounded-xl border border-app-borders bg-dark-surface hover:bg-app-background hover:border-neon-orange/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-app-text-primary">Google</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="flex items-center justify-center gap-3 p-3 rounded-xl border border-app-borders bg-dark-surface hover:bg-app-background hover:border-neon-orange/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium text-app-text-primary">Facebook</span>
            </motion.button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-app-text-muted">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-neon-orange hover:text-neon-orange/80 transition-colors font-medium"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </motion.div>
      </div>
      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowForgot(false)} />
            <motion.div
              className="relative z-10 w-full max-w-sm mx-4 bg-app-card-surface border border-app-borders rounded-2xl p-5 shadow-xl"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-app-text-primary mb-1">Reset Password</h3>
              <p className="text-sm text-app-text-muted mb-4">Enter your account email and we'll send you a reset link.</p>
              <div className="mb-3">
                <label className="block text-sm font-medium text-app-text-primary mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text-muted" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-app-primary-accent/50 focus:border-app-primary-accent/50 transition-all"
                  />
                </div>
              </div>
              {forgotStatus && (
                <div className={`mb-3 text-sm ${forgotStatus.includes('sent') ? 'text-emerald-400' : 'text-red-400'}`}>{forgotStatus}</div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-app-borders text-app-text-primary hover:bg-app-background transition-colors"
                  onClick={() => setShowForgot(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-app-primary-accent text-white hover:brightness-110 disabled:opacity-60"
                  disabled={forgotLoading}
                  onClick={handleSendReset}
                >
                  {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
