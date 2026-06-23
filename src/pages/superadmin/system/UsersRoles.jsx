import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, ChevronRight, Loader, Shield, UserCheck, UserPlus, Users } from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, tone: 'bg-indigo-50 text-indigo-600' },
  { key: 'activeUsers', label: 'Active Users', icon: UserCheck, tone: 'bg-emerald-50 text-emerald-600' },
  { key: 'totalRoles', label: 'Total Roles', icon: Shield, tone: 'bg-amber-50 text-amber-600' },
  { key: 'newThisMonth', label: 'New This Month', icon: UserPlus, tone: 'bg-sky-50 text-sky-600' },
];

const UsersRoles = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    newThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${BASE_API_URL}/admin/stats`);
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users and roles stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">Users & Roles</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <Link to="/admin" className="hover:text-indigo-600">JobsWaale</Link>
          <span>&gt;</span>
          <Link to="/admin/users-roles" className="text-indigo-600 hover:text-indigo-700">Users & Roles</Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium bg-rose-50 border-rose-100 text-rose-800">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[160px]">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.key} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${card.tone}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-extrabold text-slate-800 mb-0">{formatNumber(stats[card.key])}</h3>
                    <p className="text-sm text-slate-500 mb-0">{card.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h5 className="text-base font-bold text-slate-800 mb-1">Manage Users & Roles</h5>
          <p className="text-sm text-slate-500 mb-0">
            Create and manage system users, assign roles and permissions, and control access to different sections of the admin panel.
          </p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Link to="/admin/users-roles/users" className="flex items-center p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-slate-50 transition-colors">
              <div className="w-14 h-14 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div className="ml-4 flex-grow mr-3">
                <div className="text-xl font-bold text-slate-800">Manage Users</div>
                <div className="text-sm text-slate-500">View, create, edit, and manage all admin users. Control user access and account status.</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>

            <Link to="/admin/users-roles/roles" className="flex items-center p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-slate-50 transition-colors">
              <div className="w-14 h-14 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Shield className="w-7 h-7" />
              </div>
              <div className="ml-4 flex-grow mr-3">
                <div className="text-xl font-bold text-slate-800">Manage Roles</div>
                <div className="text-sm text-slate-500">Define roles and assign granular permissions to control access to modules and features.</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersRoles;
