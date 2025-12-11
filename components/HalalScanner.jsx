import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * HalalScanner - Scanner de produits halal avec html5-qrcode (compatible iOS)
 */
export default function HalalScanner({ isOpen, onClose }) {
  const { language, isRTL } = useLanguage();
  
  const [mode, setMode] = useState('camera');
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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'halal-scanner-reader';

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
      noCameraFound: 'لم يتم العثور على كاميرا',
      loadingScanner: 'جاري تحميل الماسح...'
    },
    fr: {
      title: 'Scanner Halal',
      subtitle: 'Vérifiez les produits alimentaires',
      scanBarcode: 'Scanner',
      enterManually: 'Manuel',
      barcodeLabel: 'Code-barres',
      barcodePlaceholder: 'Entrez le code-barres...',
      search: 'Rechercher',
      scanning: 'Scan en cours...',
      analyzing: 'Analyse en cours...',
      pointCamera: 'Pointez vers le code-barres',
      cameraError: 'Impossible d\'accéder à la caméra',
      tryAgain: 'Réessayer',
      switchCamera: 'Changer caméra',
      halal: 'Halal',
      haram: 'Haram',
      doubtful: 'Douteux',
      unknown: 'Inconnu',
      halalDesc: 'Ce produit est halal et peut être consommé',
      haramDesc: 'Ce produit contient des ingrédients interdits',
      doubtfulDesc: 'Contient des ingrédients douteux, à éviter',
      unknownDesc: 'Statut non déterminé',
      productName: 'Nom du produit',
      brand: 'Marque',
      ingredients: 'Ingrédients',
      showIngredients: 'Voir les ingrédients',
      hideIngredients: 'Masquer',
      problematicIngredients: 'Ingrédients problématiques',
      aiAnalysis: 'Analyse IA',
      notFound: 'Produit non trouvé',
      notFoundDesc: 'Ce produit n\'existe pas dans notre base',
      scanAnother: 'Scanner un autre',
      noBarcode: 'Veuillez entrer un code-barres',
      invalidBarcode: 'Code-barres invalide',
      initializingCamera: 'Initialisation...',
      permissionDenied: 'Permission refusée',
      noCameraFound: 'Aucune caméra trouvée',
      loadingScanner: 'Chargement du scanner...'
    },
    en: {
      title: 'Halal Scanner',
      subtitle: 'Check food products',
      scanBarcode: 'Scan',
      enterManually: 'Manual',
      barcodeLabel: 'Barcode',
      barcodePlaceholder: 'Enter barcode...',
      search: 'Search',
      scanning: 'Scanning...',
      analyzing: 'Analyzing...',
      pointCamera: 'Point at barcode',
      cameraError: 'Cannot access camera',
      tryAgain: 'Try again',
      switchCamera: 'Switch camera',
      halal: 'Halal',
      haram: 'Haram',
      doubtful: 'Doubtful',
      unknown: 'Unknown',
      halalDesc: 'This product is halal',
      haramDesc: 'This product contains forbidden ingredients',
      doubtfulDesc: 'Contains doubtful ingredients',
      unknownDesc: 'Status unknown',
      productName: 'Product',
      brand: 'Brand',
      ingredients: 'Ingredients',
      showIngredients: 'Show ingredients',
      hideIngredients: 'Hide',
      problematicIngredients: 'Problematic ingredients',
      aiAnalysis: 'AI Analysis',
      notFound: 'Not found',
      notFoundDesc: 'Product not in database',
      scanAnother: 'Scan another',
      noBarcode: 'Enter a barcode',
      invalidBarcode: 'Invalid barcode',
      initializingCamera: 'Initializing...',
      permissionDenied: 'Permission denied',
      noCameraFound: 'No camera found',
      loadingScanner: 'Loading scanner...'
    }
  }[language] || {
    title: 'Scanner Halal',
    subtitle: 'Vérifiez les produits',
    scanBarcode: 'Scanner',
    enterManually: 'Manuel',
    barcodeLabel: 'Code-barres',
    barcodePlaceholder: 'Code-barres...',
    search: 'Rechercher',
    scanning: 'Scan...',
    analyzing: 'Analyse...',
    pointCamera: 'Pointez vers le code',
    cameraError: 'Erreur caméra',
    tryAgain: 'Réessayer',
    switchCamera: 'Changer',
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
    notFoundDesc: 'Produit introuvable',
    scanAnother: 'Rescanner',
    noBarcode: 'Entrez un code',
    invalidBarcode: 'Code invalide',
    initializingCamera: 'Chargement...',
    permissionDenied: 'Permission refusée',
    noCameraFound: 'Pas de caméra',
    loadingScanner: 'Chargement...'
  };

  // Flash effect
  useEffect(() => {
    if (result && result.found) {
      setFlashEffect(result.status);
      const timer = setTimeout(() => setFlashEffect(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  // Charger le script html5-qrcode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (window.Html5Qrcode) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="html5-qrcode"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load html5-qrcode');
      setCameraError('Failed to load scanner library');
    };
    document.head.appendChild(script);
  }, []);

  // Stop camera function
  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // SCANNING state
          await html5QrCodeRef.current.stop();
        }
      } catch (e) {
        console.log('Stop camera:', e.message);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
    setScannerReady(false);
  }, []);

  // Scan success callback
  const onScanSuccess = useCallback((decodedText) => {
    console.log('Scanned:', decodedText);
    if (navigator.vibrate) navigator.vibrate(200);
    stopCamera();
    setBarcode(decodedText);
    analyzeProduct(decodedText);
  }, [stopCamera]);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!scriptLoaded || !window.Html5Qrcode) {
      setCameraError(txt.loadingScanner);
      return;
    }

    try {
      setCameraError(null);
      setScannerReady(false);

      // Vérifier que l'élément existe
      const container = document.getElementById(scannerContainerId);
      if (!container) {
        console.error('Scanner container not found');
        setTimeout(startCamera, 200);
        return;
      }

      // Arrêter le scanner existant
      await stopCamera();

      // Obtenir les caméras
      const devices = await window.Html5Qrcode.getCameras();
      
      if (!devices || devices.length === 0) {
        setCameraError(txt.noCameraFound);
        return;
      }

      setCameras(devices);

      // Préférer la caméra arrière
      let preferredIndex = 0;
      for (let i = 0; i < devices.length; i++) {
        const label = (devices[i].label || '').toLowerCase();
        if (label.includes('back') || label.includes('rear') || label.includes('environment')) {
          preferredIndex = i;
          break;
        }
      }
      setCurrentCameraIndex(preferredIndex);

      // Créer le scanner
      html5QrCodeRef.current = new window.Html5Qrcode(scannerContainerId);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.333,
        disableFlip: false
      };

      await html5QrCodeRef.current.start(
        devices[preferredIndex].id,
        config,
        onScanSuccess,
        () => {} // Ignore failures
      );

      setIsScanning(true);
      setScannerReady(true);

    } catch (err) {
      console.error('Camera error:', err);
      if (err.message?.includes('Permission') || err.name === 'NotAllowedError') {
        setCameraError(txt.permissionDenied);
      } else if (err.message?.includes('not found') || err.name === 'NotFoundError') {
        setCameraError(txt.noCameraFound);
      } else {
        setCameraError(txt.cameraError + ': ' + (err.message || 'Unknown error'));
      }
    }
  }, [scriptLoaded, stopCamera, onScanSuccess, txt]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (cameras.length <= 1 || !html5QrCodeRef.current) return;

    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);

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
        () => {}
      );
    } catch (err) {
      console.error('Switch camera error:', err);
    }
  }, [cameras, currentCameraIndex, onScanSuccess]);

  // Analyze product
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
        setError(data.error || 'Error');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Connection error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Manual search
  const handleManualSearch = () => {
    if (!barcode.trim()) {
      setError(txt.noBarcode);
      return;
    }
    analyzeProduct(barcode.trim());
  };

  // Reset
  const resetScanner = () => {
    setResult(null);
    setError(null);
    setBarcode('');
    setShowIngredients(false);
    setFlashEffect(null);
    if (mode === 'camera') {
      setTimeout(startCamera, 100);
    }
  };

  // Effect: camera lifecycle
  useEffect(() => {
    if (isOpen && mode === 'camera' && !result && scriptLoaded) {
      const timer = setTimeout(startCamera, 300);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    }
    return () => stopCamera();
  }, [isOpen, mode, result, scriptLoaded]);

  // Effect: cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setResult(null);
      setError(null);
      setBarcode('');
      setFlashEffect(null);
      setCameraError(null);
    }
  }, [isOpen, stopCamera]);

  if (!isOpen) return null;

  // Status styles
  const getStatusStyle = (status) => {
    const styles = {
      halal: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        border: 'border-green-500',
        text: 'text-green-700 dark:text-green-400',
        icon: <CheckCircle className="w-12 h-12 text-green-500" />,
        label: txt.halal,
        desc: txt.halalDesc
      },
      haram: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        border: 'border-red-500',
        text: 'text-red-700 dark:text-red-400',
        icon: <XCircle className="w-12 h-12 text-red-500" />,
        label: txt.haram,
        desc: txt.haramDesc
      },
      doubtful: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        border: 'border-orange-500',
        text: 'text-orange-700 dark:text-orange-400',
        icon: <AlertTriangle className="w-12 h-12 text-orange-500" />,
        label: txt.doubtful,
        desc: txt.doubtfulDesc
      }
    };
    return styles[status] || {
      bg: 'bg-gray-100 dark:bg-gray-800',
      border: 'border-gray-400',
      text: 'text-gray-700 dark:text-gray-400',
      icon: <AlertCircle className="w-12 h-12 text-gray-500" />,
      label: txt.unknown,
      desc: txt.unknownDesc
    };
  };

  // Flash colors
  const flashColors = {
    halal: { header: 'from-green-500 to-green-600', shadow: '0 0 30px rgba(34,197,94,0.6)' },
    haram: { header: 'from-red-500 to-red-600', shadow: '0 0 30px rgba(239,68,68,0.6)' },
    doubtful: { header: 'from-orange-500 to-orange-600', shadow: '0 0 30px rgba(249,115,22,0.6)' }
  }[flashEffect] || null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
        style={flashColors ? { boxShadow: flashColors.shadow } : {}}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${flashColors?.header || 'from-emerald-600 to-teal-600'} p-4 relative transition-all duration-300`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
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
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {/* Result */}
          {result ? (
            <div className="space-y-4">
              {result.found ? (
                <>
                  <div className={`${getStatusStyle(result.status).bg} ${getStatusStyle(result.status).border} border-2 rounded-2xl p-6 text-center`}>
                    <div className="flex justify-center mb-3">{getStatusStyle(result.status).icon}</div>
                    <h3 className={`text-2xl font-bold ${getStatusStyle(result.status).text}`}>
                      {getStatusStyle(result.status).label}
                    </h3>
                    <p className={`text-sm mt-1 ${getStatusStyle(result.status).text} opacity-80`}>
                      {getStatusStyle(result.status).desc}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                    {result.product?.image && (
                      <div className="flex justify-center">
                        <img src={result.product.image} alt="" className="h-32 object-contain rounded-lg" />
                      </div>
                    )}
                    <div className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <ShoppingCart className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">{txt.productName}:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{result.product?.name || '-'}</span>
                      </div>
                      {result.product?.brand && (
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Info className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{txt.brand}:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{result.product.brand}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {result.problematicIngredients?.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <h4 className={`font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <AlertTriangle className="w-4 h-4" />
                        {txt.problematicIngredients}
                      </h4>
                      <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {result.problematicIngredients.map((ing, idx) => (
                          <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-sm">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

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

                  {result.product?.ingredients && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setShowIngredients(!showIngredients)}
                        className={`w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}
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

                  <button onClick={resetScanner} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    {txt.scanAnother}
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{txt.notFound}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{txt.notFoundDesc}</p>
                  <button onClick={resetScanner} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold">
                    {txt.scanAnother}
                  </button>
                </div>
              )}
            </div>
          ) : isAnalyzing ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{txt.analyzing}</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button onClick={resetScanner} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                {txt.tryAgain}
              </button>
            </div>
          ) : (
            <>
              {/* Mode Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-4">
                <button
                  onClick={() => { setMode('camera'); setError(null); }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    mode === 'camera' ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  {txt.scanBarcode}
                </button>
                <button
                  onClick={() => { setMode('manual'); stopCamera(); setError(null); }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    mode === 'manual' ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow' : 'text-gray-600 dark:text-gray-400'
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
                      <button onClick={startCamera} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                        {txt.tryAgain}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative bg-black rounded-xl overflow-hidden" style={{ minHeight: '280px' }}>
                        <div id={scannerContainerId} style={{ width: '100%' }} />
                        
                        {!scannerReady && (
                          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                              <p className="text-white text-sm">{txt.initializingCamera}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {isScanning ? txt.scanning : txt.pointCamera}
                        </p>
                        {cameras.length > 1 && (
                          <button onClick={switchCamera} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
                            <RefreshCw className="w-4 h-4" />
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
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" />{txt.analyzing}</>
                    ) : (
                      <><Search className="w-5 h-5" />{txt.search}</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>
        {`
          #${scannerContainerId} {
            border: none !important;
            border-radius: 12px;
            overflow: hidden;
          }
          #${scannerContainerId} video {
            border-radius: 12px !important;
          }
          #${scannerContainerId}__scan_region {
            background: transparent !important;
          }
          #${scannerContainerId}__dashboard_section_swaplink,
          #${scannerContainerId}__dashboard_section_csr,
          #${scannerContainerId}__header_message,
          #${scannerContainerId} img[alt="Info icon"] {
            display: none !important;
          }
          #html5-qrcode-button-camera-permission {
            background: #10b981 !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 12px 24px !important;
            color: white !important;
            font-weight: 600 !important;
            cursor: pointer !important;
          }
          #html5-qrcode-button-camera-permission:hover {
            background: #059669 !important;
          }
        `}
      </style>
    </div>
  );
}
