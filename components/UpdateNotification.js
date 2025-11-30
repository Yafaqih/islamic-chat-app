// components/UpdateNotification.js

import React from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function UpdateNotification({ show, onUpdate, onDismiss }) {
  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slide-down" dir="rtl">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-4 max-w-md">
        <div className="flex-shrink-0">
          <RefreshCw className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <p className="font-semibold text-right">تحديث متوفر</p>
          <p className="text-sm text-emerald-100 text-right">
            إصدار جديد من التطبيق متاح
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onUpdate}
            className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors text-sm"
          >
            تحديث الآن
          </button>
          
          <button
            onClick={onDismiss}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}