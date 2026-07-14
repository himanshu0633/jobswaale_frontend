import React from 'react';
import { Link } from 'react-router-dom';
import bannerImg from './aboutImages/banner-img.png'
import bannerSm1 from './aboutImages/banner-sm-1.png'
import bannerSm2 from './aboutImages/banner-sm-2.png'
import bannerSm3 from './aboutImages/banner-sm-3.png'
import reserchSVG from './aboutImages/market-research.svg'
import creativeLayout from './aboutImages/creative-layout.svg'
import digitalMarketing from './aboutImages/digital-marketing.svg'
import backLinks from './aboutImages/seo-backlink.svg'
import findingJOB from './aboutImages/img-findjob.png'
import webDev from './aboutImages/web-dev.svg';
import congratulations from './aboutImages/congratulation.svg'
import onlineMarketing from './aboutImages/banner-online-marketing.png'
import Marc from './aboutImages/marc.png';
import marc2 from './aboutImages/marc2.png';
import marc3 from './aboutImages/marc3.png';
import marc4 from './aboutImages/marc4.png'
import profile1 from './aboutImages/profile.png';
import profile2 from './aboutImages/profile2.png';
import profile3 from './aboutImages/profile3.png';
import star from './aboutImages/star.svg'

const About = () => {
  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Hero Banner Section */}
      <section className="bg-[#fff9f3] border-b border-[#fff9f3] relative overflow-hidden rounded-bl-[100px] rounded-br-[100px] pb-40 pt-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 lg:py-[20px] lg:pr-[60px]">
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-[#1f2938] leading-[1.2] tracking-tight">
                The #1 Job Board for <span className="text-[#0047C7]">Graphic Design Jobs</span>
              </h1>
              <p className="text-[#475569] text-lg leading-relaxed max-w-[70%]">
                Search and connect with the right candidates faster. This talent search gives you the opportunity to find candidates who may be a perfect fit for your role.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-[#0047C7] blur-[20px] rounded-lg w-[144px] h-[39px] left-0 right-0 mx-auto top-2.5"></div>
                  <Link 
                    to="/contact" 
                    className="relative z-10 bg-[#0047C7] hover:bg-[#0052cc] text-white font-medium text-base px-6 py-3.5 rounded-lg inline-block transition-all hover:-translate-y-0.5"
                  >
                    Contact us
                  </Link>
                </div>
                <Link 
                  to="/support" 
                  className="text-[#1f2938] font-medium text-base px-6 py-3.5 rounded-lg inline-block hover:text-[#0047C7] transition"
                >
                  Support center
                </Link>
              </div>
            </div>

            {/* Right Column - Banner Images */}
            <div className="lg:col-span-5 hidden lg:block relative">
              <div className="relative w-auto h-[350px] flex items-center justify-center mx-auto max-w-[580px] m-10">
                {/* Main Banner Image */}
                <img 
                  src={bannerImg} 
                  alt="jobhub" 
                  className="relative z-10 max-w-full animate-[hero-thumb-sm-2-animation_4s_linear_infinite_alternate]"
                />
                {/* Floating Images */}
                <span className="absolute top-[-25%] -left-[80px] w-[102px] h-[102px] rounded-full overflow-hidden animate-[hero-thumb-animation_2s_linear_infinite_alternate] shadow-lg z-20">
                  <img src={bannerSm1} alt="jobhub" className="w-full h-full object-cover" />
                </span>
                <span className="absolute top-[10%] -left-[110px] w-[132px] z-20 animate-[hero-thumb-animation_2s_linear_infinite_alternate]">
                  <img src={bannerSm2} alt="jobhub" className="rounded-t-[40px] rounded-br-[40px] w-full shadow-lg" />
                </span>
                <span className="absolute top-[70%] -left-[150px] w-[182px] z-20 animate-[hero-thumb-sm-animation_4s_linear_infinite_alternate]">
                  <img src={bannerSm3} alt="jobhub" className="rounded-bl-[40px] w-full shadow-lg" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid Section */}
      <section className="pt-[90px] pb-10 bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="group bg-white border border-[#ececec] rounded-xl p-10 hover:border-[#0047C7] hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] transition-all duration-200">
                <div className="mb-5">
                  <img src={reserchSVG} alt="market research" className="h-[65px]" />
                </div>
                <h5 className="font-bold text-[#1f2938] text-xl mt-5">Market Research</h5>
                <p className="text-[#37404e] text-base leading-relaxed mt-4 mb-5">It is a long established fact that a reader will be.</p>
                <Link to="/contact" className="text-[#0047C7] text-lg font-normal no-underline bg-[url(assets/imgs/theme/icons/arrow.svg)] bg-no-repeat bg-[right_0_top_7px] pr-[35px] hover:text-[#0052cc] transition">
                  Read more
                </Link>
              </div>

              {/* Feature 2 */}
              <div className="group bg-white border border-[#ececec] rounded-xl p-10 hover:border-[#0047C7] hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] transition-all duration-200">
                <div className="mb-5">
                  <img src={creativeLayout} alt="creative layout" className="h-[65px]" />
                </div>
                <h5 className="font-bold text-[#1f2938] text-xl mt-5">Creative Layout</h5>
                <p className="text-[#37404e] text-base leading-relaxed mt-4 mb-5">It is a long established fact that a reader will be.</p>
                <Link to="/contact" className="text-[#0047C7] text-lg font-normal no-underline bg-[url(assets/imgs/theme/icons/arrow.svg)] bg-no-repeat bg-[right_0_top_7px] pr-[35px] hover:text-[#0052cc] transition">
                  Read more
                </Link>
              </div>

              {/* Feature 3 */}
              <div className="group bg-white border border-[#ececec] rounded-xl p-10 hover:border-[#0047C7] hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] transition-all duration-200">
                <div className="mb-5">
                  <img src={digitalMarketing} alt="digital marketing" className="h-[65px]" />
                </div>
                <h5 className="font-bold text-[#1f2938] text-xl mt-5">Digital Marketing</h5>
                <p className="text-[#37404e] text-base leading-relaxed mt-4 mb-5">It is a long established fact that a reader will be.</p>
                <Link to="/contact" className="text-[#0047C7] text-lg font-normal no-underline bg-[url(assets/imgs/theme/icons/arrow.svg)] bg-no-repeat bg-[right_0_top_7px] pr-[35px] hover:text-[#0052cc] transition">
                  Read more
                </Link>
              </div>

              {/* Feature 4 */}
              <div className="group bg-white border border-[#ececec] rounded-xl p-10 hover:border-[#0047C7] hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] transition-all duration-200">
                <div className="mb-5">
                  <img src={backLinks} alt="seo backlinks" className="h-[65px]" />
                </div>
                <h5 className="font-bold text-[#1f2938] text-xl mt-5">SEO & Backlinks</h5>
                <p className="text-[#37404e] text-base leading-relaxed mt-4 mb-5">It is a long established fact that a reader will be.</p>
                <Link to="/contact" className="text-[#0047C7] text-lg font-normal no-underline bg-[url(assets/imgs/theme/icons/arrow.svg)] bg-no-repeat bg-[right_0_top_7px] pr-[35px] hover:text-[#0052cc] transition">
                  Read more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find Jobs Block */}
      <section className="pt-[90px] pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-[#c2d9ff] rounded-[80px] pt-16 pb-16 pl-5 pr-12 overflow-hidden">
            <div className="relative z-10 grid gap-10 lg:grid-cols-2 items-center">
              {/* Left Image */}
              <div className="hidden lg:block relative -ml-[50px]">
                <img 
                  src={findingJOB} 
                  alt="find job" 
                  className="rounded-tl-[100px] rounded-br-[100px] shadow-[0_20px_60px_-6px_rgba(0,0,0,0.04)] w-full"
                />
                <div className="absolute -bottom-[45px] right-[100px] w-[39px] h-[39px] rounded-full bg-[#9fdbe9]"></div>
              </div>

              {/* Right Content */}
              <div className="pt-[70px] px-[30px] lg:pt-[70px] lg:pl-[30px] lg:pr-[30px] pb-8">
                <span className="text-[#0047C7] text-xl font-semibold">Find jobs</span>
                <h3 className="text-[36px] font-bold text-[#1f2938] leading-[44px] mt-7 mb-7">
                  Create free account and start applying to your dream job today
                </h3>
                <p className="text-[#37404e] text-lg leading-relaxed">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy.
                </p>
                <div className="mt-7">
                  <Link 
                    to="/jobs" 
                    className="bg-[#0047C7] hover:bg-[#0052cc] text-white font-medium text-base px-6 py-3.5 rounded-lg inline-block transition-all hover:-translate-y-0.5"
                  >
                    Explore more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Online Marketing Section */}
      <section className="pt-[90px] pb-20 bg-white border-b border-[#ececec]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div>
              <span className="text-[#0047C7] text-xl font-semibold">Online Marketing</span>
              <h3 className="text-[44px] font-bold text-[#1f2938] leading-[54px] mt-5 mb-7">
                Committed to top quality and results
              </h3>
              <p className="text-[#37404e] text-base leading-relaxed mb-5">
                Proin ullamcorper pretium orci. Donec necscele risque leo. Nam massa dolor imperdiet neccon sequata congue idsem. Maecenas malesuada faucibus finibus.
              </p>
              <p className="text-[#37404e] text-base leading-relaxed mb-7">
                Proin ullamcorper pretium orci. Donec necscele risque leo. Nam massa dolor imperdiet neccon sequata congue idsem. Maecenas malesuada faucibus finibus.
              </p>
              <div>
                <Link 
                  to="/contact" 
                  className="bg-[#0047C7] hover:bg-[#0052cc] text-white font-medium text-base px-6 py-3.5 rounded-lg inline-block transition-all hover:-translate-y-0.5"
                >
                  Learn more
                </Link>
              </div>
            </div>

            {/* Right Images */}
            <div className="hidden lg:block relative pl-[20px] py-10">
              <div className="relative w-full">
                <img 
                  src={onlineMarketing}
                  alt="online marketing" 
                  className="relative z-10 max-w-full animate-[hero-thumb-sm-2-animation_4s_linear_infinite_alternate]"
                />
                <span className="absolute top-[15%] -left-[110px] z-20 animate-[hero-thumb-animation_2s_linear_infinite_alternate]">
                  <img src={congratulations} alt="congratulation" />
                </span>
                <span className="absolute top-[65%] -left-[90px] z-20 animate-[hero-thumb-sm-animation_4s_linear_infinite_alternate]">
                  <img src={webDev} alt="web dev" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="pt-[90px] pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-[44px] font-bold text-[#1f2938] leading-[54px] mb-4">Meet our team</h2>
            <p className="text-[#88929b] text-base leading-relaxed max-w-[60%] mx-auto">
              Find the type of work you need, clearly defined and ready to start. Work begins as soon as you purchase and provide requirements.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-[60px]">
            {/* Team Member 1 */}
            <div className="border border-[#ececec] rounded-xl p-6 bg-white hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] hover:border-[#0047C7] transition duration-200 text-center">
              <div className="mb-4">
                <img src={Marc} alt="Elon Musk" className="w-full rounded-lg" />
              </div>
              <h5 className="font-bold text-[#1f2938] text-lg mb-1">Elon Musk</h5>
              <p className="text-[#88929b] text-sm">Marketing Crew</p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/fb-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/fb-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/tw-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/tw-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/inst-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/inst-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/linkedin-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/linkedin-sym-hover.svg)] transition"></a>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="border border-[#ececec] rounded-xl p-6 bg-white hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] hover:border-[#0047C7] transition duration-200 text-center">
              <div className="mb-4">
                <img src={marc2}alt="Bernard Arnault" className="w-full rounded-lg" />
              </div>
              <h5 className="font-bold text-[#1f2938] text-lg mb-1">Bernard Arnault</h5>
              <p className="text-[#88929b] text-sm">Marketing Crew</p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/fb-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/fb-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/tw-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/tw-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/inst-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/inst-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/linkedin-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/linkedin-sym-hover.svg)] transition"></a>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="border border-[#ececec] rounded-xl p-6 bg-white hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] hover:border-[#0047C7] transition duration-200 text-center">
              <div className="mb-4">
                <img src={marc3} alt="Jeff Bezos" className="w-full rounded-lg" />
              </div>
              <h5 className="font-bold text-[#1f2938] text-lg mb-1">Jeff Bezos</h5>
              <p className="text-[#88929b] text-sm">Marketing Crew</p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/fb-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/fb-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/tw-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/tw-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/inst-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/inst-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/linkedin-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/linkedin-sym-hover.svg)] transition"></a>
              </div>
            </div>

            {/* Team Member 4 */}
            <div className="border border-[#ececec] rounded-xl p-6 bg-white hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] hover:border-[#0047C7] transition duration-200 text-center">
              <div className="mb-4">
                <img src={marc4}alt="Bill Gates" className="w-full rounded-lg" />
              </div>
              <h5 className="font-bold text-[#1f2938] text-lg mb-1">Bill Gates</h5>
              <p className="text-[#88929b] text-sm">Marketing Crew</p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/fb-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/fb-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/tw-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/tw-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/inst-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/inst-sym-hover.svg)] transition"></a>
                <a href="#" className="w-[25px] h-[25px] inline-block bg-[url(assets/imgs/theme/icons/linkedin-sym.svg)] bg-no-repeat bg-center hover:bg-[url(assets/imgs/theme/icons/linkedin-sym-hover.svg)] transition"></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Happy Customers Section */}
      <section className="pt-20 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-[44px] font-bold text-[#1f2938] leading-[54px] mb-4">Our Happy Customer</h2>
            <p className="text-[#88929b] text-base leading-relaxed max-w-[60%] mx-auto">
              When it comes to choosing the right web hosting provider, we know how easy it is to get overwhelmed with the number.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mt-[70px]">
            {/* Testimonial 1 */}
            <div className="border border-[#ececec] rounded-xl p-8 bg-white hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] hover:border-[#0047C7] transition duration-200 text-center">
              <div className="mb-4">
                <img src={profile1} alt="profile" className="w-[100px] h-[100px] rounded-full mx-auto" />
              </div>
              <p className="text-[#37404e] text-lg leading-relaxed text-center">We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as</p>
              <div className="flex items-center justify-center gap-1 mt-5 mb-6">
                <img src={star} alt="star" />
                <img src={star} alt="star" />
                <img src={star} alt="star" />
                <img src={star} alt="star" />
                <img src={star} alt="star" />
              </div>
              <div>
                <strong className="text-[#1f2938] text-lg font-bold block">Sarah Harding</strong>
                <span className="text-[#727272] text-base">Visual Designer</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="border border-[#ececec] rounded-xl p-8 bg-white hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] hover:border-[#0047C7] transition duration-200 text-center">
              <div className="mb-4">
                <img src={profile2} alt="profile" className="w-[100px] h-[100px] rounded-full mx-auto" />
              </div>
              <p className="text-[#37404e] text-lg leading-relaxed text-center">We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as</p>
              <div className="flex items-center justify-center gap-1 mt-5 mb-6">
                <img src={star} alt="star" />
                <img src={star} alt="star" />
                <img src={star} alt="star" />
                <img src={star} alt="star" />
                <img src={star} alt="star" />
              </div>
              <div>
                <strong className="text-[#1f2938] text-lg font-bold block">Sarah Harding</strong>
                <span className="text-[#727272] text-base">Visual Designer</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="border border-[#ececec] rounded-xl p-8 bg-white hover:shadow-[0_9px_26px_0_rgba(31,31,51,0.06)] hover:border-[#0047C7] transition duration-200 text-center">
              <div className="mb-4">
                <img src={profile3} alt="profile" className="w-[100px] h-[100px] rounded-full mx-auto" />
              </div>
              <p className="text-[#37404e] text-lg leading-relaxed text-center">We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as</p>
              <div className="flex items-center justify-center gap-1 mt-5 mb-6">
                <img src={star} alt="star" />
                <img src={star} alt="star" />
                <img src={star} alt="star" />
                <img src={star} alt="star" />
                <img src={star} alt="star" />
              </div>
              <div>
                <strong className="text-[#1f2938] text-lg font-bold block">Sarah Harding</strong>
                <span className="text-[#727272] text-base">Visual Designer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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