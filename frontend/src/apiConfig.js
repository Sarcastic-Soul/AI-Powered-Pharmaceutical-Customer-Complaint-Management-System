// Central API Base URL Configuration
// Points to backend deployment URL on Vercel, or local dev proxy if on localhost

const PRODUCTION_BACKEND_URL = "https://ai-powered-pharmaceutical-customer-one.vercel.app";

export const getApiUrl = (endpoint) => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const baseUrl = envUrl.replace(/\/$/, '');
    return endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
  }

  // If deployed in browser on non-localhost domain (Vercel production)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${PRODUCTION_BACKEND_URL}${cleanEndpoint}`;
  }

  // Local development fallback (Vite proxy)
  return endpoint;
};
