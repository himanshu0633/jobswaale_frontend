import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TrustedCompanies from './TrustedCompanies';
import bannerPrice from "./JobSeekerPlanImage/banner-price.png";
import { BASE_API_URL } from '../../context/AuthContext';
import { getWithCache } from '../../utils/apiCache';

const formatPrice = (cost) => `₹${Number(cost || 0).toLocaleString('en-IN')}`;

const getPlanFeatures = (plan) => {
    const features = Array.isArray(plan.mappedFeatures) && plan.mappedFeatures.length
        ? plan.mappedFeatures
        : Array.isArray(plan.features)
            ? plan.features
            : [];
    return features
        .filter((feature) => feature?.value !== 'No')
        .map((feature) => {
            const name = feature?.featureName || feature?.name || feature;
            const value = feature?.value;
            return value && value !== 'Yes' ? `${name} (${value})` : name;
        })
        .filter(Boolean);
};

const JobseekerPlanCard = ({ plan, index }) => {
    const features = getPlanFeatures(plan);
    const isFeatured = Boolean(plan.showBadge) || String(plan.planName || '').toLowerCase() === 'pro' || index === 2;
    const badgeText = plan.badge || 'Most popular';
    const validity = plan.planValidity || (Number(plan.cost || 0) === 0 ? 'Always Free' : 'One Time');

    if (isFeatured) {
        return (
            <div className="w-full md:w-1/2 lg:w-1/4 px-3">
                <div className="inline-block w-full -mt-[50px] bg-[#0047C7] bg-[url('/assets/imgs/theme/bg-featured.svg')] bg-no-repeat bg-[top_right] bg-contain rounded-[26px] p-5 pb-11 px-8 mb-8 shadow-sm relative">
                    <div className="text-end mb-2.5">
                        <span className="inline-block bg-white px-[37px] py-2 rounded-[14px] text-[10px] font-bold text-[#0047C7] uppercase tracking-wide">
                            {badgeText}
                        </span>
                    </div>
                    <div className="inline-block w-full pb-10">
                        <span className="text-[36px] text-white font-semibold leading-[46px] mr-4">{formatPrice(plan.cost)}</span>
                        <span className="text-[17px] leading-[23px] text-white block mb-2">{validity}</span>
                        {plan.unlockCount && (
                            <span className="rounded px-3 py-2 bg-yellow-400 text-white uppercase font-semibold text-[13px]">{plan.unlockCount}</span>
                        )}
                    </div>
                    <div>
                        <h4 className="text-[28px] leading-[34px] font-bold text-white mb-4 uppercase">{plan.planName}</h4>
                        <p className="text-[15px] leading-5 text-white mb-8">
                            {plan.planSubtitle || 'Career support plan'}
                        </p>
                    </div>
                    <ul className="inline-block w-full pb-8">
                        {features.length > 0 ? features.map((item) => (
                            <li key={item} className="inline-block w-full pl-9 bg-[url('/assets/imgs/theme/icons/check-circle-white.svg')] bg-no-repeat bg-left-center mb-3 text-[15px] leading-5 text-white">
                                {item}
                            </li>
                        )) : (
                            <li className="inline-block w-full pl-9 bg-[url('/assets/imgs/theme/icons/check-circle-white.svg')] bg-no-repeat bg-left-center mb-3 text-[15px] leading-5 text-white">
                                Plan benefits available after selection
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full md:w-1/2 lg:w-1/4 px-3">
            <div className="inline-block w-full p-6 border border-[#fff7f0] rounded-[30px] bg-[#fff7f0] mb-8 shadow-sm">
                <div className="inline-block w-full pb-10">
                    <span className="text-[36px] text-[#231d4f] font-semibold leading-[46px] mr-4">{formatPrice(plan.cost)}</span>
                    <span className="text-[17px] leading-[23px] text-[#37404e] block mb-2">{validity}</span>
                    {plan.unlockCount && (
                        <span className="rounded px-3 py-2 bg-yellow-400 text-white uppercase font-semibold text-[13px]">{plan.unlockCount}</span>
                    )}
                </div>
                <div>
                    <h4 className="text-[28px] leading-[34px] font-bold text-[#1f2938] mb-4 uppercase">{plan.planName}</h4>
                    <p className="text-[15px] leading-5 text-[#37404e] mb-8">
                        {plan.planSubtitle || 'Career support plan'}
                    </p>
                </div>
                <ul className="inline-block w-full pb-8">
                    {features.length > 0 ? features.map((item) => (
                        <li key={item} className="inline-block w-full pl-9 bg-[url('/assets/imgs/theme/icons/check-circle.svg')] bg-no-repeat bg-left-center mb-3 text-[15px] leading-5 text-[#37404e]">
                            {item}
                        </li>
                    )) : (
                        <li className="inline-block w-full pl-9 bg-[url('/assets/imgs/theme/icons/check-circle.svg')] bg-no-repeat bg-left-center mb-3 text-[15px] leading-5 text-[#37404e]">
                            Plan benefits available after selection
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

const JobseekerPlan = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await getWithCache(`${BASE_API_URL}/masters/plans?category=Jobseeker&limit=1000`);
                const activePlans = (data || [])
                    .filter((plan) => (plan.status || 'active') === 'active')
                    .sort((a, b) => {
                        const orderA = Number.isFinite(Number(a.displayOrder)) ? Number(a.displayOrder) : Number.MAX_SAFE_INTEGER;
                        const orderB = Number.isFinite(Number(b.displayOrder)) ? Number(b.displayOrder) : Number.MAX_SAFE_INTEGER;
                        if (orderA !== orderB) return orderA - orderB;
                        return Number(a.cost || 0) - Number(b.cost || 0);
                    });
                setPlans(activePlans);
            } catch (err) {
                console.error('Error fetching jobseeker plans:', err);
                setError('Unable to load jobseeker plans right now.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    return (
        <main className="main">

            {/* Pricing Plans Section */}
            <section className="mt-16 mb-12 py-10 inline-block w-full overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">

                    {/* Section Heading */}
                    <div className="w-1/2 mx-auto text-center mb-8">
                        <h3 className="text-[44px] leading-[54px] font-bold text-[#1f2938] mb-8">
                            Choose the plan that's right for you
                        </h3>
                    </div>
                    <div className="max-w-[650px] mx-auto text-center">
                        <p className="mb-9 text-base leading-6 text-[rgba(8,10,40,0.5)] ">
                            Start saving time today and choose your best plan
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="mt-32 md:mt-12">
                        {loading ? (
                            <div className="flex flex-wrap -mx-3 animate-pulse w-full">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-full md:w-1/2 lg:w-1/4 px-3 mb-8">
                                        <div className="inline-block w-full p-6 border border-slate-200 rounded-[30px] bg-slate-50 shadow-sm min-h-[380px]">
                                            {/* Price Section */}
                                            <div className="space-y-2 mb-8">
                                                <div className="h-10 w-24 bg-slate-200 rounded" />
                                                <div className="h-4 w-16 bg-slate-200 rounded" />
                                            </div>
                                            {/* Title Section */}
                                            <div className="space-y-3 mb-8">
                                                <div className="h-6 w-32 bg-slate-200 rounded" />
                                                <div className="h-4 w-44 bg-slate-200 rounded" />
                                            </div>
                                            {/* Features Checklist */}
                                            <div className="space-y-4">
                                                {[1, 2, 3, 4].map((f) => (
                                                    <div key={f} className="flex items-center gap-3">
                                                        <div className="h-4 w-4 rounded-full bg-slate-200 shrink-0" />
                                                        <div className="h-3 w-3/4 bg-slate-200 rounded" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="rounded-[18px] border border-rose-100 bg-rose-50 px-6 py-8 text-center text-sm font-semibold text-rose-700">
                                {error}
                            </div>
                        ) : plans.length === 0 ? (
                            <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm font-semibold text-slate-500">
                                No active jobseeker plans found.
                            </div>
                        ) : (
                            <div className="flex flex-wrap -mx-3">
                                {plans.map((plan, index) => (
                                    <JobseekerPlanCard key={plan._id || plan.planName} plan={plan} index={index} />
                                ))}
                            </div>
                        )}
                        </div>
                </div>
            </section>

            {/* Invest in Yourself Section */}
            <section className="py-10 mt-24 inline-block w-full overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-wrap -mx-3">

                        {/* Left Image */}
                        <div className="w-full lg:w-1/2 px-3">
                            <div className="relative inline-block w-full -ml-[50px] pt-11 pr-11 text-center">
                                <div className="absolute top-0 right-0 w-[159px] h-[130px] bg-[url('/assets/imgs/theme/bg-dot.svg')] bg-no-repeat z-0"></div>
                                <figure className="relative z-[2]">
                                    <img
                                        alt="jobhub"
                                        src={bannerPrice}
                                        className="rounded-tl-[100px] rounded-br-[100px] shadow-[0px_20px_60px_-6px_rgba(0,0,0,0.04)] max-w-full"
                                    />
                                </figure>
                                <span className="absolute -bottom-[45px] -right-[45px] h-[39px] w-[39px] rounded-full bg-[#9fdbe9]"></span>
                            </div>
                        </div>

                        {/* Right Info */}
                        <div className="w-full lg:w-1/2 px-3">
                            <div className="inline-block w-full pl-[90px] pt-8">
                                <h5 className="text-[36px] leading-[44px] font-bold text-[#1f2938] mb-8 mt-2.5">
                                    Invest in Yourself and Open the Door to Better Opportunities
                                </h5>
                                <p className="mb-3 text-[#475569] text-sm leading-6">
                                    Investing in your career is one of the most valuable decisions you can make. Our premium plans are designed to help you stand out in a competitive job market by increasing your visibility to recruiters and giving you access to tools that support your professional growth.
                                </p>
                                <p className="text-[#475569] text-sm leading-6">
                                    Whether you're searching for your first role, aiming for a career change, or pursuing new opportunities, our features are built to help you connect with the right employers faster. Take advantage of enhanced exposure, exclusive opportunities, and resources that bring you one step closer to achieving your career goals.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA Blue Banner Section */}
            <section className="bg-[#ecf4ff] py-[78px] mt-24 mb-12 inline-block w-full overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h3 className="text-[44px] leading-[54px] font-bold text-[#1f2938] mb-5">
            Your Career Deserves More<br />Than Just Applications
        </h3>

        <div className="flex flex-wrap -mx-3 items-center">
            <div className="w-full lg:w-1/2 px-3">
                <p className="text-[#4b5563] text-sm leading-6">
                    Take control of your career journey and move closer to the role you've been working toward.
                </p>
            </div>

            <div className="w-full lg:w-1/2 px-3 lg:pl-[100px] mt-6 lg:mt-0">
                <div className="inline-block mr-5">
                    <a
                        href="#"
                        className="inline-flex items-center justify-center bg-[#0047C7] hover:bg-[#0052cc] text-white rounded-[10px] py-3 px-6 font-semibold text-base transition-all duration-200 hover:-translate-y-0.5"
                    >
                        Contact us
                    </a>
                </div>

                <a
                    href="#"
                    className="inline-flex items-center justify-center border border-[rgba(6,18,36,0.1)] rounded-[10px] bg-white text-[#37404e] hover:bg-[#0047C7] hover:text-white py-3 px-6 text-base font-semibold transition-all duration-200 hover:-translate-y-[3px] pr-[42px] bg-[url('/assets/imgs/theme/icons/chevron-right.svg')] bg-no-repeat bg-[right_19px_center] hover:bg-[url('/assets/imgs/theme/icons/chevron-right-light.svg')]"
                >
                    Learn more
                </a>
            </div>
        </div>
    </div>
</section>

            {/* Trusted Companies Branding Slider */}
          <TrustedCompanies/>

        </main>
    );
};

export default JobseekerPlan;
