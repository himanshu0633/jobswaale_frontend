import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
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
    bgColor: 'bg-blue-50/70 text-blue-600 border-blue-100',
  },
  {
    icon: TrendingUp,
    title: 'Sales & Marketing',
    count: '432 Jobs',
    bgColor: 'bg-amber-50/70 text-amber-600 border-amber-100',
  },
  {
    icon: Wallet2,
    title: 'Accounts & Finance',
    count: '328 Jobs',
    bgColor: 'bg-emerald-50/70 text-emerald-650 border-emerald-105',
  },
  {
    icon: Headset,
    title: 'Customer Support',
    count: '287 Jobs',
    bgColor: 'bg-purple-50/70 text-purple-600 border-purple-100',
  },
  {
    icon: Settings,
    title: 'Engineering',
    count: '245 Jobs',
    bgColor: 'bg-teal-50/70 text-teal-600 border-teal-100',
  },
  {
    icon: Users,
    title: 'HR & Admin',
    count: '198 Jobs',
    bgColor: 'bg-rose-50/70 text-rose-600 border-rose-100',
  },
  {
    icon: Palette,
    title: 'Designing',
    count: '156 Jobs',
    bgColor: 'bg-lime-50/70 text-lime-600 border-lime-100',
  }
];

export const PopularCategories = () => {
  return (
    <section className="py-20 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Popular Job Categories</h2>
            <p className="mt-2 text-slate-550 text-sm">Browse openings by field and explore current vacancies.</p>
          </div>
          <Link 
            to="/login"
            className="mt-4 sm:mt-0 inline-flex items-center gap-1 text-sm font-bold text-indigo-650 hover:text-indigo-500"
          >
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {CATEGORIES.map((cat, idx) => {
            const IconComp = cat.icon;
            return (
              <div key={idx} className="group border border-slate-200 rounded-2xl p-5 bg-white hover:border-indigo-250 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center">
                <div className={`p-4 rounded-full mb-4 shrink-0 transition-colors ${cat.bgColor}`}>
                  <IconComp className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-650 transition-colors">
                  {cat.title}
                </h3>
                <span className="text-xs font-semibold text-slate-400 mt-2">{cat.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
