import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { BASE_API_URL } from '../../context/AuthContext';
import { resolveCmsImageUrl, formatCmsHtml, getPageBanners } from '../../utils/cmsHelper';
import { usePageSEO } from '../../utils/seoHelper';
import {
  ABOUT_DEFAULT_IMAGES,
  DEFAULT_ABOUT_SECTIONS_DATA
} from '../../utils/aboutPageDefaults';
import CmsBannerSlot from '../../components/CmsBannerSlot';
import bannerSm1 from './aboutImages/banner-sm-1.png';
import bannerSm2 from './aboutImages/banner-sm-2.png';
import bannerSm3 from './aboutImages/banner-sm-3.png';
import congratulations from './aboutImages/congratulation.svg';
import webDev from './aboutImages/web-dev.svg';
import star from './aboutImages/star.svg';

export const About = () => {
  const [dynamicPage, setDynamicPage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hook for dynamic SEO Title and Meta tags
  usePageSEO('about', dynamicPage);

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

  // Determine sections data to render
  const savedSections = dynamicPage?.sections || dynamicPage?.projectData?.sections;
  const sectionsToRender = (Array.isArray(savedSections) && savedSections.length > 0)
    ? DEFAULT_ABOUT_SECTIONS_DATA.map(def => {
        const found = savedSections.find(s => s && s.id === def.id);
        if (!found) return def;
        return {
          ...def,
          ...found,
          cards: found.cards || def.cards,
          members: found.members || def.members,
          testimonials: found.testimonials || def.testimonials,
          primaryButton: { ...def.primaryButton, ...found.primaryButton },
          secondaryButton: { ...def.secondaryButton, ...found.secondaryButton },
          image: { ...def.image, ...found.image }
        };
      })
    : DEFAULT_ABOUT_SECTIONS_DATA;

  const banners = dynamicPage ? getPageBanners(dynamicPage) : [];

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

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Top Banner Slot if defined */}
      {banners.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <CmsBannerSlot banners={banners} slot="top" pageTitle={dynamicPage?.title || 'About Us'} />
        </div>
      )}

      {/* Render All 6 Sections */}
      {sectionsToRender.map((section) => {
        if (section.active === false) return null;
        const secId = section.id;

        // 1. HERO BANNER SECTION
        if (secId === 'hero') {
          const bgStyle = { backgroundColor: section.bgColor || '#fff9f3' };
          const titleStyle = {
            fontSize: section.titleFontSize ? `${section.titleFontSize}px` : undefined,
            color: section.titleColor || '#1f2938'
          };
          const subtitleStyle = {
            fontSize: section.subtitleFontSize ? `${section.subtitleFontSize}px` : undefined,
            color: section.subtitleColor || '#475569'
          };
          const eyebrowStyle = {
            color: section.eyebrowColor || '#0047C7'
          };

          const hasCustomImg = Boolean(section.image?.url);
          const customImgSrc = hasCustomImg ? resolveCmsImageUrl(section.image.url) : null;

          return (
            <section
              key="hero"
              style={bgStyle}
              className="border-b border-[#fff9f3] relative overflow-hidden rounded-bl-[40px] rounded-br-[40px] sm:rounded-bl-[60px] sm:rounded-br-[60px] lg:rounded-bl-[100px] lg:rounded-br-[100px] pb-16 pt-12 sm:pb-24 sm:pt-16 lg:pb-36 lg:pt-20 transition-colors"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 items-center">
                  {/* Left Column */}
                  <div className="lg:col-span-7 space-y-5 sm:space-y-6 lg:py-[20px] lg:pr-[40px] text-center lg:text-left h-auto">
                    {section.eyebrow && (
                      <span
                        style={eyebrowStyle}
                        className="text-sm sm:text-base font-semibold tracking-wide uppercase block"
                      >
                        {section.eyebrow}
                      </span>
                    )}

                    <h1
                      style={titleStyle}
                      className="font-bold leading-[1.2] tracking-tight transition-all"
                    >
                      {section.title || (
                        <>The #1 Job Board for <span className="text-[#0047C7] inline-block mt-2">Graphic Design Jobs</span></>
                      )}
                    </h1>

                    <p
                      style={subtitleStyle}
                      className="leading-relaxed max-w-full sm:max-w-[85%] lg:max-w-[85%] mx-auto lg:mx-0 transition-all"
                    >
                      {section.subtitle || 'Search and connect with the right candidates faster. This talent search gives you the opportunity to find candidates who may be a perfect fit for your role.'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3">
                      {section.primaryButton?.enabled !== false && (
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-[#0047C7] blur-[20px] rounded-lg w-[144px] h-[39px] left-0 right-0 mx-auto top-2.5 opacity-60"></div>
                          <Link
                            to={section.primaryButton?.url || '/contact'}
                            className="relative z-10 bg-[#0047C7] hover:bg-[#0052cc] text-white font-medium text-base px-6 py-3.5 rounded-lg inline-block transition-all hover:-translate-y-0.5"
                          >
                            {section.primaryButton?.text || 'Contact us'}
                          </Link>
                        </div>
                      )}

                      {section.secondaryButton?.enabled !== false && (
                        <Link
                          to={section.secondaryButton?.url || '/support'}
                          className="text-[#1f2938] hover:text-[#0047C7] font-medium text-base px-6 py-3.5 rounded-lg border border-slate-200 hover:border-[#0047C7] inline-block transition-all"
                        >
                          {section.secondaryButton?.text || 'Support center'}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Image or Default Animated Collage */}
                  <div className="lg:col-span-5 relative flex items-center justify-center">
                    {hasCustomImg ? (
                      <div className="relative max-w-[500px] w-full flex items-center justify-center">
                        <img
                          src={customImgSrc}
                          alt={section.image?.alt || 'About Us Hero'}
                          className="w-full h-auto max-h-[460px] object-contain rounded-2xl shadow-lg"
                        />
                      </div>
                    ) : (
                      /* Default Animated Collage */
                      <div className="relative w-auto h-[350px] flex items-center justify-center mx-auto max-w-[580px] m-10">
                        <img
                          src={ABOUT_DEFAULT_IMAGES.hero}
                          alt="JobsWaale Hero"
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

        // 2. CORE FEATURES (4 CARDS)
        if (secId === 'features') {
          const bgStyle = { backgroundColor: section.bgColor || '#ffffff' };
          const titleStyle = {
            fontSize: section.titleFontSize ? `${section.titleFontSize}px` : undefined,
            color: section.titleColor || '#1f2938'
          };
          const subtitleStyle = {
            fontSize: section.subtitleFontSize ? `${section.subtitleFontSize}px` : undefined,
            color: section.subtitleColor || '#88929b'
          };

          const cardsList = section.cards || DEFAULT_ABOUT_SECTIONS_DATA[1].cards;

          return (
            <section
              key="features"
              style={bgStyle}
              className="pt-12 sm:pt-16 lg:pt-[90px] pb-10 transition-colors"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10 h-auto">
                  <h2
                    style={titleStyle}
                    className="font-bold mb-3 tracking-tight transition-all"
                  >
                    {section.title || 'Core Features'}
                  </h2>
                  {section.subtitle && (
                    <p
                      style={subtitleStyle}
                      className="leading-relaxed max-w-2xl mx-auto transition-all"
                    >
                      {section.subtitle}
                    </p>
                  )}
                </div>

                {/* 4 Feature Cards */}
                <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {cardsList.map((card, idx) => {
                    const defaultIcon = ABOUT_DEFAULT_IMAGES.features[idx];
                    const iconSrc = card.image ? resolveCmsImageUrl(card.image) : defaultIcon;
                    const cardTitleStyle = { color: card.titleColor || '#1f2938' };
                    const cardDescStyle = { color: card.descriptionColor || '#37404e' };

                    return (
                      <div
                        key={card.id || idx}
                        className="group bg-white border border-[#ececec] rounded-xl p-6 sm:p-8 lg:p-10 hover:border-[#0047C7] hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] transition-all duration-200 h-auto flex flex-col justify-between"
                      >
                        <div>
                          <div className="mb-5 h-[55px] sm:h-[65px] flex items-center">
                            <img
                              src={iconSrc}
                              alt={card.title}
                              className="h-full object-contain"
                            />
                          </div>
                          <h5
                            style={cardTitleStyle}
                            className="font-bold text-xl mt-4 mb-3"
                          >
                            {card.title}
                          </h5>
                          <p
                            style={cardDescStyle}
                            className="text-base leading-relaxed mb-5"
                          >
                            {card.description}
                          </p>
                        </div>
                        <div>
                          <Link
                            to={card.url || '/'}
                            className="text-[#0047C7] text-lg font-normal hover:text-[#0052cc] transition inline-flex items-center gap-1"
                          >
                            {card.linkText || 'Read more'} &rarr;
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        // 3. FIND JOBS CTA BANNER
        if (secId === 'find_jobs') {
          const containerBg = section.bgColor || '#c2d9ff';
          const titleStyle = {
            fontSize: section.titleFontSize ? `${section.titleFontSize}px` : undefined,
            color: section.titleColor || '#1f2938'
          };
          const subtitleStyle = {
            fontSize: section.subtitleFontSize ? `${section.subtitleFontSize}px` : undefined,
            color: section.subtitleColor || '#37404e'
          };
          const eyebrowStyle = {
            color: section.eyebrowColor || '#0047C7'
          };

          const hasCustomImg = Boolean(section.image?.url);
          const imgSrc = hasCustomImg ? resolveCmsImageUrl(section.image.url) : ABOUT_DEFAULT_IMAGES.find_jobs;

          return (
            <section
              key="find_jobs"
              className="pt-12 sm:pt-16 lg:pt-[90px] pb-14 sm:pb-20 bg-white"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                  style={{ backgroundColor: containerBg }}
                  className="relative rounded-[30px] sm:rounded-[50px] lg:rounded-[80px] pt-10 pb-10 px-6 sm:pt-16 sm:pb-16 sm:pl-5 sm:pr-12 overflow-hidden transition-colors"
                >
                  <div className="relative z-10 grid gap-6 lg:gap-10 lg:grid-cols-2 items-center">
                    {/* Left Image */}
                    <div className="relative -ml-0 lg:-ml-[50px] flex justify-center">
                      <div className="relative">
                        <img
                          src={imgSrc}
                          alt={section.image?.alt || 'find job'}
                          className="rounded-tl-[100px] rounded-br-[100px] shadow-[0_20px_60px_-6px_rgba(0,0,0,0.04)] w-full max-w-[480px] object-cover"
                        />
                        {!hasCustomImg && (
                          <div className="absolute -bottom-[45px] right-[100px] w-[39px] h-[39px] rounded-full bg-[#9fdbe9]"></div>
                        )}
                      </div>
                    </div>

                    {/* Right Content */}
                    <div className="text-center lg:text-left pt-2 px-0 lg:pt-[50px] lg:pl-[30px] lg:pr-[30px] pb-2 lg:pb-8 h-auto">
                      {section.eyebrow && (
                        <span
                          style={eyebrowStyle}
                          className="text-lg sm:text-xl font-semibold"
                        >
                          {section.eyebrow}
                        </span>
                      )}

                      <h3
                        style={titleStyle}
                        className="font-bold mt-4 mb-4 sm:mt-6 sm:mb-6 leading-[1.2] transition-all"
                      >
                        {section.title || 'Create free account and start applying to your dream job today'}
                      </h3>

                      <p
                        style={subtitleStyle}
                        className="leading-relaxed transition-all"
                      >
                        {section.subtitle || 'Build your profile, explore verified openings, and apply directly to roles that match your skills, location, and career goals.'}
                      </p>

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

        // 4. QUALITY & COMMITMENT STORY
        if (secId === 'marketing_story') {
          const bgStyle = { backgroundColor: section.bgColor || '#ffffff' };
          const titleStyle = {
            fontSize: section.titleFontSize ? `${section.titleFontSize}px` : undefined,
            color: section.titleColor || '#1f2938'
          };
          const pStyle = {
            fontSize: section.paragraphFontSize ? `${section.paragraphFontSize}px` : undefined,
            color: section.paragraphColor || '#37404e'
          };
          const eyebrowStyle = {
            color: section.eyebrowColor || '#0047C7'
          };

          const hasCustomImg = Boolean(section.image?.url);
          const imgSrc = hasCustomImg ? resolveCmsImageUrl(section.image.url) : ABOUT_DEFAULT_IMAGES.marketing_story;

          return (
            <section
              key="marketing_story"
              style={bgStyle}
              className="pt-12 sm:pt-16 lg:pt-[90px] pb-14 sm:pb-20 border-b border-[#ececec] transition-colors"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center">
                  {/* Left Content */}
                  <div className="text-center lg:text-left h-auto">
                    {section.eyebrow && (
                      <span
                        style={eyebrowStyle}
                        className="text-lg sm:text-xl font-semibold"
                      >
                        {section.eyebrow}
                      </span>
                    )}

                    <h3
                      style={titleStyle}
                      className="font-bold mt-4 mb-5 sm:mt-5 sm:mb-6 leading-[1.2] transition-all"
                    >
                      {section.title || 'Committed to top quality and results'}
                    </h3>

                    {section.paragraph1 && (
                      <p style={pStyle} className="leading-relaxed mb-4">
                        {section.paragraph1}
                      </p>
                    )}

                    {section.paragraph2 && (
                      <p style={pStyle} className="leading-relaxed mb-6">
                        {section.paragraph2}
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

                  {/* Right Image */}
                  <div className="relative pl-0 lg:pl-[20px] py-6 flex justify-center">
                    {hasCustomImg ? (
                      <div className="w-full max-w-[480px]">
                        <img
                          src={imgSrc}
                          alt={section.image?.alt || 'online marketing'}
                          className="w-full h-auto rounded-2xl shadow-lg object-contain"
                        />
                      </div>
                    ) : (
                      /* Default with animated badges */
                      <div className="relative w-full max-w-[480px]">
                        <img
                          src={ABOUT_DEFAULT_IMAGES.marketing_story}
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

        // 5. MEET OUR TEAM (4 MEMBERS)
        if (secId === 'team') {
          const bgStyle = { backgroundColor: section.bgColor || '#ffffff' };
          const titleStyle = {
            fontSize: section.titleFontSize ? `${section.titleFontSize}px` : undefined,
            color: section.titleColor || '#1f2938'
          };
          const subtitleStyle = {
            fontSize: section.subtitleFontSize ? `${section.subtitleFontSize}px` : undefined,
            color: section.subtitleColor || '#88929b'
          };

          const membersList = section.members || DEFAULT_ABOUT_SECTIONS_DATA[4].members;

          return (
            <section
              key="team"
              style={bgStyle}
              className="pt-12 sm:pt-16 lg:pt-[90px] pb-14 sm:pb-20 transition-colors"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center h-auto">
                  <h2
                    style={titleStyle}
                    className="font-bold mb-4 tracking-tight transition-all"
                  >
                    {section.title || 'Meet our team'}
                  </h2>
                  <p
                    style={subtitleStyle}
                    className="leading-relaxed max-w-full sm:max-w-[75%] lg:max-w-[60%] mx-auto transition-all"
                  >
                    {section.subtitle || 'Find the type of work you need, clearly defined and ready to start. Work begins as soon as you purchase and provide requirements.'}
                  </p>
                </div>

                <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-10 sm:mt-[60px]">
                  {membersList.map((member, index) => {
                    const defaultPhoto = ABOUT_DEFAULT_IMAGES.team[index % ABOUT_DEFAULT_IMAGES.team.length];
                    const photoSrc = member.photo ? resolveCmsImageUrl(member.photo) : defaultPhoto;

                    return (
                      <div
                        key={member.id || index}
                        className="border border-[#ececec] rounded-xl p-6 bg-white hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] hover:border-[#0047C7] transition duration-200 text-center flex flex-col items-center h-auto"
                      >
                        <div className="mb-4 w-full h-[230px] sm:h-[250px] rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                          <img
                            src={photoSrc}
                            alt={member.name || 'Team Member'}
                            className="w-full h-full object-cover object-top hover:scale-105 transition duration-300"
                            onError={(e) => { e.currentTarget.src = defaultPhoto; }}
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

        // 6. OUR HAPPY CUSTOMER (TESTIMONIALS)
        if (secId === 'testimonials') {
          const bgStyle = { backgroundColor: section.bgColor || '#ffffff' };
          const titleStyle = {
            fontSize: section.titleFontSize ? `${section.titleFontSize}px` : undefined,
            color: section.titleColor || '#1f2938'
          };
          const subtitleStyle = {
            fontSize: section.subtitleFontSize ? `${section.subtitleFontSize}px` : undefined,
            color: section.subtitleColor || '#88929b'
          };

          const testimonialsList = section.testimonials || DEFAULT_ABOUT_SECTIONS_DATA[5].testimonials;

          return (
            <section
              key="testimonials"
              style={bgStyle}
              className="pt-14 sm:pt-16 lg:pt-20 pb-14 sm:pb-20 transition-colors"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center h-auto">
                  <h2
                    style={titleStyle}
                    className="font-bold mb-4 tracking-tight transition-all"
                  >
                    {section.title || 'Our Happy Customer'}
                  </h2>
                  <p
                    style={subtitleStyle}
                    className="leading-relaxed max-w-full sm:max-w-[75%] lg:max-w-[60%] mx-auto transition-all"
                  >
                    {section.subtitle || 'When it comes to choosing the right talent platform, hear what our verified customers have to say.'}
                  </p>
                </div>

                <div className="grid gap-6 sm:gap-8 md:grid-cols-3 mt-10 sm:mt-[70px]">
                  {testimonialsList.map((customer, index) => {
                    const defaultAvatar = ABOUT_DEFAULT_IMAGES.testimonials[index % ABOUT_DEFAULT_IMAGES.testimonials.length];
                    const photoSrc = customer.photo ? resolveCmsImageUrl(customer.photo) : defaultAvatar;
                    const ratingCount = Math.max(1, Math.min(5, Number(customer.rating) || 5));

                    return (
                      <div
                        key={customer.id || index}
                        className="border border-[#ececec] rounded-xl p-6 sm:p-8 bg-white hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] hover:border-[#0047C7] transition duration-200 text-center flex flex-col justify-between h-auto"
                      >
                        <div>
                          <div className="mb-4">
                            <img
                              src={photoSrc}
                              alt={customer.name || 'Customer'}
                              className="w-[100px] h-[100px] rounded-full mx-auto object-cover object-top border-2 border-slate-100 shadow-sm"
                              onError={(e) => { e.currentTarget.src = defaultAvatar; }}
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

        return null;
      })}

      {/* Animations */}
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
