import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  RotateCcw,
  Keyboard,
  ScanLine,
  ShoppingCart,
  Leaf,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  SwitchCamera
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * HalalScanner - Scanner de produits halal avec html5-qrcode (compatible iOS)
 * Avec effet de clignotement coloré selon le résultat
 */
export default function HalalScanner({ isOpen, onClose }) {
  const { language, isRTL } = useLanguage();
  
  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [showIngredients, setShowIngredients] = useState(false);
  const [flashEffect, setFlashEffect] = useState(null);
  const [scannerReady, setScannerReady] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Traductions
  const txt = {
    ar: {
      title: 'ماسح الحلال',
      subtitle: 'تحقق من المنتجات الغذائية',
      scanBarcode: 'مسح الباركود',
      enterManually: 'إدخال يدوي',
      barcodeLabel: 'رقم الباركود',
      barcodePlaceholder: 'أدخل رقم الباركود...',
      search: 'بحث',
      scanning: 'جاري المسح...',
      analyzing: 'جاري التحليل...',
      pointCamera: 'وجّه الكاميرا نحو الباركود',
      cameraError: 'تعذر الوصول إلى الكاميرا',
      tryAgain: 'إعادة المحاولة',
      switchCamera: 'تبديل الكاميرا',
      
      halal: 'حلال',
      haram: 'حرام',
      doubtful: 'مشكوك فيه',
      unknown: 'غير معروف',
      
      halalDesc: 'هذا المنتج حلال ويمكن تناوله',
      haramDesc: 'هذا المنتج يحتوي على مكونات محرمة',
      doubtfulDesc: 'يحتوي على مكونات مشكوكة، يُفضل تجنبه',
      unknownDesc: 'لم نتمكن من تحديد حالة هذا المنتج',
      
      productName: 'اسم المنتج',
      brand: 'العلامة التجارية',
      ingredients: 'المكونات',
      showIngredients: 'عرض المكونات',
      hideIngredients: 'إخفاء المكونات',
      problematicIngredients: 'المكونات المشكوكة',
      aiAnalysis: 'تحليل الذكاء الاصطناعي',
      
      notFound: 'المنتج غير موجود',
      notFoundDesc: 'لم نجد هذا المنتج في قاعدة البيانات',
      scanAnother: 'مسح منتج آخر',
      
      noBarcode: 'الرجاء إدخال رقم الباركود',
      invalidBarcode: 'رقم الباركود غير صالح',
      initializingCamera: 'جاري تهيئة الكاميرا...',
      permissionDenied: 'تم رفض إذن الكاميرا',
      noCameraFound: 'لم يتم العثور على كاميرا'
    },
    fr: {
      title: 'Scanner Halal',
      subtitle: 'Vérifiez les produits alimentaires',
      scanBarcode: 'Scanner le code-barres',
      enterManually: 'Saisie manuelle',
      barcodeLabel: 'Code-barres',
      barcodePlaceholder: 'Entrez le code-barres...',
      search: 'Rechercher',
      scanning: 'Scan en cours...',
      analyzing: 'Analyse en cours...',
      pointCamera: 'Pointez la caméra vers le code-barres',
      cameraError: 'Impossible d\'accéder à la caméra',
      tryAgain: 'Réessayer',
      switchCamera: 'Changer de caméra',
      
      halal: 'Halal',
      haram: 'Haram',
      doubtful: 'Douteux',
      unknown: 'Inconnu',
      
      halalDesc: 'Ce produit est halal et peut être consommé',
      haramDesc: 'Ce produit contient des ingrédients interdits',
      doubtfulDesc: 'Contient des ingrédients douteux, à éviter de préférence',
      unknownDesc: 'Nous n\'avons pas pu déterminer le statut de ce produit',
      
      productName: 'Nom du produit',
      brand: 'Marque',
      ingredients: 'Ingrédients',
      showIngredients: 'Voir les ingrédients',
      hideIngredients: 'Masquer les ingrédients',
      problematicIngredients: 'Ingrédients problématiques',
      aiAnalysis: 'Analyse IA',
      
      notFound: 'Produit non trouvé',
      notFoundDesc: 'Ce produit n\'existe pas dans notre base de données',
      scanAnother: 'Scanner un autre produit',
      
      noBarcode: 'Veuillez entrer un code-barres',
      invalidBarcode: 'Code-barres invalide',
      initializingCamera: 'Initialisation de la caméra...',
      permissionDenied: 'Permission caméra refusée',
      noCameraFound: 'Aucune caméra trouvée'
    },
    en: {
      title: 'Halal Scanner',
      subtitle: 'Check food products',
      scanBarcode: 'Scan barcode',
      enterManually: 'Enter manually',
      barcodeLabel: 'Barcode',
      barcodePlaceholder: 'Enter barcode...',
      search: 'Search',
      scanning: 'Scanning...',
      analyzing: 'Analyzing...',
      pointCamera: 'Point camera at barcode',
      cameraError: 'Cannot access camera',
      tryAgain: 'Try again',
      switchCamera: 'Switch camera',
      
      halal: 'Halal',
      haram: 'Haram',
      doubtful: 'Doubtful',
      unknown: 'Unknown',
      
      halalDesc: 'This product is halal and can be consumed',
      haramDesc: 'This product contains forbidden ingredients',
      doubtfulDesc: 'Contains doubtful ingredients, better to avoid',
      unknownDesc: 'We could not determine the status of this product',
      
      productName: 'Product name',
      brand: 'Brand',
      ingredients: 'Ingredients',
      showIngredients: 'Show ingredients',
      hideIngredients: 'Hide ingredients',
      problematicIngredients: 'Problematic ingredients',
      aiAnalysis: 'AI Analysis',
      
      notFound: 'Product not found',
      notFoundDesc: 'This product does not exist in our database',
      scanAnother: 'Scan another product',
      
      noBarcode: 'Please enter a barcode',
      invalidBarcode: 'Invalid barcode',
      initializingCamera: 'Initializing camera...',
      permissionDenied: 'Camera permission denied',
      noCameraFound: 'No camera found'
    }
  }[language] || {
    title: 'Scanner Halal',
    subtitle: 'Vérifiez les produits alimentaires',
    scanBarcode: 'Scanner',
    enterManually: 'Manuel',
    barcodeLabel: 'Code-barres',
    barcodePlaceholder: 'Entrez le code-barres...',
    search: 'Rechercher',
    scanning: 'Scan...',
    analyzing: 'Analyse...',
    pointCamera: 'Pointez vers le code-barres',
    cameraError: 'Erreur caméra',
    tryAgain: 'Réessayer',
    switchCamera: 'Changer caméra',
    halal: 'Halal',
    haram: 'Haram',
    doubtful: 'Douteux',
    unknown: 'Inconnu',
    halalDesc: 'Produit halal',
    haramDesc: 'Produit haram',
    doubtfulDesc: 'Produit douteux',
    unknownDesc: 'Statut inconnu',
    productName: 'Produit',
    brand: 'Marque',
    ingredients: 'Ingrédients',
    showIngredients: 'Voir',
    hideIngredients: 'Masquer',
    problematicIngredients: 'Problématiques',
    aiAnalysis: 'Analyse IA',
    notFound: 'Non trouvé',
    notFoundDesc: 'Produit non trouvé',
    scanAnother: 'Rescanner',
    noBarcode: 'Entrez un code',
    invalidBarcode: 'Code invalide',
    initializingCamera: 'Initialisation...',
    permissionDenied: 'Permission refusée',
    noCameraFound: 'Pas de caméra'
  };

  // Déclencher l'effet de flash quand le résultat arrive
  useEffect(() => {
    if (result && result.found) {
      setFlashEffect(result.status);
      const timer = setTimeout(() => {
        setFlashEffect(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  // Charger la librairie html5-qrcode dynamiquement
  const loadHtml5QrCode = async () => {
    if (window.Html5Qrcode) {
      return window.Html5Qrcode;
    }
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      script.async = true;
      script.onload = () => {
        if (window.Html5Qrcode) {
          resolve(window.Html5Qrcode);
        } else {
          reject(new Error('Html5Qrcode not loaded'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load html5-qrcode'));
      document.head.appendChild(script);
    });
  };

  // Start camera avec html5-qrcode
  const startCamera = async () => {
    try {
      setCameraError(null);
      setScannerReady(false);
      
      // Charger la librairie
      const Html5Qrcode = await loadHtml5QrCode();
      
      // Obtenir la liste des caméras
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        
        // Préférer la caméra arrière
        let preferredIndex = 0;
        for (let i = 0; i < devices.length; i++) {
          const label = devices[i].label.toLowerCase();
          if (label.includes('back') || label.includes('rear') || label.includes('environment') || label.includes('arrière')) {
            preferredIndex = i;
            break;
          }
        }
        setCurrentCameraIndex(preferredIndex);
        
        // Arrêter le scanner existant s'il y en a un
        if (html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.stop();
          } catch (e) {
            // Ignorer si pas démarré
          }
        }
        
        // Créer le scanner
        html5QrCodeRef.current = new Html5Qrcode("halal-scanner-reader");
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.333
        };
        
        await html5QrCodeRef.current.start(
          devices[preferredIndex].id,
          config,
          onScanSuccess,
          onScanFailure
        );
        
        setIsScanning(true);
        setScannerReady(true);
        
      } else {
        setCameraError(txt.noCameraFound);
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.message?.includes('Permission') || err.name === 'NotAllowedError') {
        setCameraError(txt.permissionDenied);
      } else {
        setCameraError(txt.cameraError);
      }
    }
  };

  // Callback quand un code est scanné
  const onScanSuccess = (decodedText, decodedResult) => {
    console.log('Scanned:', decodedText);
    // Vibration feedback si disponible
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    // Arrêter le scanner
    stopCamera();
    setBarcode(decodedText);
    analyzeProduct(decodedText);
  };

  // Callback d'échec de scan (appelé souvent, donc on ignore)
  const onScanFailure = (error) => {
    // Ignore - c'est normal quand il n'y a pas de code visible
  };

  // Stop camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        // Ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
    setScannerReady(false);
  };

  // Changer de caméra
  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.333
        };
        
        await html5QrCodeRef.current.start(
          cameras[nextIndex].id,
          config,
          onScanSuccess,
          onScanFailure
        );
      } catch (err) {
        console.error('Switch camera error:', err);
      }
    }
  };

  // Analyze product via API
  const analyzeProduct = async (code) => {
    if (!code || code.length < 8) {
      setError(txt.invalidBarcode);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setFlashEffect(null);

    try {
      const response = await fetch('/api/halal-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: code, language })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Erreur de connexion');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle manual search
  const handleManualSearch = () => {
    if (!barcode.trim()) {
      setError(txt.noBarcode);
      return;
    }
    analyzeProduct(barcode.trim());
  };

  // Reset scanner
  const resetScanner = () => {
    setResult(null);
    setError(null);
    setBarcode('');
    setShowIngredients(false);
    setFlashEffect(null);
    if (mode === 'camera') {
      startCamera();
    }
  };

  // Effect: Start camera when mode is camera
  useEffect(() => {
    if (isOpen && mode === 'camera' && !result) {
      // Petit délai pour laisser le DOM se rendre
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      return () => clearTimeout(timer);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, result]);

  // Effect: Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setResult(null);
      setError(null);
      setBarcode('');
      setFlashEffect(null);
      setCameraError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'halal':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          border: 'border-green-500',
          text: 'text-green-700 dark:text-green-400',
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          label: txt.halal,
          desc: txt.halalDesc
        };
      case 'haram':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          border: 'border-red-500',
          text: 'text-red-700 dark:text-red-400',
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          label: txt.haram,
          desc: txt.haramDesc
        };
      case 'doubtful':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          border: 'border-orange-500',
          text: 'text-orange-700 dark:text-orange-400',
          icon: <AlertTriangle className="w-12 h-12 text-orange-500" />,
          label: txt.doubtful,
          desc: txt.doubtfulDesc
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          border: 'border-gray-400',
          text: 'text-gray-700 dark:text-gray-400',
          icon: <AlertCircle className="w-12 h-12 text-gray-500" />,
          label: txt.unknown,
          desc: txt.unknownDesc
        };
    }
  };

  // Get flash colors
  const getFlashColors = () => {
    switch (flashEffect) {
      case 'halal':
        return {
          border: 'border-green-500',
          shadow: '0 0 30px 10px rgba(34, 197, 94, 0.6)',
          overlay: 'rgba(34, 197, 94, 0.15)',
          header: 'from-green-500 to-green-600'
        };
      case 'haram':
        return {
          border: 'border-red-500',
          shadow: '0 0 30px 10px rgba(239, 68, 68, 0.6)',
          overlay: 'rgba(239, 68, 68, 0.15)',
          header: 'from-red-500 to-red-600'
        };
      case 'doubtful':
        return {
          border: 'border-orange-500',
          shadow: '0 0 30px 10px rgba(249, 115, 22, 0.6)',
          overlay: 'rgba(249, 115, 22, 0.15)',
          header: 'from-orange-500 to-orange-600'
        };
      default:
        return null;
    }
  };

  const flashColors = getFlashColors();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Flash overlay */}
      {flashEffect && (
        <div 
          className="absolute inset-0 pointer-events-none z-10 animate-flash-overlay"
          style={{
            background: `radial-gradient(circle at center, ${flashColors.overlay} 0%, transparent 70%)`
          }}
        />
      )}
      
      <div 
        className={`bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl relative ${
          flashEffect ? 'animate-flash-border' : ''
        }`}
        style={flashEffect ? { 
          boxShadow: flashColors.shadow,
          animation: 'borderFlash 0.5s ease-in-out 3'
        } : {}}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${
          flashEffect ? flashColors.header : 'from-emerald-600 to-teal-600'
        } p-4 relative transition-all duration-300`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center ${flashEffect ? 'animate-pulse' : ''}`}>
              {flashEffect === 'halal' ? <CheckCircle className="w-6 h-6 text-white" /> :
               flashEffect === 'haram' ? <XCircle className="w-6 h-6 text-white" /> :
               flashEffect === 'doubtful' ? <AlertTriangle className="w-6 h-6 text-white" /> :
               <ScanLine className="w-6 h-6 text-white" />}
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <h2 className="text-xl font-bold text-white">{txt.title}</h2>
              <p className="text-white/80 text-sm">{txt.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto relative z-0" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {/* Result View */}
          {result ? (
            <div className="space-y-4">
              {result.found ? (
                <>
                  {/* Status Badge */}
                  <div className={`${getStatusStyle(result.status).bg} ${getStatusStyle(result.status).border} border-2 rounded-2xl p-6 text-center ${flashEffect ? 'animate-pulse-once' : ''}`}>
                    <div className="flex justify-center mb-3">
                      {getStatusStyle(result.status).icon}
                    </div>
                    <h3 className={`text-2xl font-bold ${getStatusStyle(result.status).text}`}>
                      {getStatusStyle(result.status).label}
                    </h3>
                    <p className={`text-sm mt-1 ${getStatusStyle(result.status).text} opacity-80`}>
                      {getStatusStyle(result.status).desc}
                    </p>
                  </div>

                  {/* Product Info */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                    {result.product?.image && (
                      <div className="flex justify-center">
                        <img 
                          src={result.product.image} 
                          alt={result.product.name}
                          className="h-32 object-contain rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <ShoppingCart className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-500">{txt.productName}:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {result.product?.name || '-'}
                        </span>
                      </div>
                      
                      {result.product?.brand && (
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Info className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-500">{txt.brand}:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {result.product.brand}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Problematic Ingredients */}
                  {result.problematicIngredients && result.problematicIngredients.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <h4 className={`font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <AlertTriangle className="w-4 h-4" />
                        {txt.problematicIngredients}
                      </h4>
                      <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {result.problematicIngredients.map((ing, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-sm"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Analysis */}
                  {result.aiAnalysis && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <h4 className={`font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Leaf className="w-4 h-4" />
                        {txt.aiAnalysis}
                      </h4>
                      <p className={`text-sm text-blue-800 dark:text-blue-300 ${isRTL ? 'text-right' : ''}`}>
                        {result.aiAnalysis}
                      </p>
                    </div>
                  )}

                  {/* Ingredients Collapsible */}
                  {result.product?.ingredients && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setShowIngredients(!showIngredients)}
                        className={`w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {showIngredients ? txt.hideIngredients : txt.showIngredients}
                        </span>
                        {showIngredients ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      {showIngredients && (
                        <div className={`p-4 text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : ''}`}>
                          {result.product.ingredients}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scan Another Button */}
                  <button
                    onClick={resetScanner}
                    className={`w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <RotateCcw className="w-5 h-5" />
                    {txt.scanAnother}
                  </button>
                </>
              ) : (
                /* Product Not Found */
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {txt.notFound}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {txt.notFoundDesc}
                  </p>
                  <button
                    onClick={resetScanner}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
                  >
                    {txt.scanAnother}
                  </button>
                </div>
              )}
            </div>
          ) : isAnalyzing ? (
            /* Loading State */
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{txt.analyzing}</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={resetScanner}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
              >
                {txt.tryAgain}
              </button>
            </div>
          ) : (
            /* Scanner View */
            <>
              {/* Mode Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-4">
                <button
                  onClick={() => { setMode('camera'); setError(null); }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    mode === 'camera' 
                      ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  {txt.scanBarcode}
                </button>
                <button
                  onClick={() => { setMode('manual'); stopCamera(); setError(null); }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    mode === 'manual' 
                      ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Keyboard className="w-4 h-4" />
                  {txt.enterManually}
                </button>
              </div>

              {/* Camera View */}
              {mode === 'camera' && (
                <div className="relative">
                  {cameraError ? (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-8 text-center">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{cameraError}</p>
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        {txt.tryAgain}
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Scanner container */}
                      <div className="relative bg-black rounded-xl overflow-hidden">
                        <div 
                          id="halal-scanner-reader" 
                          ref={scannerRef}
                          className="w-full"
                          style={{ minHeight: '300px' }}
                        />
                        
                        {/* Loading overlay */}
                        {!scannerReady && (
                          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                              <p className="text-white text-sm">{txt.initializingCamera}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {isScanning ? txt.scanning : txt.pointCamera}
                        </p>
                        
                        {cameras.length > 1 && (
                          <button
                            onClick={switchCamera}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <SwitchCamera className="w-4 h-4" />
                            {txt.switchCamera}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Manual Entry */}
              {mode === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                      {txt.barcodeLabel}
                    </label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                      placeholder={txt.barcodePlaceholder}
                      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
                    />
                  </div>
                  <button
                    onClick={handleManualSearch}
                    disabled={isAnalyzing}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {txt.analyzing}
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        {txt.search}
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes borderFlash {
          0%, 100% { box-shadow: 0 0 0 0 transparent; }
          50% { box-shadow: 0 0 30px 10px rgba(16, 185, 129, 0.6); }
        }
        
        @keyframes flashOverlay {
          0%, 100% { opacity: 0; }
          25%, 75% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        
        .animate-flash-overlay {
          animation: flashOverlay 2s ease-in-out;
        }
        
        .animate-flash-border {
          animation: borderFlash 0.5s ease-in-out 3;
        }
        
        .animate-pulse-once {
          animation: pulse 0.5s ease-in-out 2;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        /* Styles pour html5-qrcode */
        #halal-scanner-reader {
          border: none !important;
          border-radius: 12px;
          overflow: hidden;
        }
        
        #halal-scanner-reader video {
          border-radius: 12px;
        }
        
        #halal-scanner-reader__scan_region {
          background: transparent !important;
        }
        
        #halal-scanner-reader__dashboard_section_swaplink {
          display: none !important;
        }
        
        #halal-scanner-reader img[alt="Info icon"] {
          display: none !important;
        }
        
        #halal-scanner-reader__dashboard_section_csr span {
          color: #9ca3af !important;
          font-size: 12px !important;
        }
        
        #halal-scanner-reader__dashboard_section_csr {
          display: none !important;
        }
        
        #halal-scanner-reader__header_message {
          display: none !important;
        }
        
        #html5-qrcode-button-camera-permission {
          background: #10b981 !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 12px 24px !important;
          color: white !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
}
