'use client';

import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center space-x-2 text-white">
              <Shield className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold tracking-tight">Bakshiganj Auto</span>
            </Link>
            <p className="text-sm leading-relaxed">
              বকশিগঞ্জ অটো চুর ধরা আরকি সিস্টেম এর জন্য অনলাইন অটো রেজিষ্ট্রেশন সিস্টেম। আমাদের লক্ষ্য বকশিগঞ্জের সকল অটো-রিকশাকে একটি নিরাপদ নেটওয়ার্কের আওতায় আনা।
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-emerald-500 transition-colors"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-emerald-500 transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-emerald-500 transition-colors"><Globe className="h-5 w-5" /></Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className="hover:text-emerald-500 transition-colors">Home</Link></li>
              <li><Link href="/register" className="hover:text-emerald-500 transition-colors">Register Auto</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-500 transition-colors">Admin Login</Link></li>
              <li><Link href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>+8801771806977</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>hridoyhasanrafi45@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>Bakshiganj, Jamalpur, Bangladesh</span>
              </li>
            </ul>
          </div>

          {/* Developer */}
          <div className="space-y-6">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs">Developed By</h3>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
              <p className="text-sm font-bold text-white mb-1">Hridoy Hasan Rafi</p>
              <p className="text-xs text-slate-500">System Developer</p>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">সহযোগিতায়</p>
                <p className="text-xs text-slate-300 font-medium">ছাত্র অধিকার পরিষদ বকশিগঞ্জ</p>
              </div>
              <div className="mt-4 space-y-2 text-[10px]">
                <p className="flex items-center space-x-2">
                  <Phone className="h-3 w-3 text-slate-500" />
                  <span>01771806977</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Mail className="h-3 w-3 text-slate-500" />
                  <span>hridoyhasanrafi45@gmail.com</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 text-center text-xs">
          <p>© {new Date().getFullYear()} Bakshiganj Auto Registration System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
