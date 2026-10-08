import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { BASE_API_URL } from '../../context/AuthContext';
import { resolveCmsImageUrl, formatCmsHtml, getPageBanners } from '../../utils/cmsHelper';
import { DEFAULT_ABOUT_SECTIONS } from '../../utils/defaultCmsContent';
import CmsBannerSlot from '../../components/CmsBannerSlot';
import bannerImg from './aboutImages/banner-img.png';
import bannerSm1 from './aboutImages/banner-sm-1.png';
import bannerSm2 from './aboutImages/banner-sm-2.png';
import bannerSm3 from './aboutImages/banner-sm-3.png';
import reserchSVG from './aboutImages/market-research.svg';
import creativeLayout from './aboutImages/creative-layout.svg';
import digitalMarketing from './aboutImages/digital-marketing.svg';
import backLinks from './aboutImages/seo-backlink.svg';
import findingJOB from './aboutImages/img-findjob.png';
import webDev from './aboutImages/web-dev.svg';
import congratulations from './aboutImages/congratulation.svg';
import onlineMarketing from './aboutImages/banner-online-marketing.png';
import Marc from './aboutImages/marc.png';
import marc2 from './aboutImages/marc2.png';
import marc3 from './aboutImages/marc3.png';
import marc4 from './aboutImages/marc4.png';
import profile1 from './aboutImages/profile.png';
import profile2 from './aboutImages/profile2.png';
import profile3 from './aboutImages/profile3.png';
import star from './aboutImages/star.svg';
import { getPublicSettings } from '../../utils/publicSettings';

const defaultTeamList = [
  { name: 'Elon Musk', role: 'Marketing Crew', photo: Marc },
  { name: 'Bernard Arnault', role: 'Marketing Crew', photo: marc2 },
  { name: 'Jeff Bezos', role: 'Marketing Crew', photo: marc3 },
  { name: 'Bill Gates', role: 'Marketing Crew', photo: marc4 }
];

const defaultCustomerList = [
  {
    name: 'Sarah Harding',
    role: 'Visual Designer',
    photo: profile1,
    rating: 5,
    review: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as'
  },
  {
    name: 'Sarah Harding',
    role: 'Visual Designer',
    photo: profile2,
    rating: 5,
    review: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as'
  },
  {
    name: 'Sarah Harding',
    role: 'Visual Designer',
    photo: profile3,
    rating: 5,
    review: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as'
  }
];

