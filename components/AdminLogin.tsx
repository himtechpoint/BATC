'use client';

import { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/firebase';
import { getAllAdmins, AdminData } from '@/lib/firebase-utils';
import { LogIn, Shield, Loader2, AlertCircle, User, Lock, Crown } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginProps {
  onLogin: (admin: AdminData) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [loginType, setLoginType] = useState<'admin' | 'super'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Super Admin Login
    if (loginType === 'super') {
      if (username === 'hridoyhasanrafi' && password === 'hhradmin@@##') {
        const superAdmin: AdminData = {
          uid: 'super-admin-hridoy',
          name: 'Hridoy Hasan Rafi',
          username: 'hridoyhasanrafi',
          phone: '01771806977',
          designation: 'System Developer',
          role: 'super_admin',
          photoUrl: '',
          createdAt: new Date(),
        };
        
        localStorage.setItem('admin_session', JSON.stringify(superAdmin));
        await signInAnonymously(auth);
        onLogin(superAdmin);
        setLoading(false);
        return;
      } else {
        setError("সুপার এডমিন ইউজারনেম বা পাসওয়ার্ড ভুল।");
        setLoading(false);
        return;
      }
    }

    // 2. Normal Admin Login
    try {
      const admins = await getAllAdmins();
      const foundAdmin = admins?.find(a => 
        a.username === username && a.password === password
      );

      if (foundAdmin) {
        localStorage.setItem('admin_session', JSON.stringify(foundAdmin));
        await signInAnonymously(auth);
        onLogin(foundAdmin);
        return;
      }

      setError("এডমিন ইউজারনেম বা পাসওয়ার্ড ভুল।");
    } catch (err: any) {
      console.error(err);
      setError("লগইন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${loginType === 'super' ? 'bg-amber-500' : 'bg-slate-900'} text-white`}>
            {loginType === 'super' ? <Crown className="h-8 w-8" /> : <Shield className="h-8 w-8" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {loginType === 'super' ? 'সুপার এডমিন লগইন' : 'এডমিন লগইন'}
          </h2>
          <p className="text-slate-500 text-sm mt-2">সিস্টেম এক্সেস করতে লগইন করুন</p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
          <button
            onClick={() => { setLoginType('admin'); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginType === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            এডমিন
          </button>
          <button
            onClick={() => { setLoginType('super'); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginType === 'super' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500'}`}
          >
            সুপার এডমিন
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center space-x-3 text-red-700 mb-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              ইউজারনেম
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                placeholder="ইউজারনেম লিখুন"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">পাসওয়ার্ড</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                placeholder="পাসওয়ার্ড লিখুন"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-2 ${loginType === 'super' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-slate-800'} text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50`}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <>
                <LogIn className="h-5 w-5" />
                <span>লগইন করুন</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
