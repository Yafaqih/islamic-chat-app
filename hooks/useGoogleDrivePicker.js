import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour utiliser Google Drive Picker
 * 
 * Usage:
 * const { openPicker, isLoading, error } = useGoogleDrivePicker({
 *   onSelect: (files) => console.log(files)
 * });
 */

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_APP_ID = process.env.NEXT_PUBLIC_GOOGLE_APP_ID;

// Scopes nécessaires
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file'
].join(' ');

export default function useGoogleDrivePicker({ onSelect, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [isGisLoaded, setIsGisLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Charger les scripts Google
  useEffect(() => {
    // Charger GAPI (Google API)
    const loadGapi = () => {
      if (window.gapi) {
        window.gapi.load('picker', () => {
          setIsGapiLoaded(true);
        });
      } else {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          window.gapi.load('picker', () => {
            setIsGapiLoaded(true);
          });
        };
        document.body.appendChild(script);
      }
    };

    // Charger GIS (Google Identity Services)
    const loadGis = () => {
      if (window.google?.accounts) {
        initTokenClient();
        setIsGisLoaded(true);
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initTokenClient();
          setIsGisLoaded(true);
        };
        document.body.appendChild(script);
      }
    };

    loadGapi();
    loadGis();
  }, []);

  // Initialiser le client de token
  const initTokenClient = useCallback(() => {
    if (!window.google?.accounts?.oauth2) return;

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
          createPicker(response.access_token);
        }
      },
      error_callback: (error) => {
        console.error('OAuth error:', error);
        setIsLoading(false);
        if (onError) onError(error);
      }
    });

    setTokenClient(client);
  }, []);

  // Créer et afficher le Picker
  const createPicker = useCallback((token) => {
    if (!window.google?.picker) {
      console.error('Google Picker not loaded');
      setIsLoading(false);
      return;
    }

    try {
      // Vue pour tous les fichiers Drive
      const docsView = new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false);

      // Vue pour les images
      const imageView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES)
        .setIncludeFolders(false);

      // Vue pour les PDFs
      const pdfView = new window.google.picker.DocsView()
        .setIncludeFolders(false)
        .setMimeTypes('application/pdf');

      // Vue pour les documents
      const documentsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCUMENTS)
        .setIncludeFolders(false);

      // Vue upload
      const uploadView = new window.google.picker.DocsUploadView()
        .setIncludeFolders(false);

      const picker = new window.google.picker.PickerBuilder()
        .setAppId(GOOGLE_APP_ID)
        .setOAuthToken(token)
        .setDeveloperKey(GOOGLE_API_KEY)
        .addView(docsView)
        .addView(imageView)
        .addView(documentsView)
        .addView(uploadView)
        .setCallback(pickerCallback)
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .setTitle('اختر ملفاً من Google Drive')
        .setLocale('ar')
        .build();

      picker.setVisible(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating picker:', error);
      setIsLoading(false);
      if (onError) onError(error);
    }
  }, [onSelect, onError]);

  // Callback du Picker
  const pickerCallback = useCallback((data) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const files = data.docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        mimeType: doc.mimeType,
        url: doc.url,
        iconUrl: doc.iconUrl,
        size: doc.sizeBytes,
        lastModified: doc.lastEditedUtc,
        // Pour télécharger le fichier
        downloadUrl: `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
        // Pour prévisualiser
        embedUrl: doc.embedUrl,
        // Thumbnail
        thumbnailUrl: doc.thumbnails?.[0]?.url
      }));

      if (onSelect) {
        onSelect(files, accessToken);
      }
    } else if (data.action === window.google.picker.Action.CANCEL) {
      setIsLoading(false);
    }
  }, [onSelect, accessToken]);

  // Ouvrir le picker
  const openPicker = useCallback(() => {
    if (!GOOGLE_API_KEY || !GOOGLE_CLIENT_ID) {
      console.error('Google API credentials not configured');
      if (onError) onError(new Error('Google Drive non configuré'));
      return;
    }

    setIsLoading(true);

    // Si on a déjà un token valide, ouvrir directement le picker
    if (accessToken) {
      createPicker(accessToken);
    } else if (tokenClient) {
      // Sinon, demander l'autorisation
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      console.error('Token client not initialized');
      setIsLoading(false);
      if (onError) onError(new Error('Initialisation en cours, réessayez'));
    }
  }, [accessToken, tokenClient, createPicker, onError]);

  return {
    openPicker,
    isLoading,
    isReady: isGapiLoaded && isGisLoaded,
    hasCredentials: !!(GOOGLE_API_KEY && GOOGLE_CLIENT_ID)
  };
}
