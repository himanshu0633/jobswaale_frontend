import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';

const CACHE_KEY = 'public_settings_cache';

let activePromise = null;

/**
 * Gets public settings with local caching.
 * Expiry is set on a daily calendar date basis (expires when calendar date changes).
 *
 * @param {boolean} forceRefresh - If true, ignores cache and requests a new fetch.
 * @returns {Promise<Object>} The public settings data.
 */
export const getPublicSettings = async (forceRefresh = false) => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached && !forceRefresh) {
    try {
      const parsed = JSON.parse(cached);
      const todayStr = new Date().toDateString(); // e.g. "Tue Jul 14 2026"
      if (parsed.expiryDate === todayStr && parsed.data) {
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
      const response = await axios.get(`${BASE_API_URL}/settings/public`);
      const data = response.data || {};
      const cacheObj = {
        expiryDate: new Date().toDateString(),
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
