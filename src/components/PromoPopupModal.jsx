import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ArrowRight, Eye } from 'lucide-react';
import { getPublicSettings } from '../utils/publicSettings';
import { BASE_API_URL } from '../context/AuthContext';

export const resolvePromoImageUrl = (url) => {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/uploads/')) {
    const backendBase = (BASE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/+$/, '');
    return `${backendBase}${trimmed}`;
  }
  return trimmed;
};

// Clear all promo banner dismissal keys from sessionStorage (called on login/logout)
export const clearPromoBannerDismissals = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('promo_banner_dismissed_') || key.startsWith('promo_dismissed_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch (err) {
    console.error('Error clearing promo banner dismissals:', err);
  }
};

// Generates an auth signature to detect when login or logout occurs
const getAuthSessionSignature = () => {
  const publicUser = localStorage.getItem('publicUser');
  const publicToken = localStorage.getItem('publicToken');
  const adminUser = localStorage.getItem('user');
  const adminToken = localStorage.getItem('token');

  if (publicUser && publicToken) {
    try {
      const u = JSON.parse(publicUser);
      const role = (u.accountType || u.role || u.roleName || 'user').toLowerCase().trim();
      const uid = u._id || u.id || u.email || 'user';
      return `logged_in_${role}_${uid}`;
    } catch {
      return 'logged_in_public';
    }
  }

  if (adminUser && adminToken) {
    try {
      const u = JSON.parse(adminUser);
      return `logged_in_admin_${u._id || u.id || 'admin'}`;
    } catch {
      return 'logged_in_admin';
    }
  }

  return 'logged_out_guest';
};

