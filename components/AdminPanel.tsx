'use client';

import { useState, useEffect } from 'react';
import { 
  getPendingRegistrations, 
  getApprovedRegistrations,
  approveRegistration, 
  rejectRegistration, 
  RegistrationData, 
  AdminData,
  getAllAdmins,
  addAdmin,
  updateRegistration,
  deleteRegistration,
  deleteAdmin
} from '@/lib/firebase-utils';
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  UserPlus, 
  Users, 
  ClipboardList, 
  Loader2, 
  Search,
  Shield,
  Phone,
  Hash,
  MapPin,
  Car,
  LogOut,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Card from './Card';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';

import RegistrationForm from './RegistrationForm';

interface AdminPanelProps {
  admin: AdminData;
  onLogout: () => void;
}

export default function AdminPanel({ admin, onLogout }: AdminPanelProps) {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'history' | 'admins'>('requests');
  const [history, setHistory] = useState<RegistrationData[]>([]);
  const [selectedReg, setSelectedReg] = useState<RegistrationData | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingReg, setEditingReg] = useState<RegistrationData | null>(null);
  const [editForm, setEditForm] = useState<Partial<RegistrationData>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Admin Form
  const [newAdmin, setNewAdmin] = useState({ name: '', username: '', password: '', phone: '', designation: '', role: 'admin' as const });
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regs, allAdmins, approvedRegs] = await Promise.all([
        getPendingRegistrations(),
        getAllAdmins(),
        getApprovedRegistrations()
      ]);
      setRegistrations(regs || []);
      setAdmins(allAdmins || []);
      setHistory(approvedRegs || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    // We need a way to get approved registrations
    // I'll add a utility for this if it doesn't exist
  };

  const handleApprove = async (id: string) => {
    try {
      await approveRegistration(id, admin.uid, admin.name);
      const approved = registrations.find(r => r.id === id);
      if (approved) {
        setHistory([{ 
          ...approved, 
          status: 'approved', 
          approvedByName: admin.name,
          approvedAt: new Date() 
        }, ...history]);
      }
      setRegistrations(registrations.filter(r => r.id !== id));
      setToast({ message: "অনুমোদন সফল হয়েছে এবং 'Done' লিস্টে যুক্ত হয়েছে।", type: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ message: "অনুমোদন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।", type: 'error' });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই রিকোয়েস্টটি বাতিল করতে চান?")) return;
    try {
      await rejectRegistration(id);
      setRegistrations(registrations.filter(r => r.id !== id));
      setToast({ message: "রিকোয়েস্টটি বাতিল করা হয়েছে।", type: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ message: "বাতিল করতে ত্রুটি হয়েছে।", type: 'error' });
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই তথ্যটি চিরতরে ডিলিট করতে চান?")) return;
    try {
      await deleteRegistration(id);
      setRegistrations(registrations.filter(r => r.id !== id));
      setHistory(history.filter(r => r.id !== id));
      setToast({ message: "তথ্যটি ডিলিট করা হয়েছে।", type: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ message: "ডিলিট করতে ত্রুটি হয়েছে।", type: 'error' });
    }
  };

  const handleDeleteAdmin = async (uid: string) => {
    if (uid === admin.uid) {
      setToast({ message: "আপনি নিজেকে ডিলিট করতে পারবেন না।", type: 'error' });
      return;
    }
    if (!confirm("আপনি কি নিশ্চিত যে এই এডমিনকে ডিলিট করতে চান?")) return;
    try {
      await deleteAdmin(uid);
      setAdmins(admins.filter(a => a.uid !== uid));
      setToast({ message: "এডমিন ডিলিট করা হয়েছে।", type: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ message: "ডিলিট করতে ত্রুটি হয়েছে।", type: 'error' });
    }
  };

  const handleEdit = (reg: RegistrationData) => {
    setEditingReg(reg);
    setEditForm(reg);
  };

  const handleUpdate = async () => {
    if (!editingReg?.id) return;
    try {
      const updatedData = {
        ...editForm,
        approvedByName: admin.name,
        approvedBy: admin.uid
      };
      await updateRegistration(editingReg.id, updatedData);
      setToast({ message: "তথ্য আপডেট সফল হয়েছে।", type: 'success' });
      setEditingReg(null);
      fetchData();
    } catch (error) {
      console.error(error);
      setToast({ message: "আপডেট ব্যর্থ হয়েছে।", type: 'error' });
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAdmin(true);
    try {
      // Generate a random UID since it's not required anymore
      const randomUid = 'admin-' + Math.random().toString(36).substr(2, 9);
      await addAdmin({ ...newAdmin, uid: randomUid, createdAt: new Date() } as AdminData);
      setAdmins([...admins, { ...newAdmin, uid: randomUid, createdAt: new Date() } as AdminData]);
      setNewAdmin({ name: '', username: '', password: '', phone: '', designation: '', role: 'admin' });
      setToast({ message: "এডমিন যোগ করা সফল হয়েছে।", type: 'success' });
    } catch (error) {
      console.error(error);
      setToast({ message: "এডমিন যোগ করা ব্যর্থ হয়েছে।", type: 'error' });
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('admin_session');
    onLogout();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500">
            {admin.photoUrl ? (
              <Image src={admin.photoUrl} alt={admin.name} fill className="object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Shield className="h-8 w-8" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{admin.name}</h1>
            <p className="text-slate-500 text-sm">{admin.designation} • {admin.role === 'super_admin' ? 'সুপার এডমিন' : 'এডমিন'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-lg shadow-emerald-100"
          >
            <UserPlus className="h-4 w-4" />
            <span>ইউজার রেজিষ্ট্রেশন</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors font-semibold"
          >
            <LogOut className="h-4 w-4" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Tabs - Serialized as requested */}
      <div className="flex flex-col space-y-2 mb-8 bg-slate-100 p-2 rounded-2xl w-full md:w-64">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'requests' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ClipboardList className="h-5 w-5" />
          <span>অনুমোদন রিকোয়েস্ট ({registrations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <CheckCircle className="h-5 w-5" />
          <span>সম্পন্ন (Done)</span>
        </button>
        {admin.role === 'super_admin' && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'admins' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="h-5 w-5" />
            <span>এডমিন লিস্ট</span>
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'requests' ? (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {registrations.length === 0 ? (
                <div className="col-span-full py-24 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">কোনো পেন্ডিং রিকোয়েস্ট নেই</p>
                </div>
              ) : (
                registrations.map((reg) => (
                  <div key={reg.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-48 bg-slate-100">
                      {reg.driverPhotoUrl ? (
                        <Image src={reg.driverPhotoUrl} alt={reg.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <UserPlus className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900 border border-white/20">
                        {reg.vehicleType}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{reg.name}</h3>
                        <p className="text-slate-500 text-sm flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1" /> {reg.phone}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <p className="text-slate-400 text-[10px] uppercase font-bold">আইডি</p>
                          <p className="text-slate-900 font-bold">{reg.generatedId}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <p className="text-slate-400 text-[10px] uppercase font-bold">পুরাতন নং</p>
                          <p className="text-slate-900 font-bold">{reg.currentNumber}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(reg.id!)}
                          className="flex-1 flex items-center justify-center space-x-1 bg-emerald-600 text-white py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>অনুমোদন</span>
                        </button>
                        <button
                          onClick={() => handleEdit(reg)}
                          className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 py-2 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                        >
                          <span>এডিট</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleReject(reg.id!)}
                        className="w-full flex items-center justify-center space-x-1 bg-red-50 text-red-600 py-2 rounded-xl font-bold hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>বাতিল</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRegistration(reg.id!)}
                        className="w-full flex items-center justify-center space-x-1 bg-red-100 text-red-700 py-2 rounded-xl font-bold hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>ডিলিট</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : activeTab === 'history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {history.length === 0 ? (
                <div className="col-span-full py-24 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">কোনো সম্পন্ন রিকোয়েস্ট নেই</p>
                </div>
              ) : (
                history.map((reg) => (
                  <div key={reg.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{reg.name}</h3>
                          <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider">অনুমোদিত (Done)</p>
                        </div>
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          {reg.generatedId}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p className="flex items-center"><Phone className="h-3 w-3 mr-2 text-slate-400" /> {reg.phone}</p>
                        <p className="flex items-center"><Car className="h-3 w-3 mr-2 text-slate-400" /> {reg.vehicleName}</p>
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Added this data by</p>
                          <p className="flex items-center text-slate-900 font-bold"><Shield className="h-3 w-3 mr-1 text-emerald-500" /> {reg.approvedByName || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => { setSelectedReg(reg); setShowCard(true); }}
                          className="flex-1 flex items-center justify-center space-x-1 bg-slate-900 text-white py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>কার্ড</span>
                        </button>
                        <button
                          onClick={() => handleEdit(reg)}
                          className="flex-1 flex items-center justify-center space-x-1 bg-blue-50 text-blue-600 py-2 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                        >
                          <span>এডিট</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRegistration(reg.id!)}
                          className="flex-1 flex items-center justify-center space-x-1 bg-red-50 text-red-600 py-2 rounded-xl font-bold hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Add Admin Form */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                  <UserPlus className="h-6 w-6 text-emerald-600" />
                  <span>নতুন এডমিন যোগ করুন</span>
                </h2>
                <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input
                    type="text"
                    placeholder="নাম"
                    value={newAdmin.name}
                    onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ইউজারনেম"
                    value={newAdmin.username}
                    onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <input
                    type="password"
                    placeholder="পাসওয়ার্ড"
                    value={newAdmin.password}
                    onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ফোন"
                    value={newAdmin.phone}
                    onChange={e => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                    className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="পদবি"
                    value={newAdmin.designation}
                    onChange={e => setNewAdmin({ ...newAdmin, designation: e.target.value })}
                    className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <select
                    value={newAdmin.role}
                    onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value as any })}
                    className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="admin">এডমিন</option>
                    <option value="super_admin">সুপার এডমিন</option>
                  </select>
                  <button
                    type="submit"
                    disabled={addingAdmin}
                    className="md:col-span-3 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {addingAdmin ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "এডমিন যোগ করুন"}
                  </button>
                </form>
              </div>

              {/* Admin List */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">এডমিন</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">ইউজারনেম</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">পাসওয়ার্ড</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">রোল</th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admins.map((a) => (
                      <tr key={a.uid} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100">
                              {a.photoUrl ? (
                                <Image src={a.photoUrl} alt={a.name} fill className="object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Shield className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-slate-900">{a.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono">{a.username}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono">{a.password}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {a.role === 'super_admin' ? 'সুপার এডমিন' : 'এডমিন'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteAdmin(a.uid)}
                            className="text-red-400 hover:text-red-600 p-2 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Card Modal */}
      <AnimatePresence>
        {showCard && selectedReg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <button
                onClick={() => setShowCard(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2"
              >
                <XCircle className="h-8 w-8" />
              </button>
              <Card 
                registration={selectedReg} 
                currentAdmin={admin} 
                onDownload={() => fetchData()} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingReg && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">তথ্য এডিট করুন</h2>
                <button
                  onClick={() => setEditingReg(null)}
                  className="text-slate-400 hover:text-slate-600 p-2"
                >
                  <XCircle className="h-8 w-8" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">নাম</label>
                  <input 
                    type="text" 
                    value={editForm.name || ''} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">ফোন</label>
                  <input 
                    type="text" 
                    value={editForm.phone || ''} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">গাড়ির নাম</label>
                  <input 
                    type="text" 
                    value={editForm.vehicleName || ''} 
                    onChange={e => setEditForm({...editForm, vehicleName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">রুট</label>
                  <input 
                    type="text" 
                    value={editForm.route || ''} 
                    onChange={e => setEditForm({...editForm, route: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">ইউনিয়ন</label>
                  <input 
                    type="text" 
                    value={editForm.union || ''} 
                    onChange={e => setEditForm({...editForm, union: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">গ্রাম</label>
                  <input 
                    type="text" 
                    value={editForm.village || ''} 
                    onChange={e => setEditForm({...editForm, village: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdate}
                className="w-full mt-8 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all"
              >
                আপডেট করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Register User Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">ইউজার রেজিষ্ট্রেশন</h2>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2"
                >
                  <XCircle className="h-8 w-8" />
                </button>
              </div>
              <RegistrationForm currentAdmin={admin} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 font-bold ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
          >
            {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
