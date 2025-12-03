import React, { useState, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Camera, 
  Image, 
  X, 
  Loader2, 
  FileText,
  Plus,
  ExternalLink,
  Bell  // ✅ NOUVEAU: Icône cloche
} from 'lucide-react';
import useGoogleDrivePicker from '../hooks/useGoogleDrivePicker';

/**
 * InputBar - Barre de saisie style Claude avec Google Drive
 */
export default function InputBar({
  value,
  onChange,
  onSend,
  onFileUpload,
  isLoading = false,
  disabled = false,
  placeholder = "اكتب سؤالك هنا...",
  onQiblaClick,
  onPrayerClick  // ✅ NOUVEAU: Callback pour le bouton prière
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // ============================================
  // GOOGLE DRIVE PICKER
  // ============================================

  const { 
    openPicker: openGoogleDrive, 
    isLoading: isDriveLoading,
    isReady: isDriveReady,
    hasCredentials: hasDriveCredentials
  } = useGoogleDrivePicker({
    onSelect: (files, accessToken) => {
      console.log('Files selected from Google Drive:', files);
      
      // Ajouter les fichiers à la liste
      const newFiles = files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.mimeType,
        size: file.size || 0,
        preview: file.thumbnailUrl || null,
        source: 'google-drive',
        driveId: file.id,
        driveUrl: file.url,
        downloadUrl: file.downloadUrl,
        accessToken: accessToken
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setShowAttachMenu(false);

      // Callback pour le parent
      if (onFileUpload) {
        onFileUpload(newFiles);
      }
    },
    onError: (error) => {
      console.error('Google Drive error:', error);
      alert('خطأ في الاتصال بـ Google Drive');
    }
  });

  // ============================================
  // RECONNAISSANCE VOCALE
  // ============================================

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('التعرف على الصوت غير مدعوم في هذا المتصفح');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      window.recognition?.stop();
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onChange(value + ' ' + transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      window.recognition = recognition;
      recognition.start();
      setIsRecording(true);
    }
  };

  // ============================================
  // GESTION DES FICHIERS LOCAUX
  // ============================================

  const handleFileSelect = (e, type = 'file') => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        source: 'local'
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      if (onFileUpload) {
        onFileUpload(files);
      }
    }
    setShowAttachMenu(false);
    e.target.value = '';
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview && file.source === 'local') {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Capture d'écran
  const handleScreenshot = async () => {
    setShowAttachMenu(false);
    
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        stream.getTracks().forEach(track => track.stop());
        
        canvas.toBlob((blob) => {
          const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
          const newFile = {
            id: Date.now(),
            file,
            name: file.name,
            type: 'image/png',
            size: file.size,
            preview: URL.createObjectURL(blob),
            source: 'screenshot'
          };
          setUploadedFiles(prev => [...prev, newFile]);
        });
      } else {
        alert('التقاط الشاشة غير مدعوم في هذا المتصفح');
      }
    } catch (error) {
      console.log('Screenshot cancelled or failed');
    }
  };

  // ============================================
  // TEXTAREA & ENVOI
  // ============================================

  const handleTextareaChange = (e) => {
    onChange(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (value.trim() && !isLoading && !disabled) {
      onSend();
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // ============================================
  // DRAG & DROP
  // ============================================

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        source: 'local'
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      if (onFileUpload) {
        onFileUpload(files);
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div 
      className="w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop zone overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-emerald-500/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border-2 border-dashed border-emerald-500">
            <div className="text-center">
              <Paperclip className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                اسحب الملفات هنا
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative" dir="rtl">
        {/* Fichiers uploadés */}
        {uploadedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div 
                key={file.id}
                className="relative group bg-gray-100 dark:bg-gray-700 rounded-xl p-2 flex items-center gap-2"
              >
                {file.preview ? (
                  <img src={file.preview} alt={file.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                    {file.source === 'google-drive' && ' • Drive'}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center 
                    opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -left-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Zone de saisie principale */}
        <div className={`
          bg-white dark:bg-gray-800 
          rounded-2xl shadow-lg 
          border-2 transition-all duration-200
          ${isDragging 
            ? 'border-emerald-500 ring-4 ring-emerald-500/20' 
            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
          }
        `}>
          {/* Textarea */}
          <div className="px-4 pt-4 pb-2">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              rows={1}
              className="w-full resize-none bg-transparent text-gray-900 dark:text-white 
                placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base
                disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '24px', maxHeight: '200px' }}
            />
          </div>

          {/* Barre d'actions */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
            {/* Actions gauche */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleSend}
                disabled={!value.trim() || isLoading || disabled}
                className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl 
                  hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed 
                  transition-all flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleRecording}
                disabled={disabled}
                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center
                  ${isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-1">
              {/* ✅ NOUVEAU: Bouton Notification Prière */}
              {onPrayerClick && (
                <button
                  onClick={onPrayerClick}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 
                    transition-all flex items-center justify-center
                    border-2 border-transparent hover:border-purple-500/50
                    text-purple-600 dark:text-purple-400"
                  title="مواقيت الصلاة"
                >
                  <Bell className="w-5 h-5" />
                </button>
              )}

              {/* Bouton Qibla */}
              {onQiblaClick && (
                <button
                  onClick={onQiblaClick}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 
                    transition-all flex items-center justify-center
                    border-2 border-transparent hover:border-emerald-500/50"
                  title="اتجاه القبلة"
                >
                  <span className="text-2xl">🕋</span>
                </button>
              )}

              {/* Menu Attachments */}
              <div className="relative">
                <button
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  disabled={disabled}
                  className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center
                    ${showAttachMenu 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  title="إرفاق ملف"
                >
                  <Plus className={`w-5 h-5 transition-transform duration-200 ${showAttachMenu ? 'rotate-45' : ''}`} />
                </button>

                {/* Menu déroulant */}
                {showAttachMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                    
                    <div 
                      className="absolute z-50 bottom-full right-0 mb-2 w-72 
                        bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
                        border border-gray-200 dark:border-gray-700 overflow-hidden"
                      style={{ animation: 'fadeInUp 0.2s ease-out' }}
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">
                          إضافة مرفق
                        </p>
                      </div>

                      <div className="py-2">
                        {/* Upload fichier local */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">رفع ملف</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">من جهازك</p>
                          </div>
                        </button>

                        {/* Upload image */}
                        <button
                          onClick={() => imageInputRef.current?.click()}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">رفع صورة</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF</p>
                          </div>
                        </button>

                        {/* Capture d'écran */}
                        <button
                          onClick={handleScreenshot}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">التقاط شاشة</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Screenshot</p>
                          </div>
                        </button>

                        {/* Divider */}
                        <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>

                        {/* Google Drive */}
                        <button
                          onClick={() => {
                            if (hasDriveCredentials) {
                              openGoogleDrive();
                            } else {
                              alert('Google Drive غير مُفعّل. يرجى إضافة مفاتيح API.');
                            }
                          }}
                          disabled={isDriveLoading}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                        >
                          <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600">
                            {isDriveLoading ? (
                              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            ) : (
                              <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M12 11.79L7.21 3.21H16.79L12 11.79Z"/>
                                <path fill="#FBBC05" d="M3 20.79L7.79 12H17.21L12.42 20.79H3Z"/>
                                <path fill="#34A853" d="M16.79 3.21L21 11.79L16.21 20.79L12 12.21L16.79 3.21Z"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Google Drive
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {hasDriveCredentials 
                                ? (isDriveReady ? 'اختر من حسابك' : 'جاري التحميل...') 
                                : 'غير مُفعّل'
                              }
                            </p>
                          </div>
                          {hasDriveCredentials && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center hidden sm:block">
          اضغط Enter للإرسال • Shift+Enter لسطر جديد • اسحب الملفات هنا
        </p>
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'file')}
        accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx,.ppt"
        multiple
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'image')}
        accept="image/*"
        multiple
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
