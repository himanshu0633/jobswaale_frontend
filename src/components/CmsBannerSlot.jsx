import React from 'react';
import { filterBannersBySlot } from '../utils/cmsHelper';

/**
 * Renders banners configured for a specific slot ('top', 'center', 'bottom')
 * with alignment respecting: top-left, top-center, top-right,
 * center-left, center, center-right, bottom-left, bottom-center, bottom-right.
 */
export const CmsBannerSlot = ({ banners = [], slot = 'top', pageTitle = '' }) => {
  const slotBanners = filterBannersBySlot(banners, slot);
  if (!slotBanners || slotBanners.length === 0) return null;

  return (
    <div className={`cms-banners-slot cms-banners-${slot} space-y-6 my-6`}>
      {slotBanners.map((banner, index) => {
        const pos = banner.position || 'top-center';

        // Layout alignment classes based on position
        let alignClass = 'w-full';
        let containerClass = 'w-full';

        if (pos.endsWith('-left')) {
          alignClass = 'max-w-3xl mr-auto';
          containerClass = 'flex justify-start';
        } else if (pos.endsWith('-right')) {
          alignClass = 'max-w-3xl ml-auto';
          containerClass = 'flex justify-end';
        } else {
          // center
          alignClass = 'w-full';
          containerClass = 'flex justify-center';
        }

        // Corner styling for bottom corner positions
        const isCorner = pos === 'bottom-left' || pos === 'bottom-right';
        const cardWidth = isCorner ? 'max-w-md sm:max-w-lg' : alignClass;

        return (
          <div key={`${pos}-${index}`} className={`${containerClass} w-full`}>
            <div
              className={`rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50 transition hover:shadow-md ${cardWidth}`}
            >
              <img
                src={banner.url}
                alt={banner.alt || banner.title || `${pageTitle} banner (${pos})`}
                className={`w-full object-cover object-center ${
                  slot === 'top'
                    ? 'max-h-[380px] sm:max-h-[460px]'
                    : isCorner
                    ? 'max-h-[260px]'
                    : 'max-h-[320px]'
                }`}
                loading="lazy"
              />
              {banner.title && (
                <div className="px-4 py-2 bg-white/90 text-xs font-medium text-slate-600 border-t border-slate-100 text-center">
                  {banner.title}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CmsBannerSlot;