export const PromoPopupModal = ({ 
  forcePreview = false, 
  previewBanner = null, 
  previewSettings = null, 
  onClosePreview 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeBanner, setActiveBanner] = useState(previewBanner || null);
  const [isOpen, setIsOpen] = useState(forcePreview);

  // Handle preview mode or evaluate banner based on current route
  useEffect(() => {
    if (forcePreview) {
      const banner = previewBanner || (previewSettings?.popupBanners?.[0] || previewSettings);
      if (banner) {
        setActiveBanner(banner);
        setIsOpen(true);
      }
      return;
    }

    const checkAndShowPopup = async () => {
      try {
        // Detect login or logout event by comparing auth signature
        const currentAuthSig = getAuthSessionSignature();
        const prevAuthSig = sessionStorage.getItem('last_promo_auth_sig');

        if (prevAuthSig !== null && prevAuthSig !== currentAuthSig) {
          // Auth changed (login, logout, or account switch) -> reset all banner dismissals
          clearPromoBannerDismissals();
        }
        sessionStorage.setItem('last_promo_auth_sig', currentAuthSig);

        const data = await getPublicSettings();
        if (!data) return;

        // Determine current user type
        const storedUserStr = localStorage.getItem('publicUser') || localStorage.getItem('user');
        let currentUserType = 'public';
        if (storedUserStr) {
          try {
            const u = JSON.parse(storedUserStr);
            const role = (u.accountType || u.role || u.roleName || '').toLowerCase().trim();
            if (role === 'employer') currentUserType = 'employer';
            else if (role === 'jobseeker') currentUserType = 'jobseeker';
          } catch {}
        }

        const currentPath = location.pathname.toLowerCase().replace(/\/+$/, '') || '/';

        // Get banners list (with legacy single banner fallback)
        let banners = Array.isArray(data.popupBanners) && data.popupBanners.length > 0
          ? data.popupBanners
          : [];

        if (banners.length === 0 && data.showPromoPopup && data.promoPopupImage) {
          banners = [{
            id: 'banner_legacy',
            enabled: true,
            targetType: 'employer',
            pages: ['/employer'],
            image: data.promoPopupImage,
            width: data.promoPopupWidth || '850px',
            height: data.promoPopupHeight || 'auto',
            buttonEnabled: data.promoPopupButtonEnabled !== false,
            buttonText: data.promoPopupButtonText || 'Upgrade Plan',
            buttonLink: data.promoPopupButtonLink || '/employer/subscription'
          }];
        }

        // Find first active, undismissed banner matching targetType and page
        let matchedKeyForBanner = null;

        const bannerToShow = banners.find((b) => {
          if (b.enabled === false) return false;
          if (!b.image) return false;

          // Target audience matching (jobseeker, employer, public)
          const target = (b.targetType || '').toLowerCase().trim();
          if (target === 'jobseeker' && currentUserType !== 'jobseeker') return false;
          if (target === 'employer' && currentUserType !== 'employer') return false;
          if (target === 'public' && currentUserType !== 'public') return false;

          // Pages matching
          const pages = Array.isArray(b.pages) ? b.pages.map(p => String(p).toLowerCase().trim()) : [];
          if (pages.length === 0) return false;

          let matchedPage = null;

          const matchesPage = pages.some((p) => {
            const cleanP = p.replace(/\/+$/, '') || '/';
            if (cleanP === currentPath) {
              matchedPage = cleanP;
              return true;
            }
            if (cleanP !== '/' && currentPath.startsWith(cleanP)) {
              matchedPage = cleanP;
              return true;
            }
            // Legacy fallbacks
            if (cleanP === 'employer_login' && currentPath.startsWith('/employer')) {
              matchedPage = '/employer';
              return true;
            }
            if (cleanP === 'jobseeker_login' && currentPath.startsWith('/jobseeker')) {
              matchedPage = '/jobseeker';
              return true;
            }
            if (cleanP === 'home' && currentPath === '/') {
              matchedPage = '/';
              return true;
            }
            if (cleanP === 'about_us' && (currentPath === '/about' || currentPath.startsWith('/about'))) {
              matchedPage = '/about';
              return true;
            }
            return false;
          });

          if (!matchesPage || !matchedPage) return false;

          // Check if this banner was already dismissed on this specific page during this session
          const sanitizedPage = matchedPage.replace(/[^a-zA-Z0-9_-]/g, '_');
          const pageDismissKey = `promo_banner_dismissed_${b.id || 'banner'}_${sanitizedPage}`;
          const currentPathDismissKey = `promo_banner_dismissed_${b.id || 'banner'}_${currentPath.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

          const isDismissed = sessionStorage.getItem(pageDismissKey) === 'true' || 
                              sessionStorage.getItem(currentPathDismissKey) === 'true';

          if (!isDismissed) {
            matchedKeyForBanner = matchedPage;
            return true;
          }

          return false;
        });

        if (!bannerToShow) {
          setIsOpen(false);
          return;
        }

        setActiveBanner({ ...bannerToShow, matchedPageKey: matchedKeyForBanner || currentPath });

        // Smooth visual entry after route transition
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 450);
        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Failed to evaluate promo banner:', err);
      }
    };

    checkAndShowPopup();
  }, [location.pathname, forcePreview, previewBanner, previewSettings]);

  const handleClose = () => {
    setIsOpen(false);
    if (forcePreview && onClosePreview) {
      onClosePreview();
      return;
    }
    if (activeBanner?.id) {
      const pageKey = (activeBanner.matchedPageKey || location.pathname).toLowerCase().replace(/\/+$/, '') || '/';
      const sanitizedKey = pageKey.replace(/[^a-zA-Z0-9_-]/g, '_');
      sessionStorage.setItem(`promo_banner_dismissed_${activeBanner.id}_${sanitizedKey}`, 'true');

      // Also record exact current path as safeguard
      const currentPathKey = (location.pathname.toLowerCase().replace(/\/+$/, '') || '/').replace(/[^a-zA-Z0-9_-]/g, '_');
      sessionStorage.setItem(`promo_banner_dismissed_${activeBanner.id}_${currentPathKey}`, 'true');
    }
  };

  const handleActionClick = () => {
    handleClose();
    const link = activeBanner?.buttonLink || '/employer/subscription';
    if (/^https?:\/\//i.test(link)) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      navigate(link);
    }
  };

  if (!isOpen || !activeBanner?.image) return null;

  // Sizing styles
  const rawWidth = String(activeBanner.width || '850px').trim();
  const modalWidth = rawWidth.includes('px') || rawWidth.includes('%') || rawWidth.includes('rem') 
    ? rawWidth 
    : `${rawWidth}px`;

  const rawHeight = String(activeBanner.height || 'auto').trim();
  const modalMaxHeight = rawHeight === 'auto' ? '85vh' : (rawHeight.includes('px') ? rawHeight : `${rawHeight}px`);

  const buttonText = activeBanner.buttonText || 'Upgrade Plan';
  const showButton = activeBanner.buttonEnabled !== false && Boolean(buttonText.trim());

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/65 backdrop-blur-[2px] p-3 sm:p-5 animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-w-[calc(100vw-24px)] sm:max-w-[calc(100vw-48px)] animate-in zoom-in-95 duration-200"
        style={{ width: modalWidth }}
      >
        {/* Close Button (Cut Button) */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-2.5 right-2.5 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 hover:bg-slate-900 text-white shadow-lg transition-transform hover:scale-110 cursor-pointer backdrop-blur-sm"
          title="Close / Cut"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Live Preview Indicator for Admin */}
        {forcePreview && (
          <div className="absolute top-2.5 left-3 z-30 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-bold backdrop-blur-sm shadow border border-white/20 select-none">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Full Size Preview ({modalWidth} × {rawHeight === 'auto' ? 'Auto' : modalMaxHeight})</span>
          </div>
        )}

        {/* Modal Image Display - Full image shown with clean padding and no cutting off */}
        <div 
          className="w-full bg-white flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          style={{ maxHeight: rawHeight === 'auto' ? (showButton ? 'calc(80vh - 75px)' : '82vh') : modalMaxHeight }}
        >
          <img
            src={resolvePromoImageUrl(activeBanner.image)}
            alt={activeBanner.title || 'Announcement'}
            className="w-auto h-auto max-w-full max-h-full object-contain block select-none rounded-xl shadow-xs"
            style={{ 
              maxHeight: rawHeight === 'auto' ? (showButton ? 'calc(80vh - 95px)' : 'calc(82vh - 35px)') : modalMaxHeight,
              imageRendering: '-webkit-optimize-contrast'
            }}
            loading="eager"
          />
        </div>

        {/* Action Button Section */}
        {showButton && (
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center justify-end">
            <button
              type="button"
              onClick={handleActionClick}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#46c9f2] hover:bg-[#33b8e1] px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-cyan-500/20 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer shrink-0"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoPopupModal;
