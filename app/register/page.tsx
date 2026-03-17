'use client';

import Navbar from '@/components/Navbar';
import RegistrationForm from '@/components/RegistrationForm';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 space-y-4"
          >
            <h1 className="text-4xl font-black text-slate-900">গাড়ি রেজিষ্ট্রেশন করুন</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">সঠিক তথ্য দিয়ে নিচের ফর্মটি পূরণ করুন। আপনার তথ্য যাচাই করে দ্রুত অনুমোদন দেওয়া হবে।</p>
          </motion.div>

          <RegistrationForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
