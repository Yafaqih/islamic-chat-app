import React, { useState, useEffect, useRef } from 'react';
import { X, Navigation, MapPin, Phone, Clock, ExternalLink, Loader2, RefreshCw, Locate } from 'lucide-react';

/**
 * MosqueMap - Carte des mosquées les plus proches
 * Utilise Leaflet + OpenStreetMap + Overpass API (tout gratuit)
 */
export default function MosqueMap({ isOpen, onClose, language = 'ar' }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Traductions
  const t = {
    ar: {
      title: 'المساجد القريبة',
      loading: 'جاري البحث عن المساجد...',
      locating: 'جاري تحديد موقعك...',
      error: 'حدث خطأ',
      noMosques: 'لم يتم العثور على مساجد قريبة',
      locationDenied: 'يرجى السماح بالوصول إلى موقعك',
      distance: 'المسافة',
      directions: 'الاتجاهات',
      call: 'اتصال',
      refresh: 'تحديث',
      myLocation: 'موقعي',
      km: 'كم',
      m: 'م',
      mosque: 'مسجد',
      unknown: 'مسجد',
      openInMaps: 'فتح في الخرائط',
      retry: 'إعادة المحاولة',
      searchRadius: 'نطاق البحث: 5 كم'
    },
    fr: {
      title: 'Mosquées à proximité',
      loading: 'Recherche des mosquées...',
      locating: 'Localisation en cours...',
      error: 'Une erreur est survenue',
      noMosques: 'Aucune mosquée trouvée à proximité',
      locationDenied: 'Veuillez autoriser l\'accès à votre position',
      distance: 'Distance',
      directions: 'Itinéraire',
      call: 'Appeler',
      refresh: 'Actualiser',
      myLocation: 'Ma position',
      km: 'km',
      m: 'm',
      mosque: 'Mosquée',
      unknown: 'Mosquée',
      openInMaps: 'Ouvrir dans Maps',
      retry: 'Réessayer',
      searchRadius: 'Rayon de recherche: 5 km'
    },
    en: {
      title: 'Nearby Mosques',
      loading: 'Searching for mosques...',
      locating: 'Getting your location...',
      error: 'An error occurred',
      noMosques: 'No mosques found nearby',
      locationDenied: 'Please allow access to your location',
      distance: 'Distance',
      directions: 'Directions',
      call: 'Call',
      refresh: 'Refresh',
      myLocation: 'My location',
      km: 'km',
      m: 'm',
      mosque: 'Mosque',
      unknown: 'Mosque',
      openInMaps: 'Open in Maps',
      retry: 'Retry',
      searchRadius: 'Search radius: 5 km'
    }
  }[language] || t.ar;

  const isRTL = language === 'ar';

  // Charger Leaflet dynamiquement
  useEffect(() => {
    if (!isOpen) return;

    const loadLeaflet = async () => {
      // Charger CSS Leaflet
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Charger JS Leaflet
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);
      } else {
        setMapLoaded(true);
      }
    };

    loadLeaflet();
  }, [isOpen]);

  // Obtenir la position de l'utilisateur
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(t.locationDenied);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(loc);
        fetchMosques(loc.lat, loc.lng);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(t.locationDenied);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isOpen]);

  // Rechercher les mosquées via Overpass API
  const fetchMosques = async (lat, lng) => {
    setLoading(true);
    setError(null);

    try {
      // Requête Overpass pour trouver les mosquées dans un rayon de 5km
      const radius = 5000; // 5km
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
          node["building"="mosque"](around:${radius},${lat},${lng});
          way["building"="mosque"](around:${radius},${lat},${lng});
        );
        out body center;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      
      // Traiter les résultats
      const mosquesData = data.elements.map((el, index) => {
        const elLat = el.lat || el.center?.lat;
        const elLng = el.lon || el.center?.lon;
        const distance = calculateDistance(lat, lng, elLat, elLng);
        
        return {
          id: el.id || index,
          name: el.tags?.name || el.tags?.['name:ar'] || el.tags?.['name:fr'] || el.tags?.['name:en'] || t.unknown,
          lat: elLat,
          lng: elLng,
          distance: distance,
          address: el.tags?.['addr:street'] || el.tags?.['addr:full'] || '',
          phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
          website: el.tags?.website || el.tags?.['contact:website'] || '',
          openingHours: el.tags?.opening_hours || ''
        };
      }).filter(m => m.lat && m.lng);

      // Trier par distance
      mosquesData.sort((a, b) => a.distance - b.distance);
      
      setMosques(mosquesData.slice(0, 20)); // Max 20 mosquées
      setLoading(false);

    } catch (err) {
      console.error('Error fetching mosques:', err);
      setError(t.error);
      setLoading(false);
    }
  };

  // Calculer la distance entre deux points (Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Formater la distance
  const formatDistance = (km) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} ${t.m}`;
    }
    return `${km.toFixed(1)} ${t.km}`;
  };

  // Initialiser la carte
  useEffect(() => {
    if (!mapLoaded || !userLocation || !mapRef.current || !window.L) return;

    // Détruire la carte existante si elle existe
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Créer la carte
    const map = window.L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 14);

    // Ajouter les tuiles OpenStreetMap
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Icône personnalisée pour l'utilisateur
    const userIcon = window.L.divIcon({
      html: `<div style="background: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      className: 'user-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Marqueur utilisateur
    window.L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup(t.myLocation);

    // Icône personnalisée pour les mosquées
    const mosqueIcon = window.L.divIcon({
      html: `<div style="background: #10B981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🕌</div>`,
      className: 'mosque-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Ajouter les marqueurs des mosquées
    markersRef.current = [];
    mosques.forEach((mosque) => {
      const marker = window.L.marker([mosque.lat, mosque.lng], { icon: mosqueIcon })
        .addTo(map)
        .bindPopup(`
          <div style="direction: ${isRTL ? 'rtl' : 'ltr'}; min-width: 150px;">
            <strong>${mosque.name}</strong><br/>
            <span style="color: #666;">${formatDistance(mosque.distance)}</span>
            ${mosque.address ? `<br/><small>${mosque.address}</small>` : ''}
          </div>
        `);
      
      marker.on('click', () => setSelectedMosque(mosque));
      markersRef.current.push(marker);
    });

    // Ajuster la vue pour voir tous les marqueurs
    if (mosques.length > 0) {
      const bounds = window.L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        ...mosques.map(m => [m.lat, m.lng])
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, userLocation, mosques]);

  // Ouvrir Google Maps pour les directions
  const openDirections = (mosque) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}&travelmode=walking`;
    window.open(url, '_blank');
  };

  // Centrer sur une mosquée
  const centerOnMosque = (mosque) => {
    setSelectedMosque(mosque);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([mosque.lat, mosque.lng], 16);
      // Ouvrir le popup du marqueur
      markersRef.current.forEach(marker => {
        const latLng = marker.getLatLng();
        if (Math.abs(latLng.lat - mosque.lat) < 0.0001 && Math.abs(latLng.lng - mosque.lng) < 0.0001) {
          marker.openPopup();
        }
      });
    }
  };

  // Recentrer sur l'utilisateur
  const centerOnUser = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14);
    }
  };

  // Rafraîchir les données
  const refresh = () => {
    if (userLocation) {
      fetchMosques(userLocation.lat, userLocation.lng);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-500 to-teal-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🕌</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t.title}</h2>
              <p className="text-xs text-white/80">{t.searchRadius}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
              title={t.refresh}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={centerOnUser}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
              title={t.myLocation}
            >
              <Locate className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Carte */}
          <div className="flex-1 relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-300">{userLocation ? t.loading : t.locating}</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center z-10">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  >
                    {t.retry}
                  </button>
                </div>
              </div>
            )}

            <div ref={mapRef} className="w-full h-full min-h-[300px]" />
          </div>

          {/* Liste des mosquées */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[40vh] md:max-h-none">
            {mosques.length === 0 && !loading && !error ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <MapPin className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>{t.noMosques}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {mosques.map((mosque, index) => (
                  <div
                    key={mosque.id}
                    onClick={() => centerOnMosque(mosque)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      selectedMosque?.id === mosque.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{mosque.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatDistance(mosque.distance)}
                          </span>
                        </div>
                        {mosque.address && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{mosque.address}</p>
                        )}
                        
                        {/* Actions */}
                        <div className={`flex items-center gap-2 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDirections(mosque);
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>{t.directions}</span>
                          </button>
                          {mosque.phone && (
                            <a
                              href={`tel:${mosque.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{t.call}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer avec mosquée sélectionnée */}
        {selectedMosque && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🕌</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{selectedMosque.name}</h3>
                  <p className="text-sm text-gray-500">{formatDistance(selectedMosque.distance)}</p>
                </div>
              </div>
              <button
                onClick={() => openDirections(selectedMosque)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>{t.directions}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
