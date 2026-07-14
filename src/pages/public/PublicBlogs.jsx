import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Search } from 'lucide-react';
import { PublicHeader, PublicFooter } from './PublicPage';

import blogThumb1 from './blogImages/blog-thumb-1.png';
import blogThumb3 from './blogImages/blog-thumb-3.png';
import blogThumb4 from './blogImages/blog-thumb-4.png';
import blogThumb5 from './blogImages/blog-thumb-5.png';
import blogThumb6 from './blogImages/blog-thumb-6.png';
import blogThumb7 from './blogImages/blog-thumb-7.png';
import blogThumb8 from './blogImages/blog-thumb-8.png';

export const PublicBlogs = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Recruitment News', count: 28 },
    { name: 'Job Venues', count: 32 },
    { name: 'Full Time Job', count: 45 },
    { name: 'Work From Home', count: 68 },
    { name: 'Job Tips', count: 43 },
  ];

  const tags = ['Recruitment', 'Branding', 'Workplace', 'Job Tips', 'Contributors'];

  const smallCards = [
    { img: blogThumb3, title: 'How To Create a Resume for a Job in Social Media Marketing' },
    { img: blogThumb4, title: '10 Ways to Avoid a Referee Disaster Zone' },
    { img: blogThumb5, title: 'How To Set Work-Life Boundaries From Any Location' },
    { img: blogThumb6, title: 'How to Land Your Dream Marketing Job' },
    { img: blogThumb7, title: 'Leveraging Job Rejection as a Catalyst for Growth' },
    { img: blogThumb8, title: 'Effective Job Search Tools to Get You A Job' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for: "${searchQuery}"`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />

      {/* Breadcrumb */}
      <div className="bg-[#fff9f3] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center list-none p-0">
            <li>
              <Link to="/" className="text-base text-[#1f2938] hover:text-[#0047C7] no-underline">
                Home
              </Link>
            </li>
            <li className="relative pl-[14px] text-base text-[#88929b] before:content-['/'] before:absolute before:top-px before:left-[3px] before:text-[#88929b]">
              Blog
            </li>
          </ul>
        </div>
      </div>

      {/* Archive Header */}
      <div className="pt-[50px] pb-[30px] text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-[46px] font-bold text-[#1f2938] mb-[30px] w-3/4 mx-auto leading-tight">
            Relevant news and more for you. Welcome to our blog
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                className="px-[18px] py-[10px] bg-[rgba(81,146,255,0.12)] rounded-[50px] text-sm text-[#727272] border-none cursor-pointer hover:bg-[#0047C7] hover:text-white transition-colors duration-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Post Loop Grid */}
      <main className="flex-grow mb-[80px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left: Blog Posts */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 gap-[30px]">

                {/* Featured Large Card */}
                <div className="rounded-[15px] border border-[#ececec] p-[30px] bg-white hover:shadow-[0_9px_26px_rgba(31,31,51,0.06)] transition-all duration-200">
                  <figure className="rounded-[15px] overflow-hidden mb-[15px] m-0">
                    <a href="blog-single.html">
                      <img alt="Job Interview Tips" src={blogThumb1} className="w-full rounded-[15px]" />
                    </a>
                  </figure>
                  <div className="flex items-center gap-6 text-[#88929b] text-sm mb-[15px]">
                    <span className="flex items-center gap-[5px]">
                      <User className="h-4 w-4" /> Admin
                    </span>
                    <span className="flex items-center gap-[5px]">
                      <Calendar className="h-4 w-4" /> 06 Sep 2025
                    </span>
                  </div>
                  <h3 className="text-[24px] font-bold leading-[1.33] text-[#1f2938] mb-[15px]">
                    <a href="blog-single.html" className="text-[#1f2938] no-underline hover:text-[#0047C7]">
                      21 Job Interview Tips: How To Make a Great Impression
                    </a>
                  </h3>
                  <p className="text-[#88929b] text-sm leading-relaxed">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit ab, dicta minus aspernatur
                    magnam atque excepturi perspiciatis omnis voluptas ullam nam, sunt temporibus fuga vero!
                    Adipisci perspiciatis necessitatibus reprehenderit repellat.
                  </p>
                  <div className="mt-[30px]">
                    <a
                      href="blog-single.html"
                      className="inline-block border border-[rgba(0,71,199,1)] px-[22px] py-[14px] rounded-[10px] bg-white text-[#111112] text-base no-underline hover:bg-[#0047C7] hover:text-white transition-colors duration-200"
                    >
                      Keep reading
                    </a>
                  </div>
                </div>

                {/* 2-column small cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[30px]">
                  {smallCards.map((card, index) => (
                    <div
                      key={index}
                      className="rounded-[15px] border border-[#ececec] p-[30px] bg-white hover:shadow-[0_9px_26px_rgba(31,31,51,0.06)] hover:-translate-y-[3px] transition-all duration-200"
                    >
                      <figure className="rounded-[15px] overflow-hidden mb-[15px] m-0">
                        <a href="blog-single.html">
                          <img alt={card.title} src={card.img} className="w-full rounded-[15px]" />
                        </a>
                      </figure>
                      <div className="flex items-center gap-6 text-[#88929b] text-sm mb-[15px]">
                        <span className="flex items-center gap-[5px]">
                          <User className="h-4 w-4" /> Admin
                        </span>
                        <span className="flex items-center gap-[5px]">
                          <Calendar className="h-4 w-4" /> 06 September
                        </span>
                      </div>
                      <h3 className="text-[18px] font-bold leading-[1.33] text-[#1f2938] mb-[15px]">
                        <a href="blog-single.html" className="text-[#1f2938] no-underline hover:text-[#0047C7]">
                          {card.title}
                        </a>
                      </h3>
                      <div className="mt-[30px]">
                        <a
                          href="blog-single.html"
                          className="inline-block border border-[rgba(0,71,199,1)] px-[22px] py-[14px] rounded-[10px] bg-white text-[#111112] text-base no-underline hover:bg-[#0047C7] hover:text-white transition-colors duration-200"
                        >
                          Keep reading
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Pagination */}
              <div className="mt-5 mb-[50px]">
                <ul className="flex items-center list-none p-0 gap-1">
                  <li>
                    <a href="#" className="flex items-center justify-center w-10 h-10 text-[#88929b] text-2xl no-underline hover:text-[#0047C7]">
                      &lsaquo;
                    </a>
                  </li>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <li key={n}>
                      <a
                        href="#"
                        className={`relative flex items-center justify-center w-9 h-9 font-semibold text-[#37404e] text-base no-underline hover:font-bold ${
                          n === 6
                            ? 'font-bold before:content-[""] before:absolute before:w-7 before:h-7 before:bg-[#0047C7] before:opacity-30 before:rounded-lg before:-z-10 before:top-[4px] before:left-[1px]'
                            : ''
                        }`}
                      >
                        {n}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a href="#" className="flex items-center justify-center w-10 h-10 text-[#88929b] text-2xl no-underline hover:text-[#0047C7]">
                      &rsaquo;
                    </a>
                  </li>
                </ul>
              </div>

            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-4 col-md-12 col-sm-12 lg:pl-10 mt-[30px] lg:mt-0">

              {/* Search Widget */}
              <div className="mb-[40px]">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search…"
                    className="border border-[#ececec] rounded-[10px] h-16 w-full pl-5 pr-14 text-base text-[#37404e] placeholder-[#88929b] outline-none focus:border-[#0047C7] transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-6 bg-transparent border-none text-[#242424] hover:text-[#0047C7] cursor-pointer"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </form>
              </div>

              {/* Categories Widget */}
              <div className="border border-black/10 rounded-[10px] shadow-[0_9px_26px_rgba(31,31,51,0.06)] bg-[#f4f6fa] px-[33px] py-[29px]">
                <h5 className="text-base font-semibold border-b border-[#ececec] pb-[10px] mb-[30px] text-[#1f2938]">
                  Category
                </h5>
                <ul className="list-none p-0">
                  {categories.map((cat, index) => (
                    <li
                      key={index}
                      className={`group flex justify-between items-center py-2 ${index > 0 ? 'border-t border-[#ececec]' : ''}`}
                    >
                      <Link to="/blogs" className="text-[#1f2938] text-base no-underline hover:text-[#0047C7]">
                        {cat.name}
                      </Link>
                      <span className="bg-[rgba(81,146,255,0.12)] group-hover:bg-[#0047C7] text-[#1f2938] group-hover:text-white text-sm rounded-[3px] px-[5px] py-[3px] min-w-[26px] text-center transition-colors duration-200">
                        {cat.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PublicBlogs;