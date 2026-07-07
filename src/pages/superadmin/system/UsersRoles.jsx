import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, ChevronRight, Loader, Shield, UserCheck, UserPlus, Users, X } from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

// Colors pulled directly from the source template's CSS custom properties
// (--ins-*-bg-subtle / --ins-* for the default light skin)
const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, bg: '#e8e6fa', fg: '#6658dd', align: 'center' },
  { key: 'activeUsers', label: 'Active Users', icon: UserCheck, bg: '#ddf5f0', fg: '#1abc9c', align: 'start' },
  { key: 'totalRoles', label: 'Total Roles', icon: Shield, bg: '#fef4e4', fg: '#f7b84b', align: 'start' },
  { key: 'newThisMonth', label: 'New This Month', icon: UserPlus, bg: '#e3f5fb', fg: '#43bfe5', align: 'start' },
];

const actionItems = [
  {
    to: '/admin/users-roles/users',
    icon: Users,
    iconBg: '#2563eb',
    title: 'Manage Users',
    subtitle: 'View, create, edit, and manage all admin users. Control user access and account status.',
  },
  {
    to: '/admin/users-roles/roles',
    icon: Shield,
    iconBg: '#9333ea',
    title: 'Manage Roles',
    subtitle: 'Define roles and assign granular permissions to control access to modules and features.',
  },
];

// .card: bg #fff, border-radius 0.3rem, box-shadow: 0 0.75rem 6rem rgba(56,65,74,.03), no border
const cardClass = 'min-w-0 bg-white rounded-[0.3rem] shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)]';

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
    <div className="min-w-0 space-y-5">
      {/* .page-title-head: fs-xl(18px) fw-bold(700); breadcrumb items use body-color / secondary-color */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-[18px] font-bold text-[#4c4c5c] m-0">Users & Roles</h4>
        <ol className="flex items-center m-0 p-0 list-none text-sm">
          <li>
            <Link to="/admin" className="text-[#4c4c5c] hover:text-[#6658dd]">JobsWaale</Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="w-3.5 h-3.5 mx-1 text-[#9ba6b7]" />
            <span className="text-[#9ba6b7]">Users & Roles</span>
          </li>
        </ol>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-[0.3rem] border text-sm font-medium bg-rose-50 border-rose-100 text-rose-800">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="ml-auto rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[160px]">
          <Loader className="w-8 h-8 animate-spin text-[#6658dd]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              /* .card-body p-3 (Bootstrap p-3 = 1rem = 16px) */
              <div key={card.key} className={`${cardClass} p-4`}>
                <div className={`flex justify-between ${card.align === 'center' ? 'items-center' : 'items-start'}`}>
                  {/* .avatar-xl (48px) + .rounded (0.3rem) */}
                  <div
                    className="w-12 h-12 rounded-[0.3rem] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: card.bg, color: card.fg }}
                  >
                    {/* .fs-28 = 28px */}
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-[24.5px] font-semibold text-[#4c4c5c] mb-0 leading-tight">{formatNumber(stats[card.key])}</h3>
                    <p className="text-sm text-[#9ba6b7] mb-0">{card.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={`${cardClass} overflow-hidden`}>
        {/* .card-header: padding 1.125rem 1.5rem, no visible border (border-width: 0 by default) */}
        <div className="py-[18px] px-6">
          <h5 className="text-base font-semibold text-[#4c4c5c] mb-1">Manage Users & Roles</h5>
          <p className="text-sm text-[#4c4c5c] mb-0">
            Create and manage system users, assign roles and permissions, and control access to different sections of the admin panel.
          </p>
        </div>
        {/* .card-body default padding: 1.5rem */}
        <div className="p-6">
          {/* .row.g-3: 1rem gutter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                /* .action-item: border 1px solid #e9edf5, border-radius 12px, padding 10.5px */
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center p-[10.5px] rounded-xl border border-[#e9edf5] transition-all duration-300 cursor-pointer hover:border-[#d8e0ee] hover:bg-[#f2f6fc] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                >
                  {/* .action-icon: 38px, border-radius 8px, icon 22px, white icon on solid color */}
                  <div
                    className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <Icon className="w-[22px] h-[22px]" />
                  </div>

                  <div className="ml-3 flex-grow mr-3">
                    {/* .action-title: 14px, font-weight 700, color #0f172a */}
                    <div className="text-sm font-bold text-[#0f172a]">{item.title}</div>
                    {/* .action-subtitle: color #64748b */}
                    <div className="text-sm text-[#64748b]">{item.subtitle}</div>
                  </div>

                  {/* .arrow-icon: 24px, color #334155, bold */}
                  <ChevronRight className="w-6 h-6 text-[#334155]" strokeWidth={2.5} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersRoles;