'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AdminLogin from '@/components/AdminLogin';
import AdminPanel from '@/components/AdminPanel';
import Footer from '@/components/Footer';
import { AdminData, getAdmin } from '@/lib/firebase-utils';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [admin, setAdmin] = useState<AdminData | null>(() => {
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('admin_session');
      if (savedSession) {
        try {
          return JSON.parse(savedSession);
        } catch (e) {
          localStorage.removeItem('admin_session');
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If we already have a local session, don't let Firebase overwrite it 
        // unless it's the super admin email login
        const savedSession = localStorage.getItem('admin_session');
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          if (sessionData.role === 'admin' || sessionData.username === 'hridoyhasanrafi') {
            setAdmin(sessionData);
            setLoading(false);
            return;
          }
        }

        const adminData = await getAdmin(user.uid);
        if (adminData) {
          setAdmin(adminData);
          localStorage.setItem('admin_session', JSON.stringify(adminData));
        } else if (user.email === 'hridoyhasanrafi45@gmail.com') {
          // Special case for super admin
          const superAdmin: AdminData = {
            uid: user.uid,
            name: 'Hridoy Hasan Rafi',
            username: 'hridoyhasanrafi',
            password: 'hhradmin@@##', // Match AdminLogin
            phone: '01771806977',
            designation: 'System Developer',
            role: 'super_admin',
            photoUrl: user.photoURL || '',
            createdAt: new Date(),
          };
          setAdmin(superAdmin);
          localStorage.setItem('admin_session', JSON.stringify(superAdmin));
        } else {
          // Only sign out if it's not a local admin session
          if (!savedSession) {
            await signOut(auth);
            setAdmin(null);
            localStorage.removeItem('admin_session');
          }
        }
      } else {
        // Only clear if not mock logged in
        if (!localStorage.getItem('admin_session')) {
          setAdmin(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {!admin ? (
            <AdminLogin onLogin={(a) => setAdmin(a)} />
          ) : (
            <AdminPanel admin={admin} onLogout={() => setAdmin(null)} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
