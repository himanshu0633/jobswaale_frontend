import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const companies = [
  {
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
  {
    name: "Airbnb",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Bélo.svg",
  },
  {
    name: "Dropbox",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg",
  },
  {
    name: "FedEx",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/FedEx_Express.svg",
  },
  {
    name: "Walmart",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Walmart_logo_%282025%29.svg",
  },
  {
    name: "HubSpot",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg",
  },
];

const TrustedCompanies = () => {
  const swiperRef = useRef(null);

  return (
    <div className="section-box mt-0 py-[30px] bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <h5 className="font-semibold text-center mb-4 text-slate-900 text-lg">
          Trusted by 500+ Leading Companies
        </h5>

        <div className="hidden lg:grid grid-cols-6 gap-6">
          {companies.map((company) => (
            <div key={company.name} className="item-logo">
              <img
                src={company.logo}
                alt={company.name}
                className="mx-auto h-[38px] max-w-[150px] object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="relative px-10 sm:px-12 lg:hidden">
          {/* Left Arrow */}
          <button 
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 lg:-left-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
            aria-label="Previous companies"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <Swiper
            ref={swiperRef}
            modules={[Navigation, FreeMode]}
            spaceBetween={18}
            slidesPerView={2}
            loop={true}
            freeMode={{
              enabled: true,
              momentum: true,
            }}
            breakpoints={{
              480: {
                slidesPerView: 3,
              },
              768: {
                slidesPerView: 4,
              },
            }}
            className="py-5"
          >
            {companies.map((company) => (
              <SwiperSlide key={company.name}>
                <div className="item-logo hover-up">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="mx-auto h-[38px] max-w-[150px] object-contain"
                    loading="lazy"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Right Arrow */}
          <button 
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 lg:-right-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
            aria-label="Next companies"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Scroll indicators */}
        <div className="flex lg:hidden justify-center gap-2 mt-4">
          {companies.map((_, index) => (
            <button
              key={index}
              onClick={() => swiperRef.current?.slideTo(index)}
              className="w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-600 transition-colors duration-200"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>

      <style>{`
        .item-logo {
          border: 1px solid rgba(6,18,36,.1);
          padding: 39px 20px 36px;
          width:100%;
          min-height: 104px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align:center;
          border-radius:12px;
          background:white;
          box-shadow:0 20px 60px -6px rgba(0,0,0,.04);
          transition:.3s ease;
        }

        .item-logo:hover {
          transform:translateY(-5px);
          box-shadow: 0 25px 70px -8px rgba(0,0,0,.08);
        }

        .swiper-wrapper {
          transition-timing-function: ease;
        }

        /* Button hover effects */
        .absolute button:hover {
          transform: translateY(-50%) scale(1.05);
        }

        .absolute button:active {
          transform: translateY(-50%) scale(0.95);
        }

        /* Responsive button positioning */
        @media (max-width: 640px) {
          .absolute button {
            padding: 8px;
          }
          .absolute button svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>

    </div>
  );
};

export default TrustedCompanies;
