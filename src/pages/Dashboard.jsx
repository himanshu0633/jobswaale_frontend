import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { 
  Building, 
  Users, 
  Briefcase, 
  IndianRupee, 
  Loader
} from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState({ employers: 0, jobseekers: 0, jobsPosted: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/masters/dashboard/stats`);
      setStats({
        employers: response.data.employers || 0,
        jobseekers: response.data.jobseekers || 0,
        jobsPosted: response.data.jobsPosted || 0,
        revenue: response.data.revenue || 0
      });
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Employers', 
      value: stats.employers, 
      icon: Building, 
      bgIcon: 'bg-indigo-50 text-indigo-500 border border-indigo-100' 
    },
    { 
      title: 'Jobseekers', 
      value: stats.jobseekers, 
      icon: Users, 
      bgIcon: 'bg-emerald-50 text-emerald-500 border border-emerald-100' 
    },
    { 
      title: 'Jobs Posted', 
      value: stats.jobsPosted, 
      icon: Briefcase, 
      bgIcon: 'bg-sky-50 text-sky-500 border border-sky-100' 
    },
    { 
      title: 'Revenue', 
      value: `₹${stats.revenue.toLocaleString('en-IN')}`, 
      icon: IndianRupee, 
      bgIcon: 'bg-amber-50 text-amber-500 border border-amber-100' 
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      
      {/* Title & Breadcrumbs Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span>JobsWaale</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Dashboard</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index}
              className="flex items-center justify-between p-6 bg-white border border-slate-200/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Left Circle Icon */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${card.bgIcon}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Right Count Info */}
              <div className="text-right">
                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  {card.value}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1.5">
                  {card.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer pushed to bottom */}
      <div className="mt-auto pt-10 pb-4 text-center">
        <p className="text-xs font-semibold text-slate-400">
          © 2026 JobsWaale By Duke Infosys
        </p>
      </div>

    </div>
  );
};

export default Dashboard;
