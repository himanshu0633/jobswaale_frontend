import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, ChevronLeft, Search } from 'lucide-react';
import { BASE_API_URL } from '../context/AuthContext';
import logoAsset from '../assets/logo.png';

const stripHtml = (html = '') => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
};

const PublicHeader = () => (
  <header className="sticky top-0 z-30 bg-white/95 border-b border-slate-200 backdrop-blur">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-5">
      <Link to="/" className="flex items-center gap-3">
        <img src={logoAsset} alt="JobsWaale" className="h-10 w-auto object-contain" />
      </Link>
    </div>
  </header>
);

const BlogList = ({ blogs }) => {
  const [query, setQuery] = useState('');
  const filteredBlogs = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return blogs;
    return blogs.filter(blog => (
      blog.title?.toLowerCase().includes(search)
      || blog.category?.name?.toLowerCase().includes(search)
      || stripHtml(blog.content).toLowerCase().includes(search)
    ));
  }, [blogs, query]);

  return (
    <main>
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">JobsWaale Blog</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950">Latest career updates</h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Read hiring insights, job search tips, and platform updates from JobsWaale.
              </p>
            </div>
            <label className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search blogs"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {filteredBlogs.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
            <h2 className="text-xl font-bold text-slate-900">No blogs found</h2>
            <p className="mt-2 text-sm text-slate-500">Active blogs added from admin will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => {
              const excerpt = stripHtml(blog.content).slice(0, 150);
              return (
                <article key={blog._id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <Link to={`/blogs/${blog.slug}`} className="block">
                    <div className="aspect-[16/10] bg-slate-100">
                      {blog.featuredImage ? (
                        <img src={blog.featuredImage} alt={blog.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                        {blog.category?.name && <span className="text-indigo-600">{blog.category.name}</span>}
                        {formatDate(blog.createDate) && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(blog.createDate)}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 line-clamp-2 text-lg font-bold text-slate-950">{blog.title}</h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{excerpt}{excerpt.length === 150 ? '...' : ''}</p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

const BlogDetail = ({ blog }) => (
  <main>
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-500">
        <ChevronLeft className="h-4 w-4" />
        Back to blogs
      </Link>
      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
          {blog.category?.name && <span className="text-indigo-600">{blog.category.name}</span>}
          {formatDate(blog.createDate) && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {formatDate(blog.createDate)}
            </span>
          )}
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-950">{blog.title}</h1>
      </div>

      {blog.featuredImage && (
        <img src={blog.featuredImage} alt={blog.title} className="mt-8 max-h-[460px] w-full rounded-lg object-cover" />
      )}

      <div
        className="prose prose-slate mt-8 max-w-none text-slate-700"
        dangerouslySetInnerHTML={{ __html: blog.content || '' }}
      />
    </article>
  </main>
);

export const PublicBlogs = () => {
  const { slug } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      setBlog(null);

      try {
        if (slug) {
          const response = await axios.get(`${BASE_API_URL}/cms/public/blogs/${encodeURIComponent(slug)}`);
          setBlog(response.data);
        } else {
          const response = await axios.get(`${BASE_API_URL}/cms/public/blogs`);
          setBlogs(response.data || []);
        }
      } catch (err) {
        setError(err.response?.status === 404 ? 'Blog not found' : 'Blogs could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />

      {loading ? (
        <main className="min-h-[60vh] flex items-center justify-center text-sm font-semibold text-slate-500">Loading...</main>
      ) : error ? (
        <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl font-bold text-slate-900">{error}</h1>
          <Link to="/blogs" className="mt-4 text-indigo-600 font-semibold">Go to blogs</Link>
        </main>
      ) : slug ? (
        <BlogDetail blog={blog} />
      ) : (
        <BlogList blogs={blogs} />
      )}
    </div>
  );
};

export default PublicBlogs;
