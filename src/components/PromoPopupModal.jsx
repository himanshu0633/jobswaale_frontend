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

export const PromoPopupModal = ({ forcePreview = false, previewSettings = null, onClosePreview }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState(previewSettings || null);
  const [isOpen, setIsOpen] = useState(forcePreview);

  // Load settings when not in preview mode
  useEffect(() => {
    if (forcePreview && previewSettings) {
      setSettings(previewSettings);
      setIsOpen(true);
      return;
    }

    const checkAndShowPopup = async () => {
      try {
        const data = await getPublicSettings();
        if (!data) return;
        setSettings(data);

        // If popup is turned off or no image configured, do not show
        if (!data.showPromoPopup || !data.promoPopupImage) {
          setIsOpen(false);
          return;
        }

        // Check if user already dismissed in this session
        const isDismissed = sessionStorage.getItem('promo_popup_dismissed') === 'true';
        if (isDismissed) {
          setIsOpen(false);
          return;
        }

        // Check target audience
        const storedUserStr = localStorage.getItem('publicUser') || localStorage.getItem('user');
        const token = localStorage.getItem('publicToken') || localStorage.getItem('token');
        let userRole = 'visitor';
        if (storedUserStr) {
          try {
            const u = JSON.parse(storedUserStr);
            userRole = (u.accountType || u.role || 'jobseeker').toLowerCase();
          } catch {}
        }

        const target = (data.promoPopupTarget || 'all').toLowerCase();
        if (target === 'employer' && userRole !== 'employer') return;
        if (target === 'jobseeker' && userRole !== 'jobseeker') return;

        // Check if user is on a dashboard / home page
        const path = location.pathname.toLowerCase();
        const isDashboardOrHome = 
          path === '/' || 
          path === '/home' || 
          path.startsWith('/employer') || 
          path.startsWith('/jobseeker');

        if (!isDashboardOrHome) return;

        // Check if user is logged in or just authenticated
        const justAuth = 
          sessionStorage.getItem('just_authenticated') === 'true' ||
          localStorage.getItem('show_promo_popup_pending') === 'true';

        // Trigger if authenticated or just logged in/registered, or on dashboard with active session
        const hasSession = Boolean(token || storedUserStr);
        if (justAuth || hasSession) {
          // Slight delay for smooth visual transition
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 450);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error('Failed to evaluate promo popup:', err);
      }
    };

    checkAndShowPopup();
  }, [location.pathname, forcePreview, previewSettings]);

  const handleClose = () => {
    setIsOpen(false);
    if (forcePreview && onClosePreview) {
      onClosePreview();
      return;
    }
    sessionStorage.setItem('promo_popup_dismissed', 'true');
    localStorage.removeItem('show_promo_popup_pending');
  };

  const handleActionClick = () => {
    handleClose();
    const link = settings?.promoPopupButtonLink || '/employer/subscription';
    if (/^https?:\/\//i.test(link)) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      navigate(link);
    }
  };

  if (!isOpen || !settings?.promoPopupImage) return null;

  // Sizing styles
  const rawWidth = String(settings.promoPopupWidth || '550px').trim();
  const modalWidth = rawWidth.includes('px') || rawWidth.includes('%') || rawWidth.includes('rem') 
    ? rawWidth 
    : `${rawWidth}px`;

  const rawHeight = String(settings.promoPopupHeight || 'auto').trim();
  const modalMaxHeight = rawHeight === 'auto' ? '85vh' : (rawHeight.includes('px') ? rawHeight : `${rawHeight}px`);

  const buttonText = settings.promoPopupButtonText || 'Upgrade Plan';
  const showButton = settings.promoPopupButtonEnabled !== false && Boolean(buttonText.trim());

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
        {/* Cut / Close Button (X) */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/60 hover:bg-slate-900 text-white shadow-md transition-transform hover:scale-110 cursor-pointer backdrop-blur-sm"
          title="Close Popup"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Modal Image Display */}
        <div 
          className="w-full overflow-hidden bg-slate-900 flex items-center justify-center"
          style={{ maxHeight: modalMaxHeight }}
        >
          <img
            src={resolvePromoImageUrl(settings.promoPopupImage)}
            alt="Promotion / Announcement"
            className="w-full h-auto max-h-full object-contain block select-none"
            loading="eager"
          />
        </div>

        {/* Action Button Section (Upgrade Plan / Custom Path) */}
        {showButton && (
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-400 truncate">
              Special Announcement
            </span>
            <button
              type="button"
              onClick={handleActionClick}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#46c9f2] hover:bg-[#33b8e1] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-cyan-500/20 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer shrink-0"
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
