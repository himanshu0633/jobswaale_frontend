import React from 'react';
import TrustedCompanies from './TrustedCompanies';
import bannerPrice from "./JobSeekerPlanImage/banner-price.png";

const JobseekerPlan = () => {
    return (
        <main className="main">

            {/* Pricing Plans Section */}
            <section className="mt-16 mb-12 py-10 inline-block w-full overflow-hidden">
                <div className="max-w-[1344px] mx-auto px-4">

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
                    <div className="mt-32 md:mt-12]">
                        <div className="flex flex-wrap -mx-3">

                            {/* FREE Card */}
                            <div className="w-full md:w-1/2 lg:w-1/4 px-3">
                                <div className="inline-block w-full p-6 border border-[#fff7f0] rounded-[30px] bg-[#fff7f0] mb-8 shadow-sm">
                                    <div className="inline-block w-full pb-10">
                                        <span className="text-[36px] text-[#231d4f] font-semibold leading-[46px] mr-4">&#8377;0</span>
                                        <span className="text-[17px] leading-[23px] text-[#37404e] block">Always Free</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[28px] leading-[34px] font-bold text-[#1f2938] mb-4 uppercase">FREE</h4>
                                        <p className="text-[15px] leading-5 text-[#37404e] mb-8">
                                            Start your journey with us
                                        </p>
                                    </div>
                                    <ul className="inline-block w-full pb-8">
                                        {['Candidate Profile Registration', 'Profile Support', 'Limited Job Offers'].map((item) => (
                                            <li key={item} className="inline-block w-full pl-9 bg-[url('/assets/imgs/theme/icons/check-circle.svg')] bg-no-repeat bg-left-center mb-3 text-[15px] leading-5 text-[#37404e]">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div>
                                        <a
                                            href="#"
                                            className="mt-8 inline-flex items-center justify-center w-full border border-[rgba(0,71,199)] rounded-[10px] bg-white text-[#111112] text-base py-4 px-6 font-semibold transition-all duration-200 hover:bg-[#0047C7] hover:text-white pr-[42px] bg-[url('/assets/imgs/theme/icons/chevron-right.svg')] bg-no-repeat bg-[right_19px_center] hover:bg-[url('/assets/imgs/theme/icons/chevron-right-light.svg')]"
                                        >
                                            Choose plan
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Card */}
                            <div className="w-full md:w-1/2 lg:w-1/4 px-3">
                                <div className="inline-block w-full p-6 border border-[#fff7f0] rounded-[30px] bg-[#fff7f0] mb-8 shadow-sm">
                                    <div className="inline-block w-full pb-10">
                                        <span className="text-[36px] text-[#231d4f] font-semibold leading-[46px] mr-4">&#8377;500</span>
                                        <span className="text-[17px] leading-[23px] text-[#37404e] block">One Time Registration</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[28px] leading-[34px] font-bold text-[#1f2938] mb-4 uppercase">Basic</h4>
                                        <p className="text-[15px] leading-5 text-[#37404e] mb-8">
                                            Register &amp; Get Started
                                        </p>
                                    </div>
                                    <ul className="inline-block w-full pb-8">
                                        {[
                                            'Candidate Profile Registration',
                                            'Profile Support',
                                            'Limited Job Offers',
                                            'Job Alerts & Vacancy Updates',
                                            'Profile Forward to Suitable Companies',
                                        ].map((item) => (
                                            <li key={item} className="inline-block w-full pl-9 bg-[url('/assets/imgs/theme/icons/check-circle.svg')] bg-no-repeat bg-left-center mb-3 text-[15px] leading-5 text-[#37404e]">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div>
                                        <a
                                            href="#"
                                            className="mt-8 inline-flex items-center justify-center w-full border border-[rgba(0,71,199)] rounded-[10px] bg-white text-[#111112] text-base py-4 px-6 font-semibold transition-all duration-200 hover:bg-[#0047C7] hover:text-white pr-[42px] bg-[url('/assets/imgs/theme/icons/chevron-right.svg')] bg-no-repeat bg-[right_19px_center] hover:bg-[url('/assets/imgs/theme/icons/chevron-right-light.svg')]"
                                        >
                                            Choose plan
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Pro Card (Most Popular) */}
                            <div className="w-full md:w-1/2 lg:w-1/4 px-3">
                                <div className="inline-block w-full -mt-[50px] bg-[#0047C7] bg-[url('/assets/imgs/theme/bg-featured.svg')] bg-no-repeat bg-[top_right] bg-contain rounded-[26px] p-5 pb-11 px-8 mb-8 shadow-sm relative">
                                    <div className="text-end mb-2.5">
                                        <a href="#" className="inline-block bg-white px-[37px] py-2 rounded-[14px] text-[10px] font-bold text-[#0047C7] uppercase tracking-wide bg-[right_13px_center] bg-no-repeat">
                                            Most popular
                                        </a>
                                    </div>
                                    <div className="inline-block w-full pb-10">
                                        <span className="text-[36px] text-white font-semibold leading-[46px] mr-4">&#8377;1000</span>
                                        <span className="text-[17px] leading-[23px] text-white block mb-2">One Time Payment</span>
                                        <span className="rounded px-3 py-2 bg-yellow-400 text-white uppercase font-semibold text-[13px]">3 Months Assistance</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[28px] leading-[34px] font-bold text-white mb-4 uppercase">Pro</h4>
                                        <p className="text-[15px] leading-5 text-white mb-8">
                                            Placement Support
                                        </p>
                                    </div>
                                    <ul className="inline-block w-full pb-8">
                                        {[
                                            'Multiple Interview Opportunities',
                                            'Telephonic & Face-to-Face Interview Support',
                                            'Priority Profile Forwarding',
                                            'Guidance for Accounts, Billing & Backend Jobs',
                                            'Regular Job Updates & Career Support',
                                        ].map((item) => (
                                            <li key={item} className="inline-block w-full pl-9 bg-[url('/assets/imgs/theme/icons/check-circle-white.svg')] bg-no-repeat bg-left-center mb-3 text-[15px] leading-5 text-white">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div>
                                        <a
                                            href="#"
                                            className="mt-8 inline-flex items-center justify-center w-full bg-yellow-400 hover:bg-yellow-500 text-white rounded-[10px] py-4 px-6 font-bold text-base transition-all duration-200 pr-[42px] bg-[url('/assets/imgs/theme/icons/chevron-right-light.svg')] bg-no-repeat bg-[right_19px_center]"
                                        >
                                            Choose plan
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Premium Card */}
                            <div className="w-full md:w-1/2 lg:w-1/4 px-3">
                                <div className="inline-block w-full p-6 border border-[#fff7f0] rounded-[30px] bg-[#fff7f0] mb-8 shadow-sm">
                                    <div className="inline-block w-full pb-10">
                                        <span className="text-[36px] text-[#231d4f] font-semibold leading-[46px] mr-4">&#8377;5000</span>
                                        <span className="text-[17px] leading-[23px] text-[#37404e] block mb-2">One Time Payment</span>
                                        <span className="rounded px-3 py-2 bg-yellow-400 text-white uppercase font-semibold text-[13px]">3 Months Assistance</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[28px] leading-[34px] font-bold text-[#1f2938] mb-4 uppercase">Premium</h4>
                                        <p className="text-[15px] leading-5 text-[#37404e] mb-8">
                                            Advanced Career Support
                                        </p>
                                    </div>
                                    <ul className="inline-block w-full pb-8">
                                        {[
                                            'Priority Access to WFH & Office Jobs',
                                            'Multiple Interview Opportunities',
                                            'Maximum Interview & Placement Support',
                                            'Training on Computer Basics & Accounting',
                                            'Government Certified Training',
                                            'Job Assurance Support',
                                        ].map((item) => (
                                            <li key={item} className="inline-block w-full pl-9 bg-[url('/assets/imgs/theme/icons/check-circle.svg')] bg-no-repeat bg-left-center mb-3 text-[15px] leading-5 text-[#37404e]">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div>
                                        <a
                                            href="#"
                                            className="mt-8 inline-flex items-center justify-center w-full border border-[rgba(0,71,199)] rounded-[10px] bg-white text-[#111112] text-base py-4 px-6 font-semibold transition-all duration-200 hover:bg-[#0047C7] hover:text-white pr-[42px] bg-[url('/assets/imgs/theme/icons/chevron-right.svg')] bg-no-repeat bg-[right_19px_center] hover:bg-[url('/assets/imgs/theme/icons/chevron-right-light.svg')]"
                                        >
                                            Choose plan
                                        </a>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* Invest in Yourself Section */}
            <section className="py-10 mt-24 inline-block w-full overflow-hidden">
                <div className="max-w-[1344px] mx-auto px-4">
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
    <div className="max-w-[1344px] mx-auto px-4">
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