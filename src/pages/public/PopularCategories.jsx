import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
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
import axios from 'axios';
import { BASE_API_URL } from '../../context/AuthContext';

const CATEGORY_STYLES = [
  { icon: Laptop, iconBg: '#e3f2fd', iconColor: '#1e88e5' },
  { icon: TrendingUp, iconBg: '#fff3e0', iconColor: '#fb8c00' },
  { icon: Wallet2, iconBg: '#e8f5e9', iconColor: '#43a047' },
  { icon: Headset, iconBg: '#f3e5f5', iconColor: '#8e24aa' },
  { icon: Settings, iconBg: '#e0f2f1', iconColor: '#00897b' },
  { icon: Users, iconBg: '#ffebee', iconColor: '#e53935' },
  { icon: Palette, iconBg: '#f9fbe7', iconColor: '#c0ca33' },
];

export const PopularCategories = () => {
  const scrollerRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [categoryResult, jobsResult] = await Promise.allSettled([
          axios.get(`${BASE_API_URL}/masters/job-categories`),
          axios.get(`${BASE_API_URL}/jobs`)
        ]);
        const categoryData = categoryResult.status === 'fulfilled' ? categoryResult.value.data : [];
        const jobsData = jobsResult.status === 'fulfilled' ? jobsResult.value.data : [];

        const jobCounts = (jobsData || []).reduce((counts, job) => {
          const category = job.jobCategory;
          const categoryKeys = [
            category?._id,
            category?.id,
            category?.categoryName,
          ].filter(Boolean);

          categoryKeys.forEach((key) => {
            counts[String(key)] = (counts[String(key)] || 0) + 1;
          });

          return counts;
        }, {});

        const mapped = (categoryData || [])
          .filter((category) => (category.status || 'active') === 'active')
          .sort((a, b) => {
            const sortA = Number.isFinite(Number(a.sortingNo)) ? Number(a.sortingNo) : Number.MAX_SAFE_INTEGER;
            const sortB = Number.isFinite(Number(b.sortingNo)) ? Number(b.sortingNo) : Number.MAX_SAFE_INTEGER;
            if (sortA !== sortB) return sortA - sortB;
            return (a.categoryName || '').localeCompare(b.categoryName || '');
          })
          .map((category, index) => {
            const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];
            const count = jobCounts[category._id] || jobCounts[category.id] || jobCounts[category.categoryName] || 0;

            return {
              id: category._id || category.id || category.categoryName,
              title: category.categoryName,
              count: `${count} ${count === 1 ? 'Job' : 'Jobs'}`,
              ...style,
            };
          });

        setCategories(mapped);
      } catch (err) {
        console.error('Error fetching popular categories:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const scrollBy = (dir) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-3">
          <h2 className="text-2xl sm:text-[2rem] font-bold text-slate-900">Popular Job Categories</h2>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0047C7] hover:text-[#FF6B00] transition"
          >
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          {categories.length > 0 && (
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Previous category"
              className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:bg-[#0047C7] hover:text-white hover:border-[#0047C7] transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {loading ? (
            <div className="flex gap-3 overflow-x-auto py-1 px-0.5 animate-pulse w-full [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="shrink-0 w-[200px] min-h-[190px] bg-white border border-slate-200 rounded-xl py-7 px-4 flex flex-col items-center justify-center">
                  <div className="w-[60px] h-[60px] rounded-full bg-slate-200 mb-5" />
                  <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
                  <div className="h-6 w-16 bg-slate-200 rounded-full" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex min-h-[190px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-6 text-center text-sm font-medium text-slate-500">
              No job categories found.
            </div>
          ) : (
            <div
              ref={scrollerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth py-1 px-0.5 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {categories.map((cat) => {
                const IconComp = cat.icon || Briefcase;
                return (
                  <Link
                    key={cat.id}
                    to={`/jobs?category=${encodeURIComponent(cat.title)}`}
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
                  </Link>
                );
              })}
            </div>
          )}

          {categories.length > 0 && (
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Next category"
              className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:bg-[#0047C7] hover:text-white hover:border-[#0047C7] transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
