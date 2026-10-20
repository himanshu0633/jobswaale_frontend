import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ArrowRight, ExternalLink } from 'lucide-react';
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
        const data = await getPublicSettings();
        if (!data) return;

        // Current user type
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

          const matchesPage = pages.some((p) => {
            const cleanP = p.replace(/\/+$/, '') || '/';
            if (cleanP === currentPath) return true;
            if (cleanP !== '/' && currentPath.startsWith(cleanP)) return true;
            // Legacy fallbacks
            if (cleanP === 'employer_login' && currentPath.startsWith('/employer')) return true;
            if (cleanP === 'jobseeker_login' && currentPath.startsWith('/jobseeker')) return true;
            if (cleanP === 'home' && currentPath === '/') return true;
            if (cleanP === 'about_us' && (currentPath === '/about' || currentPath.startsWith('/about'))) return true;
            return false;
          });

          if (!matchesPage) return false;

          const isDismissed = sessionStorage.getItem(`promo_banner_dismissed_${b.id}`) === 'true';
          return !isDismissed;
        });

        if (!bannerToShow) {
          setIsOpen(false);
          return;
        }

        setActiveBanner(bannerToShow);

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
      sessionStorage.setItem(`promo_banner_dismissed_${activeBanner.id}`, 'true');
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
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-w-full animate-in zoom-in-95 duration-200"
        style={{ width: modalWidth }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/60 hover:bg-slate-900 text-white shadow-md transition-transform hover:scale-110 cursor-pointer backdrop-blur-sm"
          title="Close"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Modal Image Display */}
        <div 
          className="w-full overflow-hidden bg-white flex items-center justify-center"
          style={{ maxHeight: modalMaxHeight }}
        >
          <img
            src={resolvePromoImageUrl(activeBanner.image)}
            alt={activeBanner.title || 'Announcement'}
            className="w-full h-auto max-h-full object-contain block select-none"
            loading="eager"
          />
        </div>

        {/* Action Button Section (Without title label) */}
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
