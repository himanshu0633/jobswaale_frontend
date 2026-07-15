import axios from 'axios';

const CACHE_PREFIX = 'api_cache_';
const activePromises = {};

/**
 * Perform a cached GET request.
 * Expiry is set on a daily calendar date basis (expires when calendar date changes).
 *
 * @param {string} url - The full API URL to fetch.
 * @param {boolean} forceRefresh - If true, ignores cache and requests a new fetch.
 * @returns {Promise<any>} The response data.
 */
export const getWithCache = async (url, forceRefresh = false) => {
  const cacheKey = `${CACHE_PREFIX}${url}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached && !forceRefresh) {
    try {
      const parsed = JSON.parse(cached);
      const todayStr = new Date().toDateString(); // e.g. "Tue Jul 14 2026"
      if (parsed.expiryDate === todayStr && parsed.data !== undefined) {
        return parsed.data;
      }
    } catch (e) {
      console.warn(`Failed to parse cached API response for ${url}:`, e);
    }
  }

  // If a parallel request is already running for this exact URL, reuse its promise
  if (activePromises[url]) {
    return activePromises[url];
  }

  activePromises[url] = (async () => {
    try {
      const response = await axios.get(url);
      const data = response.data;
      const cacheObj = {
        expiryDate: new Date().toDateString(),
        data
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheObj));
      return data;
    } catch (error) {
      console.error(`Failed to fetch from API: ${url}`, error);
      // Fallback: If cache exists even if expired, return it as safety fallback
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.data !== undefined) return parsed.data;
        } catch {}
      }
      throw error;
    } finally {
      delete activePromises[url];
    }
  })();

  return activePromises[url];
};

/**
 * Clears all API caches.
 */
export const clearApiCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};
