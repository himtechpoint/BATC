'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, 
  Phone, 
  MapPin, 
  Car, 
  Image as ImageIcon, 
  CheckCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  UNIONS, 
  WARDS, 
  VEHICLE_TYPES, 
  submitRegistration,
  uploadImage,
  AdminData
} from '@/lib/firebase-utils';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

const registrationSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  phone: z.string().min(11, "সঠিক ফোন নাম্বার দিন").max(14),
  fatherName: z.string().min(2, "বাবার নাম দিন"),
  motherName: z.string().min(2, "মাতার নাম দিন"),
  emergencyPhone: z.string().min(11, "সঠিক জরুরি মোবাইল নাম্বার দিন"),
  nid: z.string().min(10, "সঠিক জাতীয় পরিচয় পত্র নাম্বার দিন"),
  birthYear: z.string().length(4, "সঠিক জন্ম সাল দিন"),
  address: z.string().min(5, "বিস্তারিত ঠিকানা দিন"),
  union: z.string().min(1, "ইউনিয়ন সিলেক্ট করুন"),
  ward: z.string().min(1, "ওয়ার্ড নাম্বার সিলেক্ট করুন"),
  village: z.string().min(2, "গ্রামের নাম লিখুন"),
  vehicleName: z.string().min(2, "গাড়ির নাম দিন"),
  currentNumber: z.string().length(4, "৪ ডিজিট বর্তমান নাম্বার দিন (যেমন: B069)").regex(/^[A-Z]\d{3}$/, "সঠিক ফরম্যাট দিন (১টি বড় হাতের অক্ষর ও ৩টি সংখ্যা)"),
  color: z.string().min(2, "গাড়ির কালার দিন"),
  bodyNumber: z.string().optional(),
  batteryModel: z.string().min(2, "ব্যাটারি মডেল দিন"),
  route: z.string().min(2, "গাড়ি যে রুটে চলাচল করে তা লিখুন"),
  vehicleType: z.string().min(1, "অটোর ধরন সিলেক্ট করুন"),
  specialMark: z.string().optional(),
  vehiclePhoto: z.any().optional(),
  driverPhoto: z.any().optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function RegistrationForm({ currentAdmin }: { currentAdmin?: AdminData }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ docId: string; generatedId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    reset,
    control,
    setValue
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
  });

  // Watch all fields for persistence
  const formValues = useWatch({ control });

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('registration_form_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Don't restore file inputs
        const { vehiclePhoto, driverPhoto, ...rest } = parsedData;
        Object.entries(rest).forEach(([key, value]) => {
          setValue(key as any, value);
        });
      } catch (e) {
        console.error('Error loading saved form data:', e);
      }
    }
  }, [setValue]);

  // Save to localStorage on change
  useEffect(() => {
    if (formValues && Object.keys(formValues).length > 0) {
      const { vehiclePhoto, driverPhoto, ...rest } = formValues;
      localStorage.setItem('registration_form_data', JSON.stringify(rest));
    }
  }, [formValues]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegistrationFormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ['name', 'phone', 'fatherName', 'motherName', 'emergencyPhone', 'nid', 'birthYear', 'address', 'union', 'ward', 'village'];
    } else if (step === 2) {
      fieldsToValidate = ['vehicleName', 'currentNumber', 'color', 'batteryModel', 'route', 'vehicleType'];
    }

    const result = await trigger(fieldsToValidate);
    if (result) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const onSubmit = async (data: RegistrationFormValues) => {
    setLoading(true);
    setError(null);
    try {
      // Upload images if they exist
      let vehiclePhotoUrl = '';
      let driverPhotoUrl = '';

      const vehicleFile = data.vehiclePhoto?.[0];
      const driverFile = data.driverPhoto?.[0];

      const uploadPromises = [];
      if (vehicleFile instanceof File) {
        uploadPromises.push(uploadImage(vehicleFile, 'vehicles').then(url => vehiclePhotoUrl = url));
      }
      if (driverFile instanceof File) {
        uploadPromises.push(uploadImage(driverFile, 'drivers').then(url => driverPhotoUrl = url));
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      const { vehiclePhoto, driverPhoto, ...rest } = data;
      const submissionData: any = {
        ...rest,
        vehiclePhotoUrl,
        driverPhotoUrl
      };

      // If registered by admin, auto-approve
      if (currentAdmin) {
        submissionData.status = 'approved';
        submissionData.approvedBy = currentAdmin.uid;
        submissionData.approvedByName = currentAdmin.name;
        submissionData.approvedAt = new Date().toISOString();
      }

      const result = await submitRegistration(submissionData);
      if (result) {
        setSuccess(result as { docId: string; generatedId: string });
        localStorage.removeItem('registration_form_data');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "রেজিষ্ট্রেশন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-10 shadow-2xl text-center max-w-lg w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">অভিনন্দন!</h2>
          <p className="text-lg text-slate-600 mb-8 font-medium">আপনার রিকোয়েস্টটি সফলভাবে গ্রহণ করা হয়েছে।</p>
          
          <div className="bg-slate-50 rounded-3xl p-6 mb-8 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
              <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">নতুন আইডি:</span>
              <span className="text-2xl font-black text-emerald-600">{success.generatedId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">পুরাতন নাম্বার:</span>
              <span className="text-2xl font-black text-slate-900">{success.docId}</span>
            </div>
          </div>

          <p className="text-slate-500 text-sm mb-10 leading-relaxed">
            এডমিন আপনার তথ্য যাচাই করে অনুমোদন করলে আপনি কার্ড ডাউনলোড করতে পারবেন। সাধারণত ২৪ ঘণ্টার মধ্যে অনুমোদন দেওয়া হয়।
          </p>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200 active:scale-95"
          >
            ঠিক আছে
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= i ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {i}
            </div>
            {i < 3 && <div className={`w-12 h-1 ${step > i ? 'bg-emerald-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <User className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-slate-900">ব্যাক্তিগত তথ্য</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">নাম</label>
                  <input {...register('name')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="আপনার নাম লিখুন" />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">ফোন নাম্বার</label>
                  <input {...register('phone')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="০১XXXXXXXXX" />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">বাবার নাম</label>
                  <input {...register('fatherName')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="বাবার নাম লিখুন" />
                  {errors.fatherName && <p className="text-red-500 text-xs">{errors.fatherName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">মাতার নাম</label>
                  <input {...register('motherName')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="মাতার নাম লিখুন" />
                  {errors.motherName && <p className="text-red-500 text-xs">{errors.motherName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">জরুরি মোবাইল নাম্বার</label>
                  <input {...register('emergencyPhone')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="০১XXXXXXXXX" />
                  {errors.emergencyPhone && <p className="text-red-500 text-xs">{errors.emergencyPhone.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">জাতীয় পরিচয় পত্র নাম্বার</label>
                  <input {...register('nid')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="NID নাম্বার" />
                  {errors.nid && <p className="text-red-500 text-xs">{errors.nid.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">জন্ম সাল</label>
                  <input {...register('birthYear')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="যেমন: ১৯৯০" />
                  {errors.birthYear && <p className="text-red-500 text-xs">{errors.birthYear.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">ইউনিয়ন</label>
                  <select {...register('union')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
                    <option value="">সিলেক্ট করুন</option>
                    {UNIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  {errors.union && <p className="text-red-500 text-xs">{errors.union.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">ওয়ার্ড নাম্বার</label>
                  <select {...register('ward')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
                    <option value="">সিলেক্ট করুন</option>
                    {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  {errors.ward && <p className="text-red-500 text-xs">{errors.ward.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">গ্রামের নাম</label>
                  <input {...register('village')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="গ্রামের নাম লিখুন" />
                  {errors.village && <p className="text-red-500 text-xs">{errors.village.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">বিস্তারিত ঠিকানা</label>
                <textarea {...register('address')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all h-24" placeholder="আপনার বিস্তারিত ঠিকানা লিখুন" />
                {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
              </div>

              <div className="pt-6">
                <button type="button" onClick={nextStep} className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all">
                  <span>পরবর্তী ধাপ</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Car className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-slate-900">গাড়ির তথ্য</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">গাড়ির নাম</label>
                  <input {...register('vehicleName')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="গাড়ির নাম লিখুন" />
                  {errors.vehicleName && <p className="text-red-500 text-xs">{errors.vehicleName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">৪ ডিজিট বর্তমান নাম্বার (যেমন: B069)</label>
                  <input {...register('currentNumber')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="যেমন: B069" maxLength={4} />
                  {errors.currentNumber && <p className="text-red-500 text-xs">{errors.currentNumber.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">গাড়ির কালার</label>
                  <input {...register('color')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="গাড়ির কালার" />
                  {errors.color && <p className="text-red-500 text-xs">{errors.color.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">বডি নাম্বার (যদি থাকে)</label>
                  <input {...register('bodyNumber')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="বডি নাম্বার" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">ব্যাটারি মডেল</label>
                  <input {...register('batteryModel')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="ব্যাটারি মডেল" />
                  {errors.batteryModel && <p className="text-red-500 text-xs">{errors.batteryModel.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">অটোর ধরন</label>
                  <select {...register('vehicleType')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
                    <option value="">সিলেক্ট করুন</option>
                    {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {errors.vehicleType && <p className="text-red-500 text-xs">{errors.vehicleType.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">গাড়ি যে রুটে চলাচল করে</label>
                <input {...register('route')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="রুটের নাম লিখুন" />
                {errors.route && <p className="text-red-500 text-xs">{errors.route.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">বিশেষ কোনো চিহ্ন (যদি থাকে)</label>
                <input {...register('specialMark')} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="বিশেষ চিহ্ন" />
              </div>

              <div className="pt-6 flex space-x-4">
                <button type="button" onClick={prevStep} className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all">
                  <ArrowLeft className="h-5 w-5" />
                  <span>পূর্ববর্তী ধাপ</span>
                </button>
                <button type="button" onClick={nextStep} className="flex-[2] flex items-center justify-center space-x-2 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all">
                  <span>পরবর্তী ধাপ</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <ImageIcon className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-slate-900">ছবি আপলোড (লিংক)</h2>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start space-x-3 mb-6">
                <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800">
                  গাড়ির এবং চালকের পরিষ্কার ছবি আপলোড করুন। ছবিগুলো সরাসরি ডাটাবেইজে সংরক্ষিত হবে।
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">গাড়ির ছবি</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    {...register('vehiclePhoto')} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                  />
                  {errors.vehiclePhoto && <p className="text-red-500 text-xs">{errors.vehiclePhoto.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">চালকের ছবি</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    {...register('driverPhoto')} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                  />
                  {errors.driverPhoto && <p className="text-red-500 text-xs">{errors.driverPhoto.message as string}</p>}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center space-x-3 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-6 flex space-x-4">
                <button type="button" onClick={prevStep} className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all">
                  <ArrowLeft className="h-5 w-5" />
                  <span>পূর্ববর্তী ধাপ</span>
                </button>
                <button type="submit" disabled={loading} className="flex-[2] flex items-center justify-center space-x-2 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      <span>রেজিষ্ট্রেশন সম্পন্ন করুন</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
