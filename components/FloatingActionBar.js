// components/FloatingActionBar.js
import React from 'react';
import { Navigation, Bell } from 'lucide-react';

export default function FloatingActionBar({ 
  onQiblaClick, 
  onPrayerClick, 
  prayerEnabled = false,
  prayerAlert = false 
}) {
  return (
    <div className="fixed bottom-[140px] sm:bottom-32 left-4 flex flex-col gap-3 z-40">
      {/* Bouton Notifications Prière */}
      <button
        onClick={onPrayerClick}
        className={`${
          prayerEnabled 
            ? 'bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700' 
            : 'bg-gray-400 dark:bg-gray-600'
        } text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 relative group`}
        title="مواقيت الصلاة"
        aria-label="مواقيت الصلاة"
      >
        <Bell className="w-6 h-6" />
        
        {/* Badge alerte prière proche */}
        {prayerAlert && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse shadow-md">
            !
          </div>
        )}

        {/* Tooltip */}
        <span className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          مواقيت الصلاة
        </span>
      </button>

      {/* Bouton Boussole Qibla */}
      <button
        onClick={onQiblaClick}
        className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 relative group"
        title="بوصلة القبلة"
        aria-label="بوصلة القبلة"
      >
        <Navigation className="w-6 h-6" />

        {/* Tooltip */}
        <span className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          بوصلة القبلة
        </span>
      </button>
    </div>
  );
}