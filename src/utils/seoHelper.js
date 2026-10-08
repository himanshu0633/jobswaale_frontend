import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';

export const SITE_DOMAIN = 'https://jobswaale.com';

export const DEFAULT_PAGES_SEO = [
  {
    key: 'home',
    slug: 'home',
    label: 'Home Page',
    path: '/',
    fullUrl: 'https://jobswaale.com/',
    defaultTitle: 'JobsWaale - Find Dream Jobs & Hire Verified Candidates in India',
    defaultDescription: 'Connect with top employers and find verified jobs in India. JobsWaale helps jobseekers get hired faster and helps employers recruit top talent.',
    defaultKeywords: 'job portal, jobs in india, find jobs, hire candidates, recruitment, job search, careers'
  },
  {
    key: 'jobs',
    slug: 'jobs',
    label: 'Jobs Listing',
    path: '/jobs',
    fullUrl: 'https://jobswaale.com/jobs',
    defaultTitle: 'Latest Job Openings & Vacancies - Search & Apply Online | JobsWaale',
    defaultDescription: 'Explore thousands of full-time, part-time, remote, and walk-in job vacancies across India on JobsWaale. Filter by category, location, and experience.',
    defaultKeywords: 'latest jobs, job search, vacancy in india, private jobs, it jobs, marketing jobs, apply online'
  },
  {
    key: 'employers',
    slug: 'employers',
    label: 'Employers Directory',
    path: '/employers',
    fullUrl: 'https://jobswaale.com/employers',
    defaultTitle: 'Top Hiring Companies & Employer Directory | JobsWaale',
    defaultDescription: 'Browse top companies and employers hiring now on JobsWaale. View company profiles, open positions, employee reviews, and culture.',
    defaultKeywords: 'employers directory, hiring companies, top employers in india, company profiles, job vacancies'
  },
  {
    key: 'employer-plan',
    slug: 'employer-plan',
    label: 'Employer Hiring Plans',
    path: '/employer-plan',
    fullUrl: 'https://jobswaale.com/employer-plan',
    defaultTitle: 'Employer Hiring Plans & Pricing - Post Jobs & Access Candidates | JobsWaale',
    defaultDescription: 'Choose flexible employer hiring packages on JobsWaale. Post job listings, unlock candidate resumes, and recruit fast with powerful recruitment plans.',
    defaultKeywords: 'employer plans, pricing, job posting packages, resume search plans, hire talent, recruitment subscription'
  },
  {
    key: 'about',
    slug: 'about',
    label: 'About Us',
    path: '/about',
    fullUrl: 'https://jobswaale.com/about',
    defaultTitle: 'About JobsWaale - Empowering Careers & Connecting Talent Across India',
    defaultDescription: "Learn about JobsWaale's mission, values, and journey in transforming employment and recruitment across India with transparency and innovation.",
    defaultKeywords: 'about jobswaale, company mission, career portal india, our team, employment platform'
  },
  {
    key: 'terms-conditions',
    slug: 'terms-conditions',
    label: 'Terms & Conditions',
    path: '/terms-conditions',
    fullUrl: 'https://jobswaale.com/terms-conditions',
    defaultTitle: 'Terms & Conditions | JobsWaale',
    defaultDescription: 'Read our platform policies, terms of service, user agreements, and platform guidelines.',
    defaultKeywords: 'terms of service, legal terms, platform agreement, user rules'
  },
  {
    key: 'privacy-policy',
    slug: 'privacy-policy',
    label: 'Privacy Policy',
    path: '/privacy-policy',
    fullUrl: 'https://jobswaale.com/privacy-policy',
    defaultTitle: 'Privacy Policy - Data Protection & Security | JobsWaale',
    defaultDescription: 'JobsWaale privacy policy outlines how we collect, store, and safeguard your personal data, resume information, and privacy rights.',
    defaultKeywords: 'privacy policy, data security, user privacy, cookies policy'
  },
  {
    key: 'contact',
    slug: 'contact',
    label: 'Contact Us',
    path: '/contact',
    fullUrl: 'https://jobswaale.com/contact',
    defaultTitle: 'Contact JobsWaale - Customer Support & Help Desk',
    defaultDescription: 'Get in touch with the JobsWaale support team for inquiries, employer assistance, or feedback.',
    defaultKeywords: 'contact us, customer support, help desk, jobswaale office'
  },
  {
    key: 'jobseeker-plan',
    slug: 'jobseeker-plan',
    label: 'Jobseeker Plans',
    path: '/jobseeker-plan',
    fullUrl: 'https://jobswaale.com/jobseeker-plan',
    defaultTitle: 'Jobseeker Premium Plans & Career Boost | JobsWaale',
    defaultDescription: 'Boost your job search with JobsWaale Jobseeker plans. Get highlighted profile, direct recruiter reach, and application tracking.',
    defaultKeywords: 'jobseeker plans, premium account, resume boost, direct recruiter reach'
  }
];

