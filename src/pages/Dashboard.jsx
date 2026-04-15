import { useGym } from '../context/GymContext';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  Users, TrendingUp, AlertTriangle, UserCheck,
  CalendarCheck, Banknote, ArrowRight, Clock, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

function StatCard({ label, value, sub, icon: Icon, color, to }) {
  const card = (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600','').replace('-500','').replace('-700','') + '-100'}`}>
          <Icon size={22} className={color} />
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#6b7280'];

export default function Dashboard() {
  const { stats, members, payments, attendance, getExpiringMembers } = useGym();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const expiring = getExpiringMembers(7);

  // Revenue last 6 months
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
    const key = format(d, 'yyyy-MM');
    const total = payments
      .filter(p => p.date.startsWith(key))
      .reduce((s, p) => s + p.amount, 0);
    return { month: format(d, 'MMM'), revenue: total };
  });

  const pieData = [
    { name: 'Active', value: stats.active },
    { name: 'Expired', value: stats.expired },
    { name: 'Expiring Soon', value: stats.expiringThisWeek },
    { name: 'Suspended', value: stats.suspended },
  ].filter(d => d.value > 0);

  const todayAttendees = attendance.filter(a => a.date === todayStr);
  const recentPayments = [...payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{format(today, "EEEE, MMMM d, yyyy")} — GymUp Fitness Centre</p>
      </div>

      {/* Alert banner for expiring members */}
      {expiring.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">
              {expiring.length} member{expiring.length > 1 ? 's' : ''} expiring within 7 days
            </p>
            <p className="text-amber-700 text-xs mt-0.5">
              {expiring.map(m => m.name).join(', ')}
            </p>
          </div>
          <Link to="/notifications" className="text-xs text-amber-700 font-semibold hover:underline flex-shrink-0">
            View all →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Members" value={stats.total} sub="All registered" icon={Users} color="text-blue-600" to="/members" />
        <StatCard label="Active Members" value={stats.active} sub="Valid subscriptions" icon={UserCheck} color="text-green-600" to="/members" />
        <StatCard label="Today's Attendance" value={stats.todayAttendance} sub={format(today, 'EEE, d MMM')} icon={CalendarCheck} color="text-orange-500" to="/attendance" />
        <StatCard label="Month Revenue" value={`₵${stats.monthRevenue.toLocaleString()}`} sub={format(today, 'MMMM yyyy')} icon={Banknote} color="text-purple-600" to="/payments" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Monthly Revenue (GHS)</h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₵${v}`} />
              <Tooltip formatter={(v) => [`₵${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#f97316" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Membership pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Member Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's check-ins */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Today's Check-ins</h2>
            <Link to="/attendance" className="text-xs text-orange-500 font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {todayAttendees.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CalendarCheck size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No check-ins yet today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAttendees.slice(0, 5).map(a => {
                const member = members.find(m => m.id === a.memberId);
                return (
                  <div key={a.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                      {a.memberName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{a.memberName}</p>
                      <p className="text-xs text-gray-400">{member?.plan} plan</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <Clock size={11} /> {a.checkIn}
                      </p>
                      {a.checkOut && <p className="text-xs text-gray-400">Out: {a.checkOut}</p>}
                    </div>
                  </div>
                );
              })}
              {todayAttendees.length > 5 && (
                <p className="text-xs text-center text-gray-400">+{todayAttendees.length - 5} more</p>
              )}
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Payments</h2>
            <Link to="/payments" className="text-xs text-orange-500 font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentPayments.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${p.type === 'new' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <Banknote size={16} className={p.type === 'new' ? 'text-green-600' : 'text-blue-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.memberName}</p>
                  <p className="text-xs text-gray-400">{p.plan} · {p.type === 'new' ? 'New reg.' : 'Renewal'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">₵{p.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{format(parseISO(p.date), 'd MMM')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expiring soon list */}
      {expiring.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Expiring Soon (Next 7 Days)
            </h2>
            <Link to="/notifications" className="text-xs text-orange-500 font-semibold hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiring.map(m => {
              const daysLeft = differenceInDays(parseISO(m.expiryDate), new Date());
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{m.name}</p>
                    <p className="text-xs text-amber-700">{daysLeft === 0 ? 'Expires today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
