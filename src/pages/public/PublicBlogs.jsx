import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Bookmark, 
  Heart, 
  Search, 
  ChevronRight, 
  Clock,
  BookOpen
} from 'lucide-react';
import { PublicHeader, PublicFooter } from './PublicPage';

export const PublicBlogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Latest News mock data
  const latestNews = [
    {
      title: "You Should Have This Info Before Job Interview",
      author: "Sarah",
      date: "02 Oct",
      category: "Job Tips"
    },
    {
      title: "How To Create a Resume for a Job in Social",
      author: "Harding",
      date: "17 Sep",
      category: "Recruitment"
    },
    {
      title: "10 Ways to Avoid a Referee Disaster Zone",
      author: "Steven",
      date: "23 Sep",
      category: "Career Planning"
    },
    {
      title: "How To Set Work-Life Boundaries From Any Location",
      author: "Merias",
      date: "14 Sep",
      category: "Remote Work"
    },
    {
      title: "How to Land Your Dream Marketing Job",
      author: "Rosie",
      date: "12 Sep",
      category: "Placement"
    }
  ];

  // Categories mock data
  const categories = [
    { name: "Recruitment News", count: 28 },
    { name: "Job Venues", count: 32 },
    { name: "Full Time Job", count: 45 },
    { name: "Work From Home", count: 68 },
    { name: "Job Tips", count: 43 }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`Searching for: "${searchQuery}"`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Unified Header */}
      <PublicHeader />

      {/* Breadcrumbs Banner */}
      <div className="bg-slate-50 border-b border-slate-200/60 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-655">Blog</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          
          {/* Left Column: Blog Post Content */}
          <article className="lg:col-span-8 space-y-8">
            
            {/* Header: Title & Meta Info */}
            <div className="space-y-5 text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
                11 Companies That Hire for Remote Seasonal and Holiday Jobs
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>By <strong className="text-slate-700">Admin</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>06 Sep 2022</span>
                </div>
                
                {/* Bookmarks and Likes Toggles */}
                <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
                  <button 
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`hover:text-indigo-600 transition flex items-center gap-1 cursor-pointer ${bookmarked ? 'text-indigo-600' : ''}`}
                    title="Bookmark Article"
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={() => setLiked(!liked)}
                    className={`hover:text-rose-500 transition flex items-center gap-1 cursor-pointer ${liked ? 'text-rose-500' : ''}`}
                    title="Like Article"
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Image placeholder card */}
            <div className="w-full aspect-[21/9] bg-gradient-to-br from-indigo-500 via-indigo-650 to-purple-600 rounded-3xl relative overflow-hidden flex flex-col justify-end p-8 shadow-sm">
              <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
              <div className="relative z-10 space-y-2">
                <span className="bg-white/20 backdrop-blur text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/10">
                  Career Insights
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white max-w-lg">
                  Navigating the seasonal recruitment spikes from home.
                </h3>
              </div>
            </div>

            {/* Article Body */}
            <div className="space-y-6 text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              
              {/* Excerpt Callout */}
              <div className="border-l-4 border-indigo-600 bg-slate-50 rounded-r-2xl p-6 italic text-slate-700">
                <p>
                  "Helping everyone live happier, healthier lives at home through their kitchen. Kitchn is a daily food magazine on the Web celebrating life in the kitchen through home cooking and kitchen intelligence."
                </p>
              </div>

              <p>
                This is a site for people who like to get their hands dirty while they cook. It is for those who care about the quality of their food, and how it affects the health of themselves and the planet. It is for cooks who care about creating a beautiful kitchen. It’s a place to dive in deep, and embrace the joy of one of our basic needs: Food, cooked at home, nourishing ourselves and our households.
              </p>

              {/* Subheading */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-4">
                Get Yourself a Getaway Weekend
              </h3>
              
              <p>
                Tortor, lobortis semper viverra ac, molestie tortor laoreet amet euismod et diam quis aliquam consequat porttitor integer a nisl, in faucibus em eros est amet turpis nunc in turpis massa et eget facilisis ante molestie penatibus dolor volutpat, porta pellentesque scelerisque at ornare dui tincidunt cras feugiat tempor lectus.
              </p>

              {/* Grid of Inner Images */}
              <div className="grid gap-6 sm:grid-cols-2 pt-2">
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-6 flex flex-col justify-between text-white relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8" />
                  <Clock className="h-8 w-8 text-white/90" />
                  <div className="relative z-10">
                    <span className="text-[9px] font-black uppercase bg-white/20 px-2 py-0.5 rounded">Flexible Hours</span>
                    <h5 className="font-extrabold text-sm mt-1.5">Holiday Assistance Spikes</h5>
                  </div>
                </div>
                
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 p-6 flex flex-col justify-between text-white relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 -translate-y-8" />
                  <BookOpen className="h-8 w-8 text-white/90" />
                  <div className="relative z-10">
                    <span className="text-[9px] font-black uppercase bg-white/20 px-2 py-0.5 rounded">Skill Building</span>
                    <h5 className="font-extrabold text-sm mt-1.5">Workplace Preparedness</h5>
                  </div>
                </div>
              </div>

              <p>
                Sit quis semper sit sapien. Massa bibendum scelerisque metus phasellus semper sed. Enim, lacus faucibus aliquam id vitae a et pellentesque amet. Felis quam lacinia elementum arcu. Tempor ullamcorper donec sit arcu varius diam luctus ultrices.
              </p>
              
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet id enim, libero sit. Est donec lobortis cursus amet, cras elementum libero convallis feugiat. Nucilisi tincidunt a arcu, sem donec sed sed. Tincidunt morbi scelerisque lectus non. At leo mauris, vel augue. Facilisi diam consequat amet, commodo lorem nisl, odio malecras. Tempus lectus sed libero viverra ut. Facilisi rhoncus elit sit sit.
              </p>

            </div>
          </article>

          {/* Right Column: Sidebar Widgets */}
          <aside className="lg:col-span-4 space-y-10 lg:pl-6 border-t lg:border-t-0 pt-10 lg:pt-0 border-slate-200">
            
            {/* Widget 1: Search Form */}
            <div className="space-y-4">
              <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Search Article</h5>
              <form onSubmit={handleSearchSubmit} className="relative flex">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-10 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                />
                <button 
                  type="submit" 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Widget 2: Category list */}
            <div className="bg-slate-50/50 border border-slate-200/80 rounded-3xl p-6 space-y-5">
              <h5 className="font-black text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-200/60">
                Categories
              </h5>
              <ul className="space-y-3.5">
                {categories.map((cat, index) => (
                  <li key={index}>
                    <Link 
                      to="/blogs" 
                      className="flex items-center justify-between text-xs font-bold text-slate-655 hover:text-indigo-600 transition"
                    >
                      <span>{cat.name}</span>
                      <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full">
                        {cat.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Widget 3: Latest news */}
            <div className="space-y-5">
              <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                Latest News
              </h5>
              <div className="space-y-5">
                {latestNews.map((news, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    
                    {/* Small visual thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200/30">
                      <BookOpen className="h-5 w-5 text-indigo-500" />
                    </div>
                    
                    {/* Info */}
                    <div className="space-y-1.5">
                      <Link 
                        to="/blogs" 
                        className="text-xs font-extrabold text-slate-800 hover:text-indigo-600 transition line-clamp-2 leading-snug"
                      >
                        {news.title}
                      </Link>
                      
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-450 font-semibold">
                        <span className="text-indigo-650">{news.category}</span>
                        <span>•</span>
                        <span>{news.date}</span>
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </main>

      {/* Unified Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicBlogs;
