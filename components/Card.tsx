'use client';

import { RegistrationData, AdminData, incrementDownloadCount } from '@/lib/firebase-utils';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Download, MapPin, Phone, Hash, User, Car, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { toJpeg } from 'html-to-image';

interface CardProps {
  registration: RegistrationData;
  currentAdmin?: AdminData;
  onDownload?: () => void;
}

export default function Card({ registration, currentAdmin, onDownload }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const isSuperAdmin = currentAdmin?.username === 'hridoyhasanrafi';
  const hasDownloaded = registration.downloadedBy?.includes(currentAdmin?.username || '');
  const canDownload = isSuperAdmin || !hasDownloaded;

  const downloadJPG = async () => {
    if (!cardRef.current || !canDownload) return;
    setDownloading(true);
    try {
      const dataUrl = await toJpeg(cardRef.current, { 
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });

      // Increment download count in local storage
      if (registration.id && currentAdmin && currentAdmin.username) {
        await incrementDownloadCount(registration.id, currentAdmin.username);
        if (onDownload) onDownload();
      }

      const link = document.createElement('a');
      link.download = `Bakshiganj_Auto_Card_${registration.generatedId}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating JPG:', error);
    } finally {
      setDownloading(false);
    }
  };

  const qrValue = JSON.stringify({
    'নাম': registration.name,
    'গাড়ির নাম্বার': registration.currentNumber,
    'ফোন': registration.phone,
    'ঠিকানা': `${registration.village}, ${registration.union}`,
    'আইডি': registration.generatedId
  });

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Card Preview */}
      <div 
        ref={cardRef}
        className="w-[400px] h-[600px] bg-white border-8 border-emerald-600 rounded-[40px] shadow-2xl overflow-hidden relative font-sans p-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <Shield className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Bakshiganj Auto</h2>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Security Registration Card</p>
        </div>

        {/* Driver Photo Area with Side QR Codes */}
        <div className="relative flex items-center justify-center mb-6 px-4">
          {/* Left QR Code */}
          <div className="absolute left-4 opacity-20">
            <QRCodeSVG value={qrValue} size={40} level="L" />
          </div>

          <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-slate-100 shadow-sm z-10">
            {registration.driverPhotoUrl ? (
              <Image 
                src={registration.driverPhotoUrl} 
                alt={registration.name} 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                <User className="h-12 w-12" />
              </div>
            )}
          </div>

          {/* Right QR Code */}
          <div className="absolute right-4 opacity-20">
            <QRCodeSVG value={qrValue} size={40} level="L" />
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-4 mb-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">{registration.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{registration.vehicleType}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Generated ID</p>
              <p className="text-lg font-black text-emerald-600 leading-none">{registration.generatedId}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Vehicle No</p>
              <p className="text-lg font-black text-slate-900 leading-none">{registration.currentNumber}</p>
            </div>
          </div>

          <div className="flex justify-between items-end px-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Phone className="h-3 w-3 text-emerald-600" />
                <span className="font-bold">{registration.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <MapPin className="h-3 w-3 text-emerald-600" />
                <span className="font-medium">{registration.village}, {registration.union}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Car className="h-3 w-3 text-emerald-600" />
                <span className="font-medium">{registration.vehicleName}</span>
              </div>
            </div>
            
            {/* QR Code in marked place (bottom right of content) */}
            <div className="flex flex-col items-center p-1 bg-white border border-slate-100 rounded-xl shadow-sm">
              <QRCodeSVG value={qrValue} size={100} level="H" />
            </div>
          </div>
        </div>

        {/* Download Info (Visible on card) */}
        <div className="px-4 mb-4 space-y-1">
          <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
            <span>Approved By: {registration.approvedByName || 'Hridoy Hasan Rafi'}</span>
            <span>Downloads: {registration.downloadCount || 0}</span>
          </div>
          {registration.downloadedBy && registration.downloadedBy.length > 0 && (
            <p className="text-[8px] font-bold text-slate-400 uppercase">
              Last Downloaded By: {registration.downloadedBy[registration.downloadedBy.length - 1]}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 p-3 text-center">
          <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-1">
            Approved By: {registration.approvedByName || 'Hridoy Hasan Rafi'}
          </p>
          <p className="text-[9px] font-black text-white">সহযোগিতায় গণ অধিকার পরিষদের সকল সদস্য বকশিগঞ্জ উপজেলা</p>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex flex-col items-center w-full max-w-md space-y-4">
        {!canDownload && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl text-sm font-bold border border-red-100">
            <AlertCircle className="h-4 w-4" />
            <span>আপনি ইতিমধ্যে এই কার্ডটি ডাউনলোড করেছেন।</span>
          </div>
        )}
        <button
          onClick={downloadJPG}
          disabled={downloading || !canDownload}
          className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200 disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
          <span>ডাউনলোড কার্ড (JPG)</span>
        </button>
      </div>
    </div>
  );
}
