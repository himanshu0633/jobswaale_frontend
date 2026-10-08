import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../context/AuthContext';
import { usePageSEO } from '../../utils/seoHelper';
import { DEFAULT_PRIVACY_POLICY_DOC } from '../../utils/legalPolicyDefaults';
import CmsBannerSlot from '../../components/CmsBannerSlot';
import { getPageBanners } from '../../utils/cmsHelper';

export const PrivacyPolicy = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hook for dynamic Title and Meta tags from SEO Manager
  usePageSEO('privacy', pageData);

  useEffect(() => {
    let isMounted = true;
    const fetchPage = async () => {
      try {
        const res = await axios.get(`${BASE_API_URL}/cms/public/pages/privacy-policy`);
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
        <div className="pt-[50px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-10 w-2/3 max-w-md bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-40 bg-slate-100 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-full max-w-2xl bg-slate-100 rounded animate-pulse mb-8"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-20">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="space-y-3 animate-pulse">
              <div className="h-7 w-1/3 bg-slate-200 rounded"></div>
              <div className="h-4 w-full bg-slate-100 rounded"></div>
              <div className="h-4 w-4/5 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Extract structured document data
  const projectData = pageData?.projectData || {};
  const docTitle = pageData?.title || DEFAULT_PRIVACY_POLICY_DOC.title;

  const lastUpdated = projectData.lastUpdated || (
    pageData?.updatedAt
      ? new Date(pageData.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : DEFAULT_PRIVACY_POLICY_DOC.lastUpdated
  );

  const introText = projectData.introText !== undefined
    ? projectData.introText
    : DEFAULT_PRIVACY_POLICY_DOC.introText;

  const clauses = (projectData.clauses && Array.isArray(projectData.clauses) && projectData.clauses.length > 0)
    ? projectData.clauses
    : DEFAULT_PRIVACY_POLICY_DOC.clauses;

  const banners = pageData ? getPageBanners(pageData) : [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow">
        {/* Top Banner Slot if defined */}
        {banners.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <CmsBannerSlot banners={banners} slot="top" pageTitle={docTitle} />
          </div>
        )}

        {/* Page Intro Header */}
        <section className="pt-[50px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <h3 className="text-[36px] sm:text-[44px] font-bold text-[#1f2938] leading-[44px] sm:leading-[54px] mb-4 sm:mb-5">
                {docTitle}
              </h3>
              {lastUpdated && (
                <p className="mb-[10px] text-[#88929b] text-base">
                  <em>Last Updated: {lastUpdated}</em>
                </p>
              )}
              {introText && (
                <p className="mb-[40px] text-[#88929b] text-base leading-relaxed max-w-4xl">
                  {introText}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Policy Content Points */}
        <section className="mb-[80px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {clauses.map((clause, idx) => {
              const hasItems = Array.isArray(clause.items) && clause.items.length > 0;

              return (
                <div key={clause.id || idx} className="mb-[40px]">
                  {clause.title && (
                    <h4 className="text-[22px] sm:text-[28px] font-bold text-[#1f2938] leading-[30px] sm:leading-[34px] mb-3">
                      {clause.title}
                    </h4>
                  )}

                  {clause.description && (
                    <p className={`text-[#475569] text-base leading-relaxed ${hasItems ? 'mb-3' : ''}`}>
                      {clause.description}
                    </p>
                  )}

                  {hasItems && (
                    <ul className="list-disc pl-6 space-y-2 text-[#475569] text-base leading-relaxed">
                      {clause.items.map((item, itemIdx) => {
                        const label = typeof item === 'object' ? item.label : '';
                        const text = typeof item === 'object' ? item.text : item;

                        return (
                          <li key={itemIdx}>
                            {label && <strong>{label} </strong>}
                            {text}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;