import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import { FileText, Mail, Lock, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      // Toast handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    onSubmit({ email, password });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header & Language Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-wide">IDP PLATFORM</span>
          </div>
          <LanguageSelector />
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{t.loginTitle}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.loginSubtitle}
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                  })}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  {...register('password', { required: 'Password is required' })}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white gradient-bg hover:opacity-95 transition-opacity shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? '...' : t.signInBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 text-center">Quick One-Click Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('demo@example.com', 'Demo123!')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-1"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t.demoUserLogin}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@example.com', 'Admin123!')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                <span>{t.demoAdminLogin}</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            {t.noAccount}{' '}
            <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              {t.createAccountLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
