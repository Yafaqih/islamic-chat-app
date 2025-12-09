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
  Bell
} from 'lucide-react';
import useGoogleDrivePicker from '../hooks/useGoogleDrivePicker';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * InputBar - Barre de saisie multilingue style Claude avec Google Drive
 */
export default function InputBar({
  value,
  onChange,
  onSend,
  onFileUpload,
  isLoading = false,
  disabled = false,
  placeholder,
  onQiblaClick,
  onPrayerClick
}) {
  const { language, t, isRTL } = useLanguage();
  
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Traductions
  const txt = {
    ar: {
      placeholder: 'اكتب سؤالك هنا...',
      addAttachment: 'إضافة مرفق',
      uploadFile: 'رفع ملف',
      fromDevice: 'من جهازك',
      uploadImage: 'رفع صورة',
      screenshot: 'التقاط شاشة',
      selectFromAccount: 'اختر من حسابك',
      loading: 'جاري التحميل...',
      notEnabled: 'غير مُفعّل',
      attachFile: 'إرفاق ملف',
      prayerTimes: 'مواقيت الصلاة',
      qiblaDirection: 'اتجاه القبلة',
      hint: 'اضغط Enter للإرسال • Shift+Enter لسطر جديد • اسحب الملفات هنا',
      voiceNotSupported: 'التعرف على الصوت غير مدعوم في هذا المتصفح',
      screenshotNotSupported: 'التقاط الشاشة غير مدعوم في هذا المتصفح',
      driveError: 'خطأ في الاتصال بـ Google Drive',
      driveNotEnabled: 'Google Drive غير مُفعّل. يرجى إضافة مفاتيح API.',
      dragFiles: 'اسحب الملفات هنا'
    },
    fr: {
      placeholder: 'Écrivez votre question ici...',
      addAttachment: 'Ajouter une pièce jointe',
      uploadFile: 'Importer un fichier',
      fromDevice: 'Depuis votre appareil',
      uploadImage: 'Importer une image',
      screenshot: 'Capture d\'écran',
      selectFromAccount: 'Choisir depuis votre compte',
      loading: 'Chargement...',
      notEnabled: 'Non activé',
      attachFile: 'Joindre un fichier',
      prayerTimes: 'Heures de prière',
      qiblaDirection: 'Direction de la Qibla',
      hint: 'Entrée pour envoyer • Shift+Entrée nouvelle ligne • Glissez fichiers ici',
      voiceNotSupported: 'La reconnaissance vocale n\'est pas prise en charge',
      screenshotNotSupported: 'La capture d\'écran n\'est pas prise en charge',
      driveError: 'Erreur de connexion à Google Drive',
      driveNotEnabled: 'Google Drive non activé.',
      dragFiles: 'Glissez les fichiers ici'
    },
    en: {
      placeholder: 'Write your question here...',
      addAttachment: 'Add attachment',
      uploadFile: 'Upload file',
      fromDevice: 'From your device',
      uploadImage: 'Upload image',
      screenshot: 'Screenshot',
      selectFromAccount: 'Select from your account',
      loading: 'Loading...',
      notEnabled: 'Not enabled',
      attachFile: 'Attach file',
      prayerTimes: 'Prayer times',
      qiblaDirection: 'Qibla direction',
      hint: 'Enter to send • Shift+Enter new line • Drag files here',
      voiceNotSupported: 'Voice recognition not supported',
      screenshotNotSupported: 'Screenshot not supported',
      driveError: 'Google Drive connection error',
      driveNotEnabled: 'Google Drive not enabled.',
      dragFiles: 'Drag files here'
    }
  }[language] || txt.ar;

  // Language mapping for speech recognition
  const speechLangMap = { ar: 'ar-SA', fr: 'fr-FR', en: 'en-US' };

  // Google Drive Picker
  const { 
    openPicker: openGoogleDrive, 
    isLoading: isDriveLoading,
    isReady: isDriveReady,
    hasCredentials: hasDriveCredentials
  } = useGoogleDrivePicker({
    onSelect: (files, accessToken) => {
      const newFiles = files.map(file => ({
        id: file.id, name: file.name, type: file.mimeType, size: file.size || 0,
        preview: file.thumbnailUrl || null, source: 'google-drive',
        driveId: file.id, driveUrl: file.url, downloadUrl: file.downloadUrl, accessToken
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setShowAttachMenu(false);
      if (onFileUpload) onFileUpload(newFiles);
    },
    onError: () => alert(txt.driveError)
  });

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(txt.voiceNotSupported);
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      window.recognition?.stop();
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = speechLangMap[language] || 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        onChange(value + ' ' + event.results[0][0].transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      window.recognition = recognition;
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(), file, name: file.name, type: file.type, size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null, source: 'local'
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      if (onFileUpload) onFileUpload(files);
    }
    setShowAttachMenu(false);
    e.target.value = '';
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview && file.source === 'local') URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleScreenshot = async () => {
    setShowAttachMenu(false);
    try {
      if (navigator.mediaDevices?.getDisplayMedia) {
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
          setUploadedFiles(prev => [...prev, {
            id: Date.now(), file, name: file.name, type: 'image/png',
            size: file.size, preview: URL.createObjectURL(blob), source: 'screenshot'
          }]);
        });
      } else {
        alert(txt.screenshotNotSupported);
      }
    } catch (error) {}
  };

  const handleTextareaChange = (e) => {
    onChange(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) onSend();
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(), file, name: file.name, type: file.type, size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null, source: 'local'
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      if (onFileUpload) onFileUpload(files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="relative" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} dir={isRTL ? 'rtl' : 'ltr'}>
      {isDragging && (
        <div className="absolute inset-0 bg-emerald-500/10 border-2 border-dashed border-emerald-500 rounded-2xl z-10 flex items-center justify-center">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{txt.dragFiles}</p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className={`mb-3 flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 flex items-center gap-2 max-w-[200px]">
              {file.preview ? (
                <img src={file.preview} alt={file.name} className="w-10 h-10 object-cover rounded-lg" />
              ) : (
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <button onClick={() => removeFile(file.id)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus-within:border-emerald-500 transition-all shadow-sm ${isDragging ? 'border-emerald-500' : ''}`}>
        <div className="flex items-end p-2 gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || txt.placeholder}
            disabled={disabled}
            rows={1}
            className={`flex-1 resize-none border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 py-2 px-3 max-h-[200px] text-sm sm:text-base ${isRTL ? 'text-right' : 'text-left'}`}
            style={{ minHeight: '44px' }}
          />
          
          <div className={`flex items-center gap-1 pb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button onClick={onSend} disabled={!value.trim() || isLoading || disabled}
                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${value.trim() && !isLoading ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
              <button onClick={toggleRecording} disabled={disabled}
                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {onPrayerClick && (
                <button onClick={onPrayerClick} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-center border-2 border-transparent hover:border-purple-500/50 text-purple-600 dark:text-purple-400" title={txt.prayerTimes}>
                  <Bell className="w-5 h-5" />
                </button>
              )}
              {onQiblaClick && (
                <button onClick={onQiblaClick} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-center border-2 border-transparent hover:border-emerald-500/50" title={txt.qiblaDirection}>
                  <span className="text-2xl">🕋</span>
                </button>
              )}

              <div className="relative">
                <button onClick={() => setShowAttachMenu(!showAttachMenu)} disabled={disabled}
                  className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${showAttachMenu ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`} title={txt.attachFile}>
                  <Plus className={`w-5 h-5 transition-transform duration-200 ${showAttachMenu ? 'rotate-45' : ''}`} />
                </button>

                {showAttachMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                    <div className={`absolute z-50 bottom-full mb-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${isRTL ? 'right-0' : 'left-0'}`} style={{ animation: 'fadeInUp 0.2s ease-out' }}>
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                        <p className={`text-sm font-semibold text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>{txt.addAttachment}</p>
                      </div>
                      <div className="py-2">
                        <button onClick={() => fileInputRef.current?.click()} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{txt.uploadFile}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{txt.fromDevice}</p>
                          </div>
                        </button>
                        <button onClick={() => imageInputRef.current?.click()} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{txt.uploadImage}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF</p>
                          </div>
                        </button>
                        <button onClick={handleScreenshot} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{txt.screenshot}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Screenshot</p>
                          </div>
                        </button>
                        <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>
                        <button onClick={() => hasDriveCredentials ? openGoogleDrive() : alert(txt.driveNotEnabled)} disabled={isDriveLoading}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600">
                            {isDriveLoading ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : (
                              <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M12 11.79L7.21 3.21H16.79L12 11.79Z"/>
                                <path fill="#FBBC05" d="M3 20.79L7.79 12H17.21L12.42 20.79H3Z"/>
                                <path fill="#34A853" d="M16.79 3.21L21 11.79L16.21 20.79L12 12.21L16.79 3.21Z"/>
                              </svg>
                            )}
                          </div>
                          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Google Drive</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {hasDriveCredentials ? (isDriveReady ? txt.selectFromAccount : txt.loading) : txt.notEnabled}
                            </p>
                          </div>
                          {hasDriveCredentials && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center hidden sm:block">{txt.hint}</p>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx,.ppt" multiple />
      <input ref={imageInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*" multiple />

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