export const DEFAULT_PAGES_MAP = DEFAULT_PAGES_SEO.reduce((acc, page) => {
  acc[page.slug] = page;
  return acc;
}, {});

/**
 * Updates DOM head meta tags dynamically.
 */
export const updateDocumentMeta = ({ title, description, keywords, canonicalUrl, ogImage }) => {
  if (typeof document === 'undefined') return;

  // 1. Update Document Title
  if (title) {
    document.title = title;
  }

  // 2. Helper to set/create <meta> tag
  const setMetaTag = (attrName, attrVal, content) => {
    if (content === undefined || content === null) return;
    let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrVal);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // 3. Helper to set/create <link rel="..."> tag
  const setLinkTag = (rel, href) => {
    if (!href) return;
    let element = document.querySelector(`link[rel="${rel}"]`);
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  };

  // Standard Meta Tags
  if (description) setMetaTag('name', 'description', description);
  if (keywords) setMetaTag('name', 'keywords', keywords);

  // Open Graph Meta Tags
  if (title) setMetaTag('property', 'og:title', title);
  if (description) setMetaTag('property', 'og:description', description);
  const resolvedUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : SITE_DOMAIN);
  setMetaTag('property', 'og:url', resolvedUrl);
  if (ogImage) setMetaTag('property', 'og:image', ogImage);

  // Twitter Meta Tags
  if (title) setMetaTag('name', 'twitter:title', title);
  if (description) setMetaTag('name', 'twitter:description', description);
  if (ogImage) setMetaTag('name', 'twitter:image', ogImage);

  // Canonical link
  setLinkTag('canonical', resolvedUrl);
};

// In-memory cache for SEO data to avoid unnecessary roundtrips
const seoCache = {};

/**
 * React hook for public website pages that fetches and applies SEO settings.
 */
export const usePageSEO = (rawSlug) => {
  const slug = rawSlug === '/' || !rawSlug ? 'home' : String(rawSlug).replace(/^\/+|\/+$/g, '');

  useEffect(() => {
    let isMounted = true;
    const defaultData = DEFAULT_PAGES_MAP[slug] || {
      defaultTitle: 'JobsWaale - Online Job Portal',
      defaultDescription: 'Find jobs, hire candidates and explore top opportunities across India with JobsWaale.',
      defaultKeywords: 'jobs, hiring, recruitment, job search'
    };

    // Immediately apply defaults or cached values so there's no flicker
    const cached = seoCache[slug];
    if (cached) {
      updateDocumentMeta(cached);
    } else {
      updateDocumentMeta({
        title: defaultData.defaultTitle,
        description: defaultData.defaultDescription,
        keywords: defaultData.defaultKeywords,
        canonicalUrl: defaultData.fullUrl || `${SITE_DOMAIN}/${slug === 'home' ? '' : slug}`
      });
    }

    // Fetch latest from backend DB
    const fetchPageSEO = async () => {
      try {
        const res = await axios.get(`${BASE_API_URL}/cms/public/pages/${slug}`);
        if (!isMounted) return;

        const data = res.data;
        if (data) {
          const finalSEO = {
            title: data.seoTitle || data.title || defaultData.defaultTitle,
            description: data.seoDescription || defaultData.defaultDescription,
            keywords: data.seoKeywords || defaultData.defaultKeywords,
            canonicalUrl: defaultData.fullUrl || `${SITE_DOMAIN}/${slug === 'home' ? '' : slug}`,
            ogImage: data.featuredImage || data.bannerImage || ''
          };

          seoCache[slug] = finalSEO;
          updateDocumentMeta(finalSEO);
        }
      } catch {
        // Fallback already applied
      }
    };

    fetchPageSEO();

    return () => {
      isMounted = false;
    };
  }, [slug]);
};
