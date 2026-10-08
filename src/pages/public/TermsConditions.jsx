import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { BASE_API_URL } from '../../context/AuthContext';
import { resolveCmsImageUrl, formatCmsHtml, getPageBanners } from '../../utils/cmsHelper';
import { DEFAULT_TERMS_SECTIONS } from '../../utils/defaultCmsContent';
import CmsBannerSlot from '../../components/CmsBannerSlot';

export const TermsConditions = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPage = async () => {
      try {
        const res = await axios.get(`${BASE_API_URL}/cms/public/pages/terms-conditions`);
        if (isMounted && res.data) {
          setPageData(res.data);
        }
      } catch (err) {
        if (isMounted) setPageData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPage();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-[#fff9f3] py-12 sm:py-16 border-b border-[#ffe8d2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-4 w-32 bg-amber-100/70 rounded animate-pulse mb-4"></div>
            <div className="h-10 w-2/3 max-w-lg bg-amber-200/60 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-48 bg-amber-100/60 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 animate-pulse space-y-3">
              <div className="h-6 w-1/3 bg-slate-200 rounded"></div>
              <div className="h-4 w-full bg-slate-100 rounded"></div>
              <div className="h-4 w-4/5 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasDynamicSections = Array.isArray(pageData?.sections) && pageData.sections.length > 0;
  const sectionsToRender = hasDynamicSections
    ? [...pageData.sections].filter(s => s && s.active !== false).sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
    : DEFAULT_TERMS_SECTIONS;

  const banners = pageData ? getPageBanners(pageData) : [];

  // Helper to render section image
  const renderSectionImage = (section) => {
    const imgSrc = resolveCmsImageUrl(section.image?.url);
    if (!imgSrc) return null;

    const widthClassMap = {
      small: 'max-w-[280px]',
      medium: 'max-w-[440px]',
      large: 'max-w-[580px]',
      full: 'w-full'
    };
    const widthClass = widthClassMap[section.image?.width] || (section.image?.width === 'custom' ? '' : 'max-w-full');
    const customWidthStyle = (section.image?.width === 'custom' && section.image?.customWidth)
      ? { maxWidth: `${section.image.customWidth}px` }
      : {};

    const roundedClassMap = {
      'rounded-none': 'rounded-none',
      'rounded-lg': 'rounded-lg',
      'rounded-xl': 'rounded-xl',
      'rounded-2xl': 'rounded-2xl',
      'rounded-custom': 'rounded-tl-[100px] rounded-br-[100px]',
      'rounded-full': 'rounded-full'
    };
    const roundedClass = roundedClassMap[section.image?.rounded] || 'rounded-xl';

    const spacingTopStyle = section.image?.spacingTop ? { marginTop: `${section.image.spacingTop * 16}px` } : {};
    const spacingBottomStyle = section.image?.spacingBottom ? { marginBottom: `${section.image.spacingBottom * 16}px` } : {};
    const blendStyle = section.image?.blendMode && section.image.blendMode !== 'normal'
      ? { mixBlendMode: section.image.blendMode }
      : {};

    return (
      <div style={{ ...spacingTopStyle, ...spacingBottomStyle }} className="relative flex items-center justify-center mx-auto">
        <img
          src={imgSrc}
          alt={section.image?.alt || section.title || 'Terms Image'}
          style={{ ...customWidthStyle, ...blendStyle }}
          className={`${widthClass} ${roundedClass} ${section.image?.transparentBg ? 'bg-transparent shadow-none' : 'shadow-md'} object-contain transition duration-300`}
        />
      </div>
    );
  };

  // Helper to render section buttons
  const renderSectionButtons = (section) => {
    const pBtn = section.primaryButton;
    const sBtn = section.secondaryButton;
    if ((!pBtn || !pBtn.enabled) && (!sBtn || !sBtn.enabled)) return null;

    return (
      <div className="flex flex-wrap items-center gap-4 pt-4">
        {pBtn && pBtn.enabled && (
          <Link
            to={pBtn.url || '/contact'}
            className="bg-[#0047C7] hover:bg-[#0052cc] text-white font-medium text-sm sm:text-base px-6 py-3 rounded-lg inline-block transition shadow-sm"
          >
            {pBtn.text || 'Learn More'}
          </Link>
        )}
        {sBtn && sBtn.enabled && (
          <Link
            to={sBtn.url || '/support'}
            className="text-[#1f2938] hover:text-[#0047C7] font-medium text-sm sm:text-base px-6 py-3 rounded-lg border border-slate-200 hover:border-[#0047C7] inline-block transition"
          >
            {sBtn.text || 'Support'}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* Top Banner & Header Breadcrumb */}
      <section className="bg-[#fff9f3] py-8 sm:py-12 border-b border-[#ffe8d2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center list-none p-0 mb-3 text-sm text-[#88929b]">
            <li>
              <Link to="/" className="text-[#1f2938] hover:text-[#0047C7] transition">Home</Link>
            </li>
            <li className="relative pl-[14px] before:content-['/'] before:absolute before:left-[4px]">
              Terms &amp; Conditions
            </li>
          </ul>
          <h1 className="text-[32px] sm:text-[44px] font-bold text-[#1f2938] leading-tight">
            {pageData?.title || 'Terms & Conditions'}
          </h1>
          {pageData?.updatedAt && (
            <p className="text-[#88929b] text-sm mt-2">
              <em>Last Updated: {new Date(pageData.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</em>
            </p>
          )}
        </div>
      </section>

      {/* Top Banner Slot if defined */}
      {banners.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <CmsBannerSlot banners={banners} slot="top" pageTitle={pageData?.title || 'Terms & Conditions'} />
        </div>
      )}

      {/* Main Content Sections */}
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {sectionsToRender.map((section) => {
            const layout = section.layout || 'text-only';
            const bgStyle = section.bgColor ? { backgroundColor: section.bgColor } : {};

            return (
              <section
                key={section.id}
                style={bgStyle}
                className="border border-[#ececec] rounded-xl p-6 sm:p-8 bg-white hover:border-[#0047C7]/40 transition shadow-xs"
              >
                {layout === 'text-only' ? (
                  <div className="w-full">
                    {section.eyebrow && (
                      <span className="text-[#0047C7] text-xs sm:text-sm font-bold uppercase tracking-wider block mb-1.5">
                        {section.eyebrow}
                      </span>
                    )}
                    {section.title && (
                      <h2 className="text-xl sm:text-2xl font-bold text-[#1f2938] mb-4">
                        {section.title}
                      </h2>
                    )}
                    {section.contentHtml && (
                      <div
                        className="cms-rendered-content text-[#37404e] text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                      />
                    )}
                    {renderSectionButtons(section)}
                  </div>
                ) : layout === 'centered-stack' ? (
                  <div className="w-full text-center max-w-3xl mx-auto">
                    {section.eyebrow && (
                      <span className="text-[#0047C7] text-xs sm:text-sm font-bold uppercase tracking-wider block mb-1.5">
                        {section.eyebrow}
                      </span>
                    )}
                    {section.title && (
                      <h2 className="text-xl sm:text-2xl font-bold text-[#1f2938] mb-4">
                        {section.title}
                      </h2>
                    )}
                    {section.image?.url && (
                      <div className="my-6">
                        {renderSectionImage(section)}
                      </div>
                    )}
                    {section.contentHtml && (
                      <div
                        className="cms-rendered-content text-[#37404e] text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                      />
                    )}
                    <div className="flex justify-center mt-4">
                      {renderSectionButtons(section)}
                    </div>
                  </div>
                ) : layout === 'image-left-text-right' ? (
                  <div className="grid gap-6 lg:gap-10 lg:grid-cols-2 items-center">
                    <div>
                      {renderSectionImage(section)}
                    </div>
                    <div>
                      {section.eyebrow && (
                        <span className="text-[#0047C7] text-xs sm:text-sm font-bold uppercase tracking-wider block mb-1.5">
                          {section.eyebrow}
                        </span>
                      )}
                      {section.title && (
                        <h2 className="text-xl sm:text-2xl font-bold text-[#1f2938] mb-4">
                          {section.title}
                        </h2>
                      )}
                      {section.contentHtml && (
                        <div
                          className="cms-rendered-content text-[#37404e] text-base leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                        />
                      )}
                      {renderSectionButtons(section)}
                    </div>
                  </div>
                ) : (
                  /* default: text-left-image-right */
                  <div className="grid gap-6 lg:gap-10 lg:grid-cols-2 items-center">
                    <div>
                      {section.eyebrow && (
                        <span className="text-[#0047C7] text-xs sm:text-sm font-bold uppercase tracking-wider block mb-1.5">
                          {section.eyebrow}
                        </span>
                      )}
                      {section.title && (
                        <h2 className="text-xl sm:text-2xl font-bold text-[#1f2938] mb-4">
                          {section.title}
                        </h2>
                      )}
                      {section.contentHtml && (
                        <div
                          className="cms-rendered-content text-[#37404e] text-base leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                        />
                      )}
                      {renderSectionButtons(section)}
                    </div>
                    <div>
                      {renderSectionImage(section)}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default TermsConditions;