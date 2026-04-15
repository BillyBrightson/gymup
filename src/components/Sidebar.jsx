import { NavLink } from 'react-router-dom';
import { useGym } from '../context/GymContext';
import {
  LayoutDashboard, Users, CalendarCheck, CreditCard,
  Bell, BarChart3, Settings, Dumbbell, LogOut
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function Sidebar({ mobile, onClose }) {
  const { stats } = useGym();

  return (
    <aside className="flex flex-col h-full bg-gray-900 text-white w-64 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
          <Dumbbell size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">GymUp</h1>
          <p className="text-xs text-gray-400">Fitness Centre</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors sidebar-item ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === 'Notifications' && stats.expiringThisWeek > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {stats.expiringThisWeek}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom stats */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="bg-gray-800 rounded-xl p-3 mb-3">
          <p className="text-xs text-gray-400 mb-2">Today's Overview</p>
          <div className="flex justify-between text-xs">
            <div className="text-center">
              <p className="font-bold text-lg text-white">{stats.active}</p>
              <p className="text-gray-400">Active</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-orange-400">{stats.todayAttendance}</p>
              <p className="text-gray-400">Today In</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-red-400">{stats.expiringThisWeek}</p>
              <p className="text-gray-400">Expiring</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
            GO
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Gym Owner</p>
            <p className="text-xs text-gray-400 truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
