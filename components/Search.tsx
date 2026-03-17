'use client';

import { useState } from 'react';
import { Search as SearchIcon, CheckCircle, XCircle, Loader2, User, Phone, Hash, MapPin, Shield } from 'lucide-react';
import { searchRegistration, RegistrationData } from '@/lib/firebase-utils';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchRegistration(searchTerm);
      setResult(data || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="গাড়ির ৩ ডিজিট বা অটো জেনারেট নাম্বার বা ফোন নাম্বার দিয়ে সার্চ দিন"
          className="block w-full pl-11 pr-24 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>সার্চ দিন</span>}
        </button>
      </form>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
            </motion.div>
          ) : searched && result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {result.driverPhotoUrl ? (
                    <Image
                      src={result.driverPhotoUrl}
                      alt={result.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-900">{result.name}</h3>
                    <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold border border-emerald-100">
                      <CheckCircle className="h-4 w-4" />
                      <span>গাড়িটি বৈধ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 text-slate-600">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <span>{result.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-600">
                      <Hash className="h-4 w-4 text-emerald-600" />
                      <span>আইডি: {result.generatedId}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-600">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <span>{result.union}, {result.village}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-600">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <span>গাড়ির নাম: {result.vehicleName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : searched && !result ? (
            <motion.div
              key="no-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center"
            >
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-900 mb-2">কোনো তথ্য পাওয়া যায়নি</h3>
              <p className="text-red-700">অনুগ্রহ করে সঠিক নাম্বার বা ফোন নাম্বার দিয়ে পুনরায় চেষ্টা করুন।</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
