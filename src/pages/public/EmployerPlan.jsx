import React from 'react';
import { Link } from 'react-router-dom';

const EmployerPlan = () => {
    return (
        <main className="py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Header Promo Header Banner */}
                <div className="flex flex-wrap items-center mb-8 gap-3">

                    {/* Left Col (9/12) */}
                    <div className="w-full lg:w-3/4">

                        {/* Hero Section */}
                        <div className="text-center mb-5">
                            <h3 className="text-[44px] leading-[54px] font-bold text-[#1f2938] mb-2">
                                Hire <span className="text-[#0047C7]">Faster.</span> Hire Smarter, Hire <span className="text-[#FF6B00]">Better.</span>
                            </h3>
                            <p className="text-[20px] leading-6 text-[#475569]">Post Jobs, Unlock Candidate Contacts &amp; Hire Across India</p>
                        </div>

                        {/* Benefits Horizontal Icon Row */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5 mt-5 pt-2">
                            <div className="p-3 bg-white border border-[#ececec] rounded flex items-center justify-center gap-3">
                                <svg className="w-5 h-5 text-[#198754]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-semibold text-[#1f2938] leading-tight">Verified Candidates</span>
                            </div>
                            <div className="p-3 bg-white border border-[#ececec] rounded flex items-center justify-center gap-3">
                                <svg className="w-5 h-5 text-[#0047C7]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                <span className="text-xs font-semibold text-[#1f2938] leading-tight">Direct Contact Access</span>
                            </div>
                            <div className="p-3 bg-white border border-[#ececec] rounded flex items-center justify-center gap-3">
                                <svg className="w-5 h-5 text-[#FF6B00]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-semibold text-[#1f2938] leading-tight">Faster Hiring Process</span>
                            </div>
                            <div className="p-3 bg-white border border-[#ececec] rounded h-full flex items-center justify-center gap-3">
                                <svg className="w-5 h-5 text-[#198754]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                                </svg>
                                <span className="text-xs font-semibold text-[#1f2938] leading-tight">Dedicated Support</span>
                            </div>
                            <div className="col-span-2 md:col-span-1 p-3 bg-white border border-[#ececec] rounded h-full flex items-center justify-center gap-3">
                                <svg className="w-5 h-5 text-[#0047C7]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707.707-.707A1 1 0 0115 3v4a1 1 0 01-2 0V5.414l-.707.707A1 1 0 0111.586 4.5l.707-.707L12 3a1 1 0 011-1zm0 8a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-semibold text-[#1f2938] leading-tight">Employer Dashboard</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Col (3/12) */}
                    <div className="w-full lg:w-auto lg:flex-1 text-right">
                        <div className="flex flex-col items-center p-3 border border-yellow-400 shadow-sm rounded gap-3 text-center" style={{ backgroundColor: '#fff9f5' }}>
                            <div className="text-5xl text-[#FF6B00] flex items-center text-center">
                                <svg className="w-8 h-8 text-[#FF6B00]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                                    <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                                </svg>
                                <span className="text-xs font-bold text-[#1f2938] text-base ms-3 ml-3">New to JobsWaale?</span>
                            </div>
                            <div className="font-bold text-[#1f2938] text-xl leading-tight">
                                First Job Post <span className="text-[#FF6B00] text-5xl block">FREE</span>
                            </div>
                            <p className="leading-tight font-semibold mb-2 text-sm text-[#475569]">Post a Job Today &amp; Start Receiving Applications Immediately</p>
                            <a href="#" className="inline-block text-white font-semibold px-3 py-2 text-sm rounded-md" style={{ backgroundColor: '#004bbf' }}>
                                Post Your First Job Free
                            </a>
                        </div>
                    </div>
                </div>

                {/* Promo Gift Banner */}
                <div className="p-4 border-2 border-yellow-400 rounded shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-4" style={{ backgroundColor: '#fff9f5' }}>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="w-full md:w-auto text-center md:w-24">
                            <img src="assets/imgs/gift.png" width="120" alt="" />
                        </div>
                        <div className="md:w-auto">
                            <h5 className="font-bold text-[#1f2938] mb-1">Welcome to JobsWaale!</h5>
                            <h4 className="font-bold text-[#1f2938] mb-1 text-[28px] leading-[34px]">
                                Your First Job Post is <span className="text-[#FF6B00]">FREE</span>
                            </h4>
                            <p className="font-semibold mb-0 text-[#475569] text-sm">Post your first job for free and start hiring the best talent.</p>
                        </div>
                        <div className="border-l border-[#ececec] pl-4 md:pl-4">
                            <p className="font-semibold mb-0 text-[#475569] text-sm">After your first free post, unlock more with our affordable plans.</p>
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────────
                    PLAN ROW 1: WEEKLY PLAN
                ───────────────────────────────────────── */}
                <div className="border border-[#ececec] rounded mb-8 p-3">
                    <div className="flex flex-wrap items-stretch gap-3">

                        {/* LEFT BADGE */}
                        <div className="w-full lg:w-[23%] flex items-center">
                            <div className="text-white flex flex-col justify-center p-4 h-full w-full rounded"
                                style={{
                                    backgroundColor: '#0038a8',
                                    clipPath: 'polygon(0 0, 82% 0, 98% 50%, 82% 100%, 0 100%)',
                                }}>
                                <div className="text-xl mb-3 font-semibold">
                                    <div className="text-[#0047C7] text-center bg-white rounded-full w-7 h-7 leading-6 text-sm font-bold">1</div>
                                </div>
                                <div className="text-xl mb-2 font-semibold flex items-center gap-1">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    WEEKLY PLAN
                                </div>
                                <p className="mb-0 opacity-75 text-sm">Best for Quick Hiring</p>
                            </div>
                        </div>

                        {/* MIDDLE PLANS */}
                        <div className="w-full lg:flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full">

                                <div className="p-3 bg-white border border-[#ececec] rounded h-full flex flex-col justify-center text-center">
                                    <div className="text-3xl font-bold text-[#1f2938] mb-1">₹149</div>
                                    <div className="font-semibold text-[#88929b]">10 Unlocks</div>
                                </div>

                                <div className="p-3 bg-white border border-[#ececec] rounded h-full flex flex-col justify-between text-center">
                                    <div className="my-auto">
                                        <div className="text-3xl font-bold text-[#1f2938] mb-1">₹249</div>
                                        <div className="font-semibold text-[#88929b] text-sm">20 Unlocks</div>
                                    </div>
                                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold py-2 px-3 rounded mt-2">
                                        2 Job Posts <strong className="uppercase">Free</strong>
                                    </span>
                                </div>

                                <div className="p-3 bg-white border border-[#ececec] rounded h-full flex flex-col justify-center">
                                    <ul className="list-none mb-0 flex flex-col gap-2 text-[#88929b] text-sm">
                                        <li className="flex items-center">
                                            <svg className="w-4 h-4 text-[#0047C7] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Direct Contact Access
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-4 h-4 text-[#0047C7] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            7 Days Validity
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-4 h-4 text-[#0047C7] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Employer Dashboard
                                        </li>
                                    </ul>
                                </div>

                            </div>
                        </div>

                        {/* RIGHT OFFER CARD */}
                        <div className="w-full lg:w-[14%] flex items-center">
                            <div className="text-center border-0 w-full rounded" style={{ backgroundColor: '#041e5b' }}>
                                <div className="p-2">
                                    <h4 className="text-sm uppercase text-yellow-400 font-bold mb-0">First Time Offer</h4>
                                    <p className="text-white text-sm mb-1">Weekly Plan</p>
                                    <div className="text-4xl font-bold text-[#FF6B00]">FREE</div>
                                    <p className="text-white mb-0 text-sm leading-tight">
                                        with your<br /> First Job Post
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ─────────────────────────────────────────
                    PLAN ROW 2: MONTHLY PLAN
                ───────────────────────────────────────── */}
                <div className="border border-[#ececec] rounded mb-8 p-3">
                    <div className="flex flex-wrap items-stretch gap-3">

                        {/* LEFT BADGE */}
                        <div className="w-full lg:w-[23%] flex items-center">
                            <div className="text-white flex flex-col justify-center p-4 h-full w-full rounded"
                                style={{
                                    backgroundColor: '#FF6B00',
                                    clipPath: 'polygon(0 0, 82% 0, 98% 50%, 82% 100%, 0 100%)',
                                }}>
                                <div className="text-xl mb-3 font-semibold">
                                    <div className="text-[#FF6B00] text-center bg-white rounded-full w-7 h-7 leading-6 text-sm font-bold">2</div>
                                </div>
                                <div className="text-xl mb-2 font-semibold flex items-center gap-1">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    MONTHLY PLAN
                                </div>
                                <p className="mb-0 opacity-75 text-sm">Best for Active Hiring</p>
                            </div>
                        </div>

                        {/* MIDDLE PLANS */}
                        <div className="w-full lg:w-[48%]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">

                                <div className="p-3 bg-white border border-[#ececec] rounded h-full flex flex-col justify-between text-center">
                                    <div>
                                        <div className="text-3xl font-bold text-[#1f2938] mb-1">₹499</div>
                                        <div className="font-semibold text-[#88929b] text-sm">40 Unlocks</div>
                                    </div>
                                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold py-2 px-3 rounded mt-3">
                                        3 Job Posts <strong className="uppercase">Free</strong>
                                    </span>
                                </div>

                                <div className="p-3 rounded h-full flex flex-col justify-between text-center relative"
                                    style={{ border: '2px solid #FF6B00', backgroundColor: '#fff9f5' }}>
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold px-2 py-1 text-[0.65rem] uppercase"
                                        style={{ backgroundColor: '#FF6B00', borderRadius: '50rem' }}>
                                        MOST POPULAR
                                    </span>
                                    <div className="pt-2">
                                        <div className="text-3xl font-bold text-[#1f2938] mb-1">₹999</div>
                                        <div className="font-semibold text-[#88929b] text-sm">90 Unlocks</div>
                                    </div>
                                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold py-2 px-3 rounded mt-3">
                                        5 Job Posts <strong className="uppercase">Free</strong>
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* RIGHT FEATURES */}
                        <div className="w-full lg:flex-1 flex items-center">
                            <div className="p-4 bg-white border border-[#ececec] rounded w-full">
                                <ul className="list-none mb-0 flex flex-col gap-2 text-[#88929b] text-sm">
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Direct Contact Access
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Employer Dashboard
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Priority Support
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ─────────────────────────────────────────
                    PLAN ROW 3: QUARTERLY PLAN
                ───────────────────────────────────────── */}
                <div className="border border-[#ececec] rounded mb-8 p-3">
                    <div className="flex flex-wrap items-stretch gap-3">

                        {/* LEFT BADGE */}
                        <div className="w-full lg:w-[23%] flex items-center">
                            <div className="text-white flex flex-col justify-center p-4 h-full w-full rounded"
                                style={{
                                    backgroundColor: '#FF6B00',
                                    clipPath: 'polygon(0 0, 82% 0, 98% 50%, 82% 100%, 0 100%)',
                                }}>
                                <div className="text-xl mb-3 font-semibold">
                                    <div className="text-[#FF6B00] text-center bg-white rounded-full w-7 h-7 leading-6 text-sm font-bold">3</div>
                                </div>
                                <div className="text-xl mb-2 font-semibold flex items-center gap-1">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    QUARTERLY PLAN
                                </div>
                                <p className="mb-0 opacity-75 text-sm">Best for Growing Companies</p>
                            </div>
                        </div>

                        {/* MIDDLE PLANS */}
                        <div className="w-full lg:w-[48%]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">

                                <div className="p-3 bg-white border border-[#ececec] rounded h-full flex flex-col justify-between text-center">
                                    <div>
                                        <div className="text-3xl font-bold text-[#1f2938] mb-1">₹1,299</div>
                                        <div className="font-semibold text-[#88929b] text-sm">75 Unlocks</div>
                                    </div>
                                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold py-2 px-3 rounded mt-3">
                                        3 Job Posts <strong className="uppercase">Free</strong>
                                    </span>
                                </div>

                                <div className="p-3 bg-white rounded h-full flex flex-col justify-between text-center relative"
                                    style={{ border: '2px solid #FF6B00' }}>
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold px-2 py-1 text-[0.65rem] uppercase"
                                        style={{ backgroundColor: '#FF6B00', borderRadius: '50rem' }}>
                                        BEST VALUE
                                    </span>
                                    <div className="pt-2">
                                        <div className="text-3xl font-bold text-[#1f2938] mb-1">₹2,499</div>
                                        <div className="font-semibold text-[#88929b] text-sm">175 Unlocks</div>
                                    </div>
                                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold py-2 px-3 rounded mt-3">
                                        5 Job Posts <strong className="uppercase">Free</strong>
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* RIGHT FEATURES */}
                        <div className="w-full lg:flex-1 flex items-center">
                            <div className="p-3 bg-white border border-[#ececec] rounded w-full">
                                <ul className="list-none mb-0 flex flex-col gap-2 text-[#88929b] text-sm">
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Lower Cost Per Unlock
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Priority Support
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Faster Hiring Assistance
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Candidate Tracking
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Detailed Insights
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ─────────────────────────────────────────
                    PLAN ROW 4: YEARLY PLAN
                ───────────────────────────────────────── */}
                <div className="border border-[#ececec] rounded mb-8 p-3">
                    <div className="flex flex-wrap items-stretch gap-3">

                        {/* LEFT BADGE */}
                        <div className="w-full lg:w-[23%] flex items-center">
                            <div className="text-white flex flex-col justify-center p-4 h-full w-full rounded"
                                style={{
                                    backgroundColor: '#FF6B00',
                                    clipPath: 'polygon(0 0, 82% 0, 98% 50%, 82% 100%, 0 100%)',
                                }}>
                                <div className="text-xl mb-3 font-semibold">
                                    <div className="text-[#FF6B00] text-center bg-white rounded-full w-7 h-7 leading-6 text-sm font-bold">4</div>
                                </div>
                                <div className="text-xl mb-2 font-semibold flex items-center gap-1">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    YEARLY PLAN
                                </div>
                                <p className="mb-0 opacity-75 text-sm">Best for Long-Term Hiring</p>
                            </div>
                        </div>

                        {/* MIDDLE PLANS */}
                        <div className="w-full lg:w-[48%]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">

                                <div className="p-3 bg-white border border-[#ececec] rounded h-full flex flex-col justify-between text-center">
                                    <div>
                                        <div className="text-3xl font-bold text-[#1f2938] mb-1">₹4,999</div>
                                        <div className="font-semibold text-[#88929b] text-sm">250 Unlocks</div>
                                    </div>
                                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold py-2 px-3 rounded mt-3">
                                        5 Job Posts <strong className="uppercase">Free</strong>
                                    </span>
                                </div>

                                <div className="p-3 bg-white rounded h-full flex flex-col justify-between text-center relative"
                                    style={{ border: '2px solid #FF6B00' }}>
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold px-2 py-1 text-[0.65rem] uppercase"
                                        style={{ backgroundColor: '#FF6B00', borderRadius: '50rem' }}>
                                        ENTERPRISE CHOICE
                                    </span>
                                    <div className="pt-2">
                                        <div className="text-3xl font-bold text-[#1f2938] mb-1">₹9,999</div>
                                        <div className="font-semibold text-[#88929b] text-sm">500 Unlocks</div>
                                    </div>
                                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold py-2 px-3 rounded mt-3">
                                        10 Job Posts <strong className="uppercase">Free</strong>
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* RIGHT FEATURES */}
                        <div className="w-full lg:flex-1 flex items-center">
                            <div className="p-3 bg-white border border-[#ececec] rounded w-full">
                                <ul className="list-none mb-0 flex flex-col gap-2 text-[#88929b] text-sm">
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Lowest Cost Per Unlock
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Dedicated Account Manager
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Recruitment Reports
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Advanced Candidate Insights
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-4 h-4 text-[#FF6B00] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Long-Term Hiring Planning
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ─────────────────────────────────────────
                    SECTION 5: MANAGED RECRUITMENT SERVICES
                ───────────────────────────────────────── */}
                <div className="text-center mb-10 mt-14">
                    <span className="inline-block bg-blue-100 text-[#0047C7] py-2 px-3 mb-2 uppercase font-bold text-xs rounded">
                        VALUE ADDED SERVICES
                    </span>
                    <h4 className="font-bold text-[#1f2938] mb-1 text-[28px] leading-[34px]">MANAGED RECRUITMENT SERVICES</h4>
                    <p className="text-[#475569] text-sm">We Find, Screen &amp; Shortlist Candidates For You — Share your JD and let our expert team handle the rest.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-14">

                    {/* Card 1: Fast Hiring */}
                    <div className="border border-[#ececec] rounded p-3 bg-white flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center justify-center rounded-full mx-auto mb-3 bg-blue-100 text-[#0047C7]"
                                style={{ width: 60, height: 60 }}>
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h6 className="font-bold text-[#0047C7] mb-0 text-base">FAST HIRING</h6>
                                <span className="text-[#88929b] text-xs">Best for Immediate Hiring</span>
                            </div>
                            <div className="text-center py-3 border-b border-[#ececec] mb-3">
                                <div className="text-3xl font-bold text-[#1f2938]">1</div>
                                <div className="mb-3 text-[#88929b] text-sm">Shortlisted Candidate</div>
                                <div className="text-3xl font-bold text-[#0047C7]">₹5,000</div>
                            </div>
                            <ul className="list-none mb-4 flex flex-col gap-1 text-sm text-[#475569]">
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Candidate Sourcing
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Initial Screening
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Resume Verification
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Contact Details Shared
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Hiring Consultation
                                </li>
                            </ul>
                        </div>
                        <div className="bg-[#0047C7] text-white text-xs font-semibold py-2 text-center rounded">
                            Delivery: 3-5 Working Days
                        </div>
                    </div>

                    {/* Card 2: Growth Hiring (Most Popular) */}
                    <div className="border rounded p-3 flex flex-col justify-between h-full relative"
                        style={{ border: '2px solid #FF6B00', backgroundColor: '#fff9f5' }}>
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold px-3 py-1 text-[0.65rem] uppercase"
                            style={{ backgroundColor: '#FF6B00', borderRadius: '50rem' }}>
                            MOST POPULAR
                        </span>
                        <div className="pt-2">
                            <div className="flex items-center justify-center rounded-full mx-auto mb-3 bg-yellow-100 text-[#FF6B00]"
                                style={{ width: 60, height: 60 }}>
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h6 className="font-bold text-[#FF6B00] mb-0 text-base">GROWTH HIRING</h6>
                                <span className="text-[#88929b] text-xs">Perfect for Multiple Options</span>
                            </div>
                            <div className="text-center py-3 border-b border-[#ececec] mb-3">
                                <div className="text-3xl font-bold text-[#1f2938]">5</div>
                                <div className="mb-3 text-[#88929b] text-sm">Shortlisted Candidate</div>
                                <div className="text-3xl font-bold text-[#FF6B00]">₹20,000</div>
                                <span className="text-xs text-[#FF6B00] font-bold">(Save ₹5,000)</span>
                            </div>
                            <ul className="list-none mb-4 flex flex-col gap-1 text-sm text-[#475569]">
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#FF6B00] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Everything in Fast Hiring
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#FF6B00] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Advanced Screening
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#FF6B00] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Skill &amp; Experience Matching
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#FF6B00] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Availability Confirmation
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#FF6B00] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Interview Scheduling Support
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#FF6B00] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Dedicated Recruiter
                                </li>
                            </ul>
                        </div>
                        <div className="text-white text-xs font-semibold py-2 text-center rounded"
                            style={{ backgroundColor: '#FF6B00' }}>
                            Delivery: 5-7 Working Days
                        </div>
                    </div>

                    {/* Card 3: Business Hiring */}
                    <div className="border border-[#ececec] rounded p-3 bg-white flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center justify-center rounded-full mx-auto mb-3 bg-blue-100 text-[#0047C7]"
                                style={{ width: 60, height: 60 }}>
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4zm1 2a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h6 className="font-bold text-[#0047C7] mb-0 text-base">BUSINESS HIRING</h6>
                                <span className="text-[#88929b] text-xs">For Growing Companies</span>
                            </div>
                            <div className="text-center py-3 border-b border-[#ececec] mb-3">
                                <div className="text-3xl font-bold text-[#1f2938]">10</div>
                                <div className="mb-3 text-[#88929b] text-sm">Shortlisted Candidate</div>
                                <div className="text-3xl font-bold text-[#0047C7]">₹40,000</div>
                                <span className="text-xs text-[#0047C7] font-bold">(Save ₹10,000)</span>
                            </div>
                            <ul className="list-none mb-4 flex flex-col gap-1 text-sm text-[#475569]">
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Priority Candidate Sourcing
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Dedicated Recruiter
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Multiple Position Support
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Weekly Hiring Updates
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Interview Coordination
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Recruiting Pipeline
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-[#0047C7] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Priority Employer Support
                                </li>
                            </ul>
                        </div>
                        <div className="bg-[#0047C7] text-white text-xs font-semibold py-2 text-center rounded">
                            Delivery: 7-10 Working Days
                        </div>
                    </div>

                    {/* Card 4: Enterprise Talent Partner */}
                    <div className="border-0 rounded p-3 text-white flex flex-col justify-between h-full"
                        style={{ background: 'linear-gradient(135deg, #0d1e3d 0%, #001026 100%)' }}>
                        <div>
                            <div className="flex items-center justify-center rounded-full mx-auto mb-3 bg-yellow-100 text-yellow-400"
                                style={{ width: 60, height: 60 }}>
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M2.166 4.999A10.49 10.49 0 0110 2a10.49 10.49 0 017.834 2.999 10.49 10.49 0 010 8.002A10.49 10.49 0 0110 18a10.49 10.49 0 01-7.834-2.999 10.49 10.49 0 010-8.002zm3.5 2.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6-3a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 003 0v-3a1.5 1.5 0 00-1.5-1.5zm-6 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h6 className="font-bold text-yellow-400 mb-0 text-base">TALENT PARTNER</h6>
                                <span className="text-white text-xs">Your Extended Recruitment Team</span>
                            </div>
                            <div className="text-center py-3 border-b border-white/20 mb-3">
                                <div className="text-3xl font-bold text-white">20+</div>
                                <div className="mb-3 text-white text-sm">Shortlisted Candidate</div>
                                <div className="text-3xl font-bold text-yellow-400">Custom Pricing</div>
                                <span className="text-xs text-white">Starting from ₹50,000+</span>
                            </div>
                            <ul className="list-none mb-4 flex flex-col gap-1 text-sm text-white">
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Dedicated Account Manager
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Bulk Hiring Campaigns
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Employer Branding Support
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Weekly Performance Reports
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Recruitment Consulting
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Workforce Planning Support
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Leadership Hiring Support
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Pan-India Candidate Sourcing
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Priority Service
                                </li>
                            </ul>
                        </div>
                        <div className="bg-yellow-400 text-[#1f2938] text-xs font-semibold py-2 text-center rounded">
                            Best for Large Scale Hiring
                        </div>
                    </div>

                </div>

                {/* ─────────────────────────────────────────
                    WHY EMPLOYERS CHOOSE JOBS WAALE
                ───────────────────────────────────────── */}
                <div className="text-center mb-5 mt-14">
                    <h4 className="font-bold text-[#1f2938] mb-1 text-[28px] leading-[34px]">WHY EMPLOYERS CHOOSE JOBS WAALE</h4>
                    <p className="text-[#475569] text-sm">We help businesses hire more efficiently with verified profiles and smart tracking integrations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    <div className="p-3 bg-white border border-[#ececec] rounded h-full flex flex-col items-center justify-center">
                        <div className="flex items-center w-full">
                            <div className="flex-shrink-0">
                                <div className="p-3 rounded-full text-white flex items-center justify-center"
                                    style={{ width: 60, height: 60, backgroundColor: '#004bbf' }}>
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-grow ml-3">
                                <h6 className="font-bold text-[#1f2938] mb-1 text-base">Quality Candidates</h6>
                                <p className="text-[#88929b] text-xs mb-0">Carefully Screened</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 bg-white border border-[#ececec] rounded h-full flex flex-col items-center justify-center">
                        <div className="flex items-center w-full">
                            <div className="flex-shrink-0">
                                <div className="p-3 rounded-full text-white flex items-center justify-center"
                                    style={{ width: 60, height: 60, backgroundColor: '#004bbf' }}>
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707.707-.707A1 1 0 0115 3v4a1 1 0 01-2 0V5.414l-.707.707A1 1 0 0111.586 4.5l.707-.707L12 3a1 1 0 011-1zm0 8a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-grow ml-3">
                                <h6 className="font-bold text-[#1f2938] mb-1 text-base">Easy & Fast Process</h6>
                                <p className="text-[#88929b] text-xs mb-0">Save Time, Hire Faster</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 bg-white border border-[#ececec] rounded h-full flex flex-col items-center justify-center">
                        <div className="flex items-center w-full">
                            <div className="flex-shrink-0">
                                <div className="p-3 rounded-full text-white flex items-center justify-center"
                                    style={{ width: 60, height: 60, backgroundColor: '#004bbf' }}>
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-grow ml-3">
                                <h6 className="font-bold text-[#1f2938] mb-1 text-base">Cost Effective</h6>
                                <p className="text-[#88929b] text-xs mb-0">More Value, Better Hiring</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 bg-white border border-[#ececec] rounded h-full flex flex-col items-center justify-center">
                        <div className="flex items-center w-full">
                            <div className="flex-shrink-0">
                                <div className="p-3 rounded-full text-white flex items-center justify-center"
                                    style={{ width: 60, height: 60, backgroundColor: '#004bbf' }}>
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-grow ml-3">
                                <h6 className="font-bold text-[#1f2938] mb-1 text-base">Dedicated Support</h6>
                                <p className="text-[#88929b] text-xs mb-0">Real People, Real Support</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────────
                    NETWORK METRICS & HELPLINE
                ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

                    {/* Left Panel: Live network metrics */}
                    <div className="p-3 bg-white border border-[#ececec] rounded h-full text-left">
                        <h6 className="font-bold text-[#1f2938] mb-4 text-base">JOBS WAALE NETWORK</h6>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <div className="text-2xl font-bold text-[#0047C7]">10,000+</div>
                                <div className="text-[#88929b] text-xs">Active Job Seekers</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[#0047C7]">500+</div>
                                <div className="text-[#88929b] text-xs">Employers</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[#0047C7]">100+</div>
                                <div className="text-[#88929b] text-xs">New Registrations Every Week</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-[#ececec] text-[#88929b] text-xs">
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>Growing Across India</span>
                        </div>
                    </div>

                    {/* Right Panel: Helpline Coordinator Contacts */}
                    <div className="p-3 bg-white border border-[#ececec] rounded h-full text-left flex flex-col justify-between">
                        <div>
                            <h6 className="font-bold text-[#1f2938] mb-1 text-base">NEED HIRING ASSISTANCE?</h6>
                            <p className="text-[#88929b] text-xs mb-2">Our recruitment coordinators are ready to assist you.</p>
                            <div className="flex items-center gap-1 text-[#88929b] mb-3 text-xs">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <span>Monday - Saturday (10:00 AM - 5:00 PM)</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-[#ececec] pt-3">
                            <a href="tel:+919999864424"
                                className="flex items-center gap-2 no-underline text-[#1f2938] text-sm font-semibold">
                                <svg className="w-5 h-5 text-[#0047C7]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                <span>+91 9999864424</span>
                            </a>
                            <a href="mailto:support@jobswaale.com"
                                className="flex items-center gap-2 no-underline text-[#1f2938] text-sm font-semibold">
                                <svg className="w-5 h-5 text-[#0047C7]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd" />
                                </svg>
                                <span>support@jobswaale.com</span>
                            </a>
                        </div>
                    </div>

                </div>

            </div>
        </main>
    );
};

export default EmployerPlan;