'use client';

import Link from 'next/link';
import { Shield, User, LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-slate-900 tracking-tight">Bakshiganj Auto</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Home</Link>
            <Link href="/register" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Register</Link>
            <Link href="/admin" className="flex items-center space-x-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              <LogIn className="h-4 w-4" />
              <span>Admin Login</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-emerald-600 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-md"
              >
                Home
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-md"
              >
                Register
              </Link>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 bg-slate-900 text-white font-medium rounded-md text-center"
              >
                Admin Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