const About = ({ settings: propSettings }) => {
  const [settings, setSettings] = useState(propSettings || null);
  const [dynamicPage, setDynamicPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propSettings) {
      setSettings(propSettings);
      return;
    }
    let isMounted = true;
    getPublicSettings().then((data) => {
      if (isMounted && data) setSettings(data);
    });
    return () => { isMounted = false; };
  }, [propSettings]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    axios.get(`${BASE_API_URL}/cms/public/pages/about`)
      .then(res => {
        if (isMounted && res.data) {
          setDynamicPage(res.data);
        }
      })
      .catch(() => {
        if (isMounted) setDynamicPage(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const teamList = (Array.isArray(settings?.teamMembers) && settings.teamMembers.length > 0)
    ? settings.teamMembers
    : defaultTeamList;

  const customerList = (Array.isArray(settings?.happyCustomers) && settings.happyCustomers.length > 0)
    ? settings.happyCustomers
    : defaultCustomerList;

  // Loading state skeleton to avoid static content flash on refresh
  if (loading) {
    return (
      <div className="w-full bg-white overflow-x-hidden min-h-screen">
        <div className="bg-[#fff9f3] py-16 sm:py-24 border-b border-[#ffe8d2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-4 w-32 bg-amber-100/70 rounded animate-pulse mb-4"></div>
            <div className="h-10 w-2/3 max-w-lg bg-amber-200/60 rounded animate-pulse mb-6"></div>
            <div className="h-5 w-full max-w-xl bg-amber-100/60 rounded animate-pulse mb-3"></div>
            <div className="h-5 w-4/5 max-w-lg bg-amber-100/60 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="border border-slate-100 rounded-xl p-8 bg-slate-50/50 animate-pulse">
                <div className="w-14 h-14 bg-slate-200 rounded-lg mb-6"></div>
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-3"></div>
                <div className="h-4 w-full bg-slate-100 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Determine sections to render
  const hasDynamicSections = Array.isArray(dynamicPage?.sections) && dynamicPage.sections.length > 0;
  const sectionsToRender = hasDynamicSections
    ? [...dynamicPage.sections].filter(s => s && s.active !== false).sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
    : DEFAULT_ABOUT_SECTIONS;

  const banners = dynamicPage ? getPageBanners(dynamicPage) : [];

  // Helper to render section image
  const renderSectionImage = (section, defaultImg) => {
    const imgSrc = section.image?.url ? resolveCmsImageUrl(section.image.url) : defaultImg;
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
      <div
        style={{ ...spacingTopStyle, ...spacingBottomStyle }}
        className="relative flex items-center justify-center mx-auto"
      >
        <img
          src={imgSrc}
          alt={section.image?.alt || section.title || 'Section Image'}
          style={{ ...customWidthStyle, ...blendStyle }}
          className={`${widthClass} ${roundedClass} ${section.image?.transparentBg ? 'bg-transparent shadow-none' : 'shadow-md'} object-contain transition duration-300`}
        />
      </div>
    );
  };

  // Helper to render section action buttons
  const renderSectionButtons = (section) => {
    const pBtn = section.primaryButton;
    const sBtn = section.secondaryButton;
    if ((!pBtn || !pBtn.enabled) && (!sBtn || !sBtn.enabled)) return null;

    return (
      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
        {pBtn && pBtn.enabled && (
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#0047C7] blur-[20px] rounded-lg w-[144px] h-[39px] left-0 right-0 mx-auto top-2.5 opacity-60"></div>
            <Link
              to={pBtn.url || '/contact'}
              className="relative z-10 bg-[#0047C7] hover:bg-[#0052cc] text-white font-medium text-base px-6 py-3.5 rounded-lg inline-block transition-all hover:-translate-y-0.5"
            >
              {pBtn.text || 'Contact us'}
            </Link>
          </div>
        )}
        {sBtn && sBtn.enabled && (
          <Link
            to={sBtn.url || '/support'}
            className="text-[#1f2938] hover:text-[#0047C7] font-medium text-base px-6 py-3.5 rounded-lg border border-slate-200 hover:border-[#0047C7] inline-block transition-all"
          >
            {sBtn.text || 'Support center'}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Top Banner Slot if defined in CMS */}
      {banners.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <CmsBannerSlot banners={banners} slot="top" pageTitle={dynamicPage?.title || 'About Us'} />
        </div>
      )}

      {/* Dynamic Sections rendering based on sortOrder */}
      {sectionsToRender.map((section) => {
        const secId = section.id || '';
        const layout = section.layout || 'text-left-image-right';
        const bgStyle = section.bgColor ? { backgroundColor: section.bgColor } : {};

        // 1. HERO BANNER SECTION
        if (secId === 'hero') {
          const hasCustomHeroImg = Boolean(section.image?.url);
          return (
            <section
              key={section.id || 'hero'}
              style={bgStyle}
              className="border-b border-[#fff9f3] relative overflow-hidden rounded-bl-[40px] rounded-br-[40px] sm:rounded-bl-[60px] sm:rounded-br-[60px] lg:rounded-bl-[100px] lg:rounded-br-[100px] pb-16 pt-12 sm:pb-24 sm:pt-16 lg:pb-40 lg:pt-20 bg-[#fff9f3]"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 items-center">
                  {/* Left Column */}
                  <div className="lg:col-span-7 space-y-5 sm:space-y-6 lg:py-[20px] lg:pr-[60px] text-center lg:text-left">
                    {section.eyebrow && (
                      <span className="text-[#0047C7] text-sm sm:text-base font-semibold tracking-wide uppercase block">
                        {section.eyebrow}
                      </span>
                    )}
                    <h1 className="text-[30px] leading-[38px] sm:text-5xl lg:text-[52px] font-bold text-[#1f2938] leading-[1.2] tracking-tight">
                      {section.title ? (
                        <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.title) }} />
                      ) : (
                        <>The #1 Job Board for <span className="text-[#0047C7] inline-block mt-3">Graphic Design Jobs</span></>
                      )}
                    </h1>

                    {section.contentHtml ? (
                      <div
                        className="cms-rendered-content text-[#475569] text-base sm:text-lg leading-relaxed max-w-full sm:max-w-[85%] lg:max-w-[80%] mx-auto lg:mx-0"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                      />
                    ) : (
                      <p className="text-[#475569] text-base sm:text-lg leading-relaxed max-w-full sm:max-w-[85%] lg:max-w-[70%] mx-auto lg:mx-0">
                        {section.subtitle || 'Search and connect with the right candidates faster. This talent search gives you the opportunity to find candidates who may be a perfect fit for your role.'}
                      </p>
                    )}

                    {/* Mobile image preview */}
                    <div className="lg:hidden pt-2 pb-1">
                      {renderSectionImage(section, bannerImg)}
                    </div>

                    {renderSectionButtons(section)}
                  </div>

                  {/* Right Column (Desktop) */}
                  <div className="lg:col-span-5 hidden lg:block relative">
                    {hasCustomHeroImg ? (
                      renderSectionImage(section, bannerImg)
                    ) : (
                      <div className="relative w-auto h-[350px] flex items-center justify-center mx-auto max-w-[580px] m-10">
                        <img
                          src={bannerImg}
                          alt="JobsWaale"
                          className="relative z-10 max-w-full animate-[hero-thumb-sm-2-animation_4s_linear_infinite_alternate]"
                        />
                        <span className="absolute top-[-25%] -left-[80px] w-[102px] h-[102px] rounded-full overflow-hidden animate-[hero-thumb-animation_2s_linear_infinite_alternate] shadow-lg z-20">
                          <img src={bannerSm1} alt="JobsWaale" className="w-full h-full object-cover" />
                        </span>
                        <span className="absolute top-[10%] -left-[110px] w-[132px] z-20 animate-[hero-thumb-animation_2s_linear_infinite_alternate]">
                          <img src={bannerSm2} alt="JobsWaale" className="rounded-t-[40px] rounded-br-[40px] w-full shadow-lg" />
                        </span>
                        <span className="absolute top-[70%] -left-[150px] w-[182px] z-20 animate-[hero-thumb-sm-animation_4s_linear_infinite_alternate]">
                          <img src={bannerSm3} alt="JobsWaale" className="rounded-bl-[40px] w-full shadow-lg" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 2. CORE FEATURES GRID SECTION
        if (secId === 'features' || layout === 'features-grid') {
          return (
            <section
              key={section.id || 'features'}
              style={bgStyle}
              className="pt-12 sm:pt-16 lg:pt-[90px] pb-10 bg-white"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {section.title && (
                  <div className="text-center mb-10">
                    <h2 className="text-[28px] sm:text-[36px] font-bold text-[#1f2938] mb-3">
                      {section.title}
                    </h2>
                    {section.subtitle && (
                      <p className="text-[#88929b] text-base leading-relaxed max-w-2xl mx-auto">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                )}

                {section.contentHtml && !section.contentHtml.includes('feature-card') ? (
                  <div
                    className="cms-rendered-content"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                  />
                ) : (
                  <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="group bg-white border border-[#ececec] rounded-xl p-6 sm:p-8 lg:p-10 hover:border-[#0047C7] hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] transition-all duration-200">
                      <div className="mb-5">
                        <img src={reserchSVG} alt="market research" className="h-[50px] sm:h-[65px]" />
                      </div>
                      <h5 className="font-bold text-[#1f2938] text-xl mt-5">Market Research</h5>
                      <p className="text-[#37404e] text-base leading-relaxed mt-4 mb-5">In-depth industry data and career insights across India.</p>
                      <Link to="/market-research" className="text-[#0047C7] text-lg font-normal hover:text-[#0052cc] transition">
                        Read more &rarr;
                      </Link>
                    </div>

                    <div className="group bg-white border border-[#ececec] rounded-xl p-6 sm:p-8 lg:p-10 hover:border-[#0047C7] hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] transition-all duration-200">
                      <div className="mb-5">
                        <img src={creativeLayout} alt="creative layout" className="h-[50px] sm:h-[65px]" />
                      </div>
                      <h5 className="font-bold text-[#1f2938] text-xl mt-5">Creative Layout</h5>
                      <p className="text-[#37404e] text-base leading-relaxed mt-4 mb-5">Modern candidate profiles and visually optimized job vacancy views.</p>
                      <Link to="/creative-layout" className="text-[#0047C7] text-lg font-normal hover:text-[#0052cc] transition">
                        Read more &rarr;
                      </Link>
                    </div>

                    <div className="group bg-white border border-[#ececec] rounded-xl p-6 sm:p-8 lg:p-10 hover:border-[#0047C7] hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] transition-all duration-200">
                      <div className="mb-5">
                        <img src={digitalMarketing} alt="digital marketing" className="h-[50px] sm:h-[65px]" />
                      </div>
                      <h5 className="font-bold text-[#1f2938] text-xl mt-5">Digital Marketing</h5>
                      <p className="text-[#37404e] text-base leading-relaxed mt-4 mb-5">Targeted social and search campaigns to accelerate hiring.</p>
                      <Link to="/digital-marketing" className="text-[#0047C7] text-lg font-normal hover:text-[#0052cc] transition">
                        Read more &rarr;
                      </Link>
                    </div>

                    <div className="group bg-white border border-[#ececec] rounded-xl p-6 sm:p-8 lg:p-10 hover:border-[#0047C7] hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] transition-all duration-200">
                      <div className="mb-5">
                        <img src={backLinks} alt="seo backlinks" className="h-[50px] sm:h-[65px]" />
                      </div>
                      <h5 className="font-bold text-[#1f2938] text-xl mt-5">SEO & Backlinks</h5>
                      <p className="text-[#37404e] text-base leading-relaxed mt-4 mb-5">High search engine ranking for guaranteed candidate visibility.</p>
                      <Link to="/seo-backlinks" className="text-[#0047C7] text-lg font-normal hover:text-[#0052cc] transition">
                        Read more &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        }

        // 3. FIND JOBS CTA SECTION
        if (secId === 'find_jobs') {
          const containerBg = section.bgColor || '#c2d9ff';
          return (
            <section
              key={section.id || 'find_jobs'}
              className="pt-12 sm:pt-16 lg:pt-[90px] pb-14 sm:pb-20 bg-white"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                  style={{ backgroundColor: containerBg }}
                  className="relative rounded-[30px] sm:rounded-[50px] lg:rounded-[80px] pt-10 pb-10 px-6 sm:pt-16 sm:pb-16 sm:pl-5 sm:pr-12 overflow-hidden"
                >
                  <div className="relative z-10 grid gap-6 lg:gap-10 lg:grid-cols-2 items-center">
                    {/* Left Image */}
                    <div className="relative -ml-0 lg:-ml-[50px] flex justify-center">
                      {section.image?.url ? (
                        renderSectionImage(section, findingJOB)
                      ) : (
                        <div className="relative">
                          <img
                            src={findingJOB}
                            alt="find job"
                            className="rounded-tl-[100px] rounded-br-[100px] shadow-[0_20px_60px_-6px_rgba(0,0,0,0.04)] w-full max-w-[480px]"
                          />
                          <div className="absolute -bottom-[45px] right-[100px] w-[39px] h-[39px] rounded-full bg-[#9fdbe9]"></div>
                        </div>
                      )}
                    </div>

                    {/* Right Content */}
                    <div className="text-center lg:text-left pt-2 px-0 lg:pt-[70px] lg:pl-[30px] lg:pr-[30px] pb-2 lg:pb-8">
                      {section.eyebrow && (
                        <span className="text-[#0047C7] text-lg sm:text-xl font-semibold">
                          {section.eyebrow}
                        </span>
                      )}
                      <h3 className="text-[26px] leading-[32px] sm:text-[32px] sm:leading-[40px] lg:text-[36px] lg:leading-[44px] font-bold text-[#1f2938] mt-4 mb-4 sm:mt-7 sm:mb-7">
                        {section.title || 'Create free account and start applying to your dream job today'}
                      </h3>

                      {section.contentHtml ? (
                        <div
                          className="cms-rendered-content text-[#37404e] text-base sm:text-lg leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                        />
                      ) : (
                        <p className="text-[#37404e] text-base sm:text-lg leading-relaxed">
                          {section.subtitle || 'Build your profile, explore verified openings, and apply directly to roles that match your skills, location, and career goals.'}
                        </p>
                      )}

                      <div className="mt-6 sm:mt-7">
                        {section.primaryButton?.enabled !== false && (
                          <Link
                            to={section.primaryButton?.url || '/jobs'}
                            className="bg-[#0047C7] hover:bg-[#0052cc] text-white font-medium text-base px-6 py-3.5 rounded-lg inline-block transition-all hover:-translate-y-0.5"
                          >
                            {section.primaryButton?.text || 'Explore more'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 4. ONLINE MARKETING & COMMITMENT STORY SECTION
        if (secId === 'marketing_story') {
          return (
            <section
              key={section.id || 'marketing_story'}
              style={bgStyle}
              className="pt-12 sm:pt-16 lg:pt-[90px] pb-14 sm:pb-20 bg-white border-b border-[#ececec]"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center">
                  {/* Left Content */}
                  <div className="text-center lg:text-left">
                    {section.eyebrow && (
                      <span className="text-[#0047C7] text-lg sm:text-xl font-semibold">
                        {section.eyebrow}
                      </span>
                    )}
                    <h3 className="text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] lg:text-[44px] lg:leading-[54px] font-bold text-[#1f2938] mt-4 mb-5 sm:mt-5 sm:mb-7">
                      {section.title || 'Committed to top quality and results'}
                    </h3>

                    {section.contentHtml ? (
                      <div
                        className="cms-rendered-content text-[#37404e] text-base leading-relaxed mb-6"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                      />
                    ) : (
                      <p className="text-[#37404e] text-base leading-relaxed mb-6">
                        {section.subtitle}
                      </p>
                    )}

                    <div>
                      {section.primaryButton?.enabled !== false && (
                        <Link
                          to={section.primaryButton?.url || '/contact'}
                          className="bg-[#0047C7] hover:bg-[#0052cc] text-white font-medium text-base px-6 py-3.5 rounded-lg inline-block transition-all hover:-translate-y-0.5"
                        >
                          {section.primaryButton?.text || 'Learn more'}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Right Images */}
                  <div className="relative pl-0 lg:pl-[20px] py-6 flex justify-center">
                    {section.image?.url ? (
                      renderSectionImage(section, onlineMarketing)
                    ) : (
                      <div className="relative w-full max-w-[480px]">
                        <img
                          src={onlineMarketing}
                          alt="online marketing"
                          className="relative z-10 max-w-full animate-[hero-thumb-sm-2-animation_4s_linear_infinite_alternate]"
                        />
                        <span className="hidden lg:block absolute top-[15%] -left-[110px] z-20 animate-[hero-thumb-animation_2s_linear_infinite_alternate]">
                          <img src={congratulations} alt="congratulation" />
                        </span>
                        <span className="hidden lg:block absolute top-[65%] -left-[90px] z-20 animate-[hero-thumb-sm-animation_4s_linear_infinite_alternate]">
                          <img src={webDev} alt="web dev" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 5. MEET OUR TEAM SECTION
        if (secId === 'team' || layout === 'team-grid') {
          if (settings?.showMeetOurTeam === false) return null;
          return (
            <section
              key={section.id || 'team'}
              style={bgStyle}
              className="pt-12 sm:pt-16 lg:pt-[90px] pb-14 sm:pb-20 bg-white"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h2 className="text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] lg:text-[44px] lg:leading-[54px] font-bold text-[#1f2938] mb-4">
                    {section.title || 'Meet our team'}
                  </h2>
                  <p className="text-[#88929b] text-base leading-relaxed max-w-full sm:max-w-[75%] lg:max-w-[60%] mx-auto">
                    {section.subtitle || 'Find the type of work you need, clearly defined and ready to start. Work begins as soon as you purchase and provide requirements.'}
                  </p>
                </div>

                <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-10 sm:mt-[60px]">
                  {teamList.map((member, index) => {
                    const defaultPhotos = [Marc, marc2, marc3, marc4];
                    const fallbackPhoto = defaultPhotos[index % defaultPhotos.length];
                    const photoSrc = member.photo || fallbackPhoto;

                    return (
                      <div key={index} className="border border-[#ececec] rounded-xl p-6 bg-white hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] hover:border-[#0047C7] transition duration-200 text-center flex flex-col items-center">
                        <div className="mb-4 w-full h-[230px] sm:h-[250px] rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                          <img 
                            src={photoSrc} 
                            alt={member.name || 'Team Member'} 
                            className="w-full h-full object-cover object-top hover:scale-105 transition duration-300"
                            onError={(e) => { e.currentTarget.src = fallbackPhoto; }}
                          />
                        </div>
                        <h5 className="font-bold text-[#1f2938] text-lg mb-1">{member.name || 'Team Member'}</h5>
                        <p className="text-[#88929b] text-sm">{member.role || 'Marketing Crew'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        // 6. HAPPY CUSTOMERS / TESTIMONIALS SECTION
        if (secId === 'testimonials' || layout === 'testimonials-grid') {
          if (settings?.showHappyCustomers === false) return null;
          return (
            <section
              key={section.id || 'testimonials'}
              style={bgStyle}
              className="pt-14 sm:pt-16 lg:pt-20 pb-14 sm:pb-20 bg-white"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h2 className="text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] lg:text-[44px] lg:leading-[54px] font-bold text-[#1f2938] mb-4">
                    {section.title || 'Our Happy Customer'}
                  </h2>
                  <p className="text-[#88929b] text-base leading-relaxed max-w-full sm:max-w-[75%] lg:max-w-[60%] mx-auto">
                    {section.subtitle || 'When it comes to choosing the right web hosting provider, we know how easy it is to get overwhelmed with the number.'}
                  </p>
                </div>

                <div className="grid gap-6 sm:gap-8 md:grid-cols-3 mt-10 sm:mt-[70px]">
                  {customerList.map((customer, index) => {
                    const defaultPhotos = [profile1, profile2, profile3];
                    const fallbackPhoto = defaultPhotos[index % defaultPhotos.length];
                    const photoSrc = customer.photo || fallbackPhoto;
                    const ratingCount = Math.max(1, Math.min(5, Number(customer.rating) || 5));

                    return (
                      <div key={index} className="border border-[#ececec] rounded-xl p-6 sm:p-8 bg-white hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] hover:border-[#0047C7] transition duration-200 text-center flex flex-col justify-between">
                        <div>
                          <div className="mb-4">
                            <img 
                              src={photoSrc} 
                              alt={customer.name || 'Customer'} 
                              className="w-[100px] h-[100px] rounded-full mx-auto object-cover object-top border-2 border-slate-100 shadow-sm"
                              onError={(e) => { e.currentTarget.src = fallbackPhoto; }}
                            />
                          </div>
                          <p className="text-[#37404e] text-base sm:text-lg leading-relaxed text-center">
                            {customer.review || 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as'}
                          </p>
                        </div>
                        <div className="mt-5">
                          <div className="flex items-center justify-center gap-1 mb-6">
                            {[...Array(ratingCount)].map((_, i) => (
                              <img key={i} src={star} alt="star" />
                            ))}
                          </div>
                          <div>
                            <strong className="text-[#1f2938] text-lg font-bold block">{customer.name || 'Sarah Harding'}</strong>
                            <span className="text-[#727272] text-base">{customer.role || 'Visual Designer'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        // 7. GENERIC / CUSTOM SECTION HANDLER
        return (
          <section
            key={section.id}
            style={bgStyle}
            className="py-12 sm:py-16 bg-white border-b border-slate-100"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {layout === 'text-only' ? (
                <div className="max-w-4xl mx-auto text-center lg:text-left">
                  {section.eyebrow && (
                    <span className="text-[#0047C7] text-sm sm:text-base font-semibold block mb-2">
                      {section.eyebrow}
                    </span>
                  )}
                  {section.title && (
                    <h2 className="text-[28px] sm:text-[38px] font-bold text-[#1f2938] mb-4">
                      {section.title}
                    </h2>
                  )}
                  {section.contentHtml && (
                    <div
                      className="cms-rendered-content text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                    />
                  )}
                  {renderSectionButtons(section)}
                </div>
              ) : layout === 'centered-stack' ? (
                <div className="max-w-4xl mx-auto text-center">
                  {section.eyebrow && (
                    <span className="text-[#0047C7] text-sm sm:text-base font-semibold block mb-2">
                      {section.eyebrow}
                    </span>
                  )}
                  {section.title && (
                    <h2 className="text-[28px] sm:text-[38px] font-bold text-[#1f2938] mb-4">
                      {section.title}
                    </h2>
                  )}
                  {section.image?.url && (
                    <div className="my-6">
                      {renderSectionImage(section, null)}
                    </div>
                  )}
                  {section.contentHtml && (
                    <div
                      className="cms-rendered-content text-slate-700 leading-relaxed max-w-2xl mx-auto"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                    />
                  )}
                  <div className="flex justify-center mt-6">
                    {renderSectionButtons(section)}
                  </div>
                </div>
              ) : layout === 'image-left-text-right' ? (
                <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center">
                  <div>
                    {renderSectionImage(section, null)}
                  </div>
                  <div>
                    {section.eyebrow && (
                      <span className="text-[#0047C7] text-sm sm:text-base font-semibold block mb-2">
                        {section.eyebrow}
                      </span>
                    )}
                    {section.title && (
                      <h2 className="text-[28px] sm:text-[38px] font-bold text-[#1f2938] mb-4">
                        {section.title}
                      </h2>
                    )}
                    {section.contentHtml && (
                      <div
                        className="cms-rendered-content text-slate-700 leading-relaxed mb-6"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                      />
                    )}
                    {renderSectionButtons(section)}
                  </div>
                </div>
              ) : (
                /* default: text-left-image-right */
                <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center">
                  <div>
                    {section.eyebrow && (
                      <span className="text-[#0047C7] text-sm sm:text-base font-semibold block mb-2">
                        {section.eyebrow}
                      </span>
                    )}
                    {section.title && (
                      <h2 className="text-[28px] sm:text-[38px] font-bold text-[#1f2938] mb-4">
                        {section.title}
                      </h2>
                    )}
                    {section.contentHtml && (
                      <div
                        className="cms-rendered-content text-slate-700 leading-relaxed mb-6"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatCmsHtml(section.contentHtml)) }}
                      />
                    )}
                    {renderSectionButtons(section)}
                  </div>
                  <div>
                    {renderSectionImage(section, null)}
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Add Keyframe Animations */}
      <style>{`
        @keyframes hero-thumb-animation {
          0% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes hero-thumb-sm-animation {
          0% { transform: translateY(-20px) translateX(50px); }
          100% { transform: translateY(-20px) translateX(0px); }
        }
        @keyframes hero-thumb-sm-2-animation {
          0% { transform: translateY(-50px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default About;
