import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';

const CACHE_KEY = 'public_settings_cache';
const CACHE_TTL_MS = 10 * 1000; // 10 seconds TTL so system status changes reflect quickly

let activePromise = null;

/**
 * Clears the cached public settings.
 */
export const clearPublicSettingsCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {}
};

/**
 * Gets public settings with local caching.
 *
 * @param {boolean} forceRefresh - If true, ignores cache and requests a new fetch.
 * @returns {Promise<Object>} The public settings data.
 */
export const getPublicSettings = async (forceRefresh = false) => {
  const cached = localStorage.getItem(CACHE_KEY);
  const now = Date.now();
  if (cached && !forceRefresh) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.timestamp && (now - parsed.timestamp < CACHE_TTL_MS) && parsed.data) {
        return parsed.data;
      }
    } catch (e) {
      console.warn('Failed to parse cached public settings:', e);
    }
  }

  // If a parallel request is already running, reuse its promise to avoid duplicate network calls
  if (activePromise) {
    return activePromise;
  }

  activePromise = (async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/settings/public?_t=${Date.now()}`);
      const data = response.data || {};
      const cacheObj = {
        timestamp: Date.now(),
        data
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
      return data;
    } catch (error) {
      console.error('Failed to fetch public settings from API:', error);
      // Fallback to expired cache if available, otherwise return empty object
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.data) return parsed.data;
        } catch {}
      }
      return {};
    } finally {
      activePromise = null;
    }
  })();

  return activePromise;
};
