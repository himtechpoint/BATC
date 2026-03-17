'use client';

import Navbar from '@/components/Navbar';
import Search from '@/components/Search';
import Footer from '@/components/Footer';
import { Shield, Car, CheckCircle, Search as SearchIcon, ArrowRight, UserPlus, Download } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-emerald-50/30 -skew-y-6 transform origin-top-left -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-200"
              >
                <Shield className="h-4 w-4" />
                <span>নিরাপদ বকশিগঞ্জ, নিরাপদ অটো</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-black text-slate-900 leading-tight"
              >
                অনলাইন অটো <span className="text-emerald-600">রেজিষ্ট্রেশন</span> সিস্টেম
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                বকশিগঞ্জ অটো চুর ধরা আরকি সিস্টেম এর জন্য অনলাইন অটো রেজিষ্ট্রেশন সিস্টেম। আপনার অটো-রিকশাটি আজই রেজিষ্ট্রেশন করুন এবং চুরি থেকে রক্ষা করুন।
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200"
                >
                  <span>রেজিষ্ট্রেশন করুন</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#search"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                  <SearchIcon className="h-5 w-5" />
                  <span>গাড়ি সার্চ দিন</span>
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 relative"
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-emerald-600 rounded-[3rem] rotate-6 -z-10 opacity-10" />
                <div className="absolute inset-0 bg-slate-900 rounded-[3rem] -rotate-3 -z-10 opacity-5" />
                <div className="w-full h-full bg-white border border-slate-200 rounded-[3rem] shadow-2xl p-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center">
                    <Car className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">কিভাবে কাজ করে?</h3>
                  <ul className="text-left space-y-4 text-slate-600">
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">১</div>
                      <span>ব্যাক্তিগত ও গাড়ির তথ্য দিয়ে ফর্ম পূরণ করুন।</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">২</div>
                      <span>এডমিন আপনার রিকোয়েস্ট যাচাই করে অনুমোদন করবেন।</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">৩</div>
                      <span>অনুমোদনের পর কিউআর কোড সহ কার্ড ডাউনলোড করুন।</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="search" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl font-black text-slate-900">গাড়ি যাচাই করুন</h2>
            <p className="text-slate-600 max-w-xl mx-auto">গাড়ির ৩ ডিজিট বা আইডি দিয়ে সার্চ করে গাড়ির বৈধতা যাচাই করুন।</p>
          </div>
          <Search />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 text-center p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserPlus className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">সহজ রেজিষ্ট্রেশন</h3>
              <p className="text-slate-600">খুব সহজেই আপনার স্মার্টফোন দিয়ে গাড়ির সকল তথ্য দিয়ে রেজিষ্ট্রেশন করতে পারবেন।</p>
            </div>
            <div className="space-y-4 text-center p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">দ্রুত অনুমোদন</h3>
              <p className="text-slate-600">আমাদের এডমিন প্যানেল দ্রুত আপনার তথ্য যাচাই করে অনুমোদন প্রদান করবে।</p>
            </div>
            <div className="space-y-4 text-center p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Download className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">ডিজিটাল কার্ড</h3>
              <p className="text-xl font-bold text-slate-900">কিউআর কোড সহ ডিজিটাল কার্ড ডাউনলোড করে গাড়িতে স্টিকার হিসেবে ব্যবহার করতে পারবেন।</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
