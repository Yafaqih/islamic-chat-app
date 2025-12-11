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
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * HalalScanner - Scanner de produits halal avec caméra et analyse IA
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
  const [flashEffect, setFlashEffect] = useState(null); // ✅ 'halal' | 'haram' | 'doubtful' | null
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

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
      invalidBarcode: 'رقم الباركود غير صالح'
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
      invalidBarcode: 'Code-barres invalide'
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
      invalidBarcode: 'Invalid barcode'
    }
  }[language] || {
    title: 'Scanner Halal',
    subtitle: 'Vérifiez les produits alimentaires',
    scanBarcode: 'Scanner',
    enterManually: 'Manuel',
    search: 'Rechercher',
    halal: 'Halal',
    haram: 'Haram',
    doubtful: 'Douteux'
  };

  // ✅ Déclencher l'effet de flash quand le résultat arrive
  useEffect(() => {
    if (result && result.found) {
      setFlashEffect(result.status);
      // Arrêter le flash après 2 secondes
      const timer = setTimeout(() => {
        setFlashEffect(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        startBarcodeDetection();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(txt.cameraError);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  // Barcode detection using BarcodeDetector API or fallback
  const startBarcodeDetection = () => {
    if ('BarcodeDetector' in window) {
      const barcodeDetector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
      });
      
      scanIntervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              stopCamera();
              setBarcode(code);
              analyzeProduct(code);
            }
          } catch (err) {
            // Continue scanning
          }
        }
      }, 500);
    } else {
      // Fallback: Manual entry only
      setCameraError('BarcodeDetector not supported. Please enter barcode manually.');
      setMode('manual');
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
      startCamera();
    }
    return () => stopCamera();
  }, [isOpen, mode, result]);

  // Effect: Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setResult(null);
      setError(null);
      setBarcode('');
      setFlashEffect(null);
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
          icon: <AlertCircle className="w-12 h-12 text-gray-400" />,
          label: txt.unknown,
          desc: txt.unknownDesc
        };
    }
  };

  // ✅ Classes pour l'effet de flash
  const getFlashClass = () => {
    if (!flashEffect) return '';
    switch (flashEffect) {
      case 'halal':
        return 'flash-green';
      case 'haram':
        return 'flash-red';
      case 'doubtful':
        return 'flash-orange';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* ✅ Modal avec effet de flash */}
      <div className={`bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl relative ${getFlashClass()}`}>
        
        {/* ✅ Overlay de flash coloré */}
        {flashEffect && (
          <div className={`absolute inset-0 rounded-3xl pointer-events-none z-10 flash-overlay ${
            flashEffect === 'halal' ? 'flash-overlay-green' :
            flashEffect === 'haram' ? 'flash-overlay-red' :
            flashEffect === 'doubtful' ? 'flash-overlay-orange' : ''
          }`} />
        )}

        {/* Header */}
        <div className={`bg-gradient-to-r ${
          flashEffect === 'halal' ? 'from-green-500 to-green-600' :
          flashEffect === 'haram' ? 'from-red-500 to-red-600' :
          flashEffect === 'doubtful' ? 'from-orange-500 to-orange-600' :
          'from-emerald-600 to-teal-600'
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
                      <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                        {result.aiAnalysis}
                      </p>
                    </div>
                  )}

                  {/* Ingredients List (Collapsible) */}
                  {result.product?.ingredients && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setShowIngredients(!showIngredients)}
                        className={`w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {showIngredients ? txt.hideIngredients : txt.showIngredients}
                        </span>
                        {showIngredients ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      {showIngredients && (
                        <div className={`p-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                          {result.product.ingredients}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Product Not Found */
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {txt.notFound}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {txt.notFoundDesc}
                  </p>
                </div>
              )}

              {/* Scan Another Button */}
              <button
                onClick={resetScanner}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                {txt.scanAnother}
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
                      <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/3]">
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          playsInline
                          muted
                        />
                        {/* Scan overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-64 h-32 border-2 border-emerald-500 rounded-lg relative">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500 rounded-tl" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500 rounded-tr" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500 rounded-bl" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500 rounded-br" />
                            {/* Scanning line animation */}
                            <div className="absolute inset-x-0 h-0.5 bg-emerald-500 animate-scan" />
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-3">
                        {isScanning ? txt.scanning : txt.pointCamera}
                      </p>
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

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className={`text-red-600 dark:text-red-400 text-sm ${isRTL ? 'text-right' : ''}`}>
                    {error}
                  </p>
                </div>
              )}

              {/* Loading State */}
              {isAnalyzing && mode === 'camera' && (
                <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">{txt.analyzing}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ✅ Styles pour les animations de flash */}
      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 2px); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        
        /* Flash overlay animations */
        @keyframes flashPulse {
          0%, 100% { opacity: 0; }
          25%, 75% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        
        .flash-overlay {
          animation: flashPulse 0.5s ease-in-out 3;
        }
        
        .flash-overlay-green {
          background: radial-gradient(circle, rgba(34, 197, 94, 0.6) 0%, rgba(34, 197, 94, 0) 70%);
          box-shadow: inset 0 0 100px rgba(34, 197, 94, 0.5);
        }
        
        .flash-overlay-red {
          background: radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, rgba(239, 68, 68, 0) 70%);
          box-shadow: inset 0 0 100px rgba(239, 68, 68, 0.5);
        }
        
        .flash-overlay-orange {
          background: radial-gradient(circle, rgba(249, 115, 22, 0.6) 0%, rgba(249, 115, 22, 0) 70%);
          box-shadow: inset 0 0 100px rgba(249, 115, 22, 0.5);
        }
        
        /* Border flash */
        @keyframes borderFlashGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          50% { box-shadow: 0 0 30px 10px rgba(34, 197, 94, 0.6); }
        }
        
        @keyframes borderFlashRed {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          50% { box-shadow: 0 0 30px 10px rgba(239, 68, 68, 0.6); }
        }
        
        @keyframes borderFlashOrange {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
          50% { box-shadow: 0 0 30px 10px rgba(249, 115, 22, 0.6); }
        }
        
        .flash-green {
          animation: borderFlashGreen 0.5s ease-in-out 3;
        }
        
        .flash-red {
          animation: borderFlashRed 0.5s ease-in-out 3;
        }
        
        .flash-orange {
          animation: borderFlashOrange 0.5s ease-in-out 3;
        }
        
        .animate-pulse-once {
          animation: pulse 0.5s ease-in-out 2;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
