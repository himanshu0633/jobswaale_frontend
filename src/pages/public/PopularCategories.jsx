import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Laptop,
  TrendingUp,
  Wallet2,
  Headset,
  Settings,
  Users,
  Palette
} from 'lucide-react';

const CATEGORIES = [
  {
    icon: Laptop,
    title: 'IT & Software',
    count: '542 Jobs',
    iconBg: '#e3f2fd',
    iconColor: '#1e88e5',
  },
  {
    icon: TrendingUp,
    title: 'Sales & Marketing',
    count: '432 Jobs',
    iconBg: '#fff3e0',
    iconColor: '#fb8c00',
  },
  {
    icon: Wallet2,
    title: 'Accounts & Finance',
    count: '328 Jobs',
    iconBg: '#e8f5e9',
    iconColor: '#43a047',
  },
  {
    icon: Headset,
    title: 'Customer Support',
    count: '287 Jobs',
    iconBg: '#f3e5f5',
    iconColor: '#8e24aa',
  },
  {
    icon: Settings,
    title: 'Engineering',
    count: '245 Jobs',
    iconBg: '#e0f2f1',
    iconColor: '#00897b',
  },
  {
    icon: Users,
    title: 'HR & Admin',
    count: '198 Jobs',
    iconBg: '#ffebee',
    iconColor: '#e53935',
  },
  {
    icon: Palette,
    title: 'Designing',
    count: '156 Jobs',
    iconBg: '#f9fbe7',
    iconColor: '#c0ca33',
  }
];

export const PopularCategories = () => {
  const scrollerRef = useRef(null);

  const scrollBy = (dir) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-3">
          <h2 className="text-2xl sm:text-[2rem] font-bold text-slate-900">Popular Job Categories</h2>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0047C7] hover:text-[#FF6B00] transition"
          >
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          {/* Prev button */}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Previous category"
            className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:bg-[#0047C7] hover:text-white hover:border-[#0047C7] transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Scrolling track */}
          <div
            ref={scrollerRef}
            className="flex gap-3 overflow-x-auto scroll-smooth py-1 px-0.5 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {CATEGORIES.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={idx}
                  className="group shrink-0 w-[200px] min-h-[190px] bg-white border border-slate-200 rounded-xl py-7 px-4 text-center shadow-sm transition-all duration-200 hover:border-[#0047C7]/35 hover:bg-[#f8fbff] hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                >
                  <div
                    className="w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto mb-5 transition-transform duration-200 group-hover:scale-105"
                    style={{ backgroundColor: cat.iconBg, color: cat.iconColor }}
                  >
                    <IconComp className="h-7 w-7" />
                  </div>
                  <h5 className="text-sm font-semibold text-slate-900 mb-1.5">{cat.title}</h5>
                  <span className="inline-block text-xs font-semibold text-[#0047C7] bg-[#F2F6FF] px-3 py-1 rounded-full transition-colors duration-200 group-hover:bg-white">
                    {cat.count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Next button */}
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Next category"
            className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:bg-[#0047C7] hover:text-white hover:border-[#0047C7] transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
