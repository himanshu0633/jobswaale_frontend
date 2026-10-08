import { BASE_API_URL } from '../context/AuthContext';

/**
 * Resolves a CMS image path or URL to an absolute browser-loadable URL.
 */
export const resolveCmsImageUrl = (pathOrUrl) => {
  if (!pathOrUrl) return '';
  const trimmed = String(pathOrUrl).trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const backendBase = (BASE_API_URL || '').replace(/\/api\/?$/, '');
  return `${backendBase}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

export const formatCmsHtml = (html) => {
  if (!html) return '';
  const backendBase = (BASE_API_URL || '').replace(/\/api\/?$/, '');
  return html.replace(/src=(["'])\/uploads\//g, `src=$1${backendBase}/uploads/`);
};

export const BANNER_POSITIONS = [
  { value: 'top-center', label: 'Top Center (Header Banner)', slot: 'top', align: 'center' },
  { value: 'top-left', label: 'Top Left', slot: 'top', align: 'left' },
  { value: 'top-right', label: 'Top Right', slot: 'top', align: 'right' },
  { value: 'center-left', label: 'Center Left', slot: 'center', align: 'left' },
  { value: 'center', label: 'Center (Middle Banner)', slot: 'center', align: 'center' },
  { value: 'center-right', label: 'Center Right', slot: 'center', align: 'right' },
  { value: 'bottom-left', label: 'Bottom Left Corner', slot: 'bottom', align: 'left' },
  { value: 'bottom-center', label: 'Bottom Center', slot: 'bottom', align: 'center' },
  { value: 'bottom-right', label: 'Bottom Right Corner', slot: 'bottom', align: 'right' }
];

export const getPageBanners = (pageData) => {
  if (!pageData) return [];
  if (Array.isArray(pageData.banners) && pageData.banners.length > 0) {
    return pageData.banners
      .filter(b => b && (b.url || typeof b === 'string'))
      .map(b => {
        const raw = typeof b === 'string' ? b : b.url;
        return {
          rawUrl: raw,
          url: resolveCmsImageUrl(raw),
          position: (typeof b === 'object' && b.position) || 'top-center',
          title: (typeof b === 'object' && b.title) || '',
          alt: (typeof b === 'object' && b.alt) || ''
        };
      })
      .filter(b => b.rawUrl && b.rawUrl.trim().length > 0);
  }
  const fallback = pageData.bannerImage || pageData.featuredImage;
  if (fallback && String(fallback).trim()) {
    return [{
      rawUrl: fallback,
      url: resolveCmsImageUrl(fallback),
      position: 'top-center',
      title: '',
      alt: ''
    }];
  }
  return [];
};

export const filterBannersBySlot = (banners = [], slot = 'top') => {
  return banners.filter(b => {
    const pos = b.position || 'top-center';
    if (slot === 'top') return pos.startsWith('top-');
    if (slot === 'center') return pos.startsWith('center') || pos === 'center';
    if (slot === 'bottom') return pos.startsWith('bottom-');
    return false;
  });
};
