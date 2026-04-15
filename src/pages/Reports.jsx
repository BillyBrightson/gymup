import { useGym } from '../context/GymContext';
import { format, subMonths, parseISO, differenceInDays } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, Banknote, Award } from 'lucide-react';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7'];
const PLAN_COLORS = { Monthly: '#f97316', Quarterly: '#3b82f6', Annual: '#22c55e' };

export default function Reports() {
  const { members, payments, attendance } = useGym();
  const today = new Date();

  // Revenue last 6 months
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(today, 5 - i);
    const key = format(d, 'yyyy-MM');
    const month = format(d, 'MMM yy');
    const revenue = payments.filter(p => p.date.startsWith(key)).reduce((s, p) => s + p.amount, 0);
    const newMembers = payments.filter(p => p.date.startsWith(key) && p.type === 'new').length;
    const renewals = payments.filter(p => p.date.startsWith(key) && p.type === 'renewal').length;
    return { month, revenue, newMembers, renewals };
  });

  // Plan distribution
  const planData = ['Monthly', 'Quarterly', 'Annual'].map(plan => ({
    name: plan,
    value: members.filter(m => m.plan === plan && m.status === 'active').length,
  })).filter(d => d.value > 0);

  // Gender distribution
  const genderData = ['Male', 'Female'].map(g => ({
    name: g,
    value: members.filter(m => m.gender === g).length,
  }));

  // Attendance last 7 days
  const attendanceData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = format(d, 'yyyy-MM-dd');
    return {
      day: format(d, 'EEE'),
      count: attendance.filter(a => a.date === key).length,
    };
  });

  // Top members by visits
  const memberVisits = members.map(m => ({
    ...m,
    visits: attendance.filter(a => a.memberId === m.id).length,
  })).sort((a, b) => b.visits - a.visits).slice(0, 5);

  // Revenue by plan type
  const revenueByPlan = ['Monthly', 'Quarterly', 'Annual'].map(plan => ({
    plan,
    revenue: payments.filter(p => p.plan === plan).reduce((s, p) => s + p.amount, 0),
  }));

  const avgRevenuePerMember = members.length > 0 ? Math.round(payments.reduce((s, p) => s + p.amount, 0) / members.length) : 0;
  const retentionRate = members.length > 0 ? Math.round((members.filter(m => m.status === 'active').length / members.length) * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Business overview for GymUp Fitness Centre</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `₵${payments.reduce((s,p)=>s+p.amount,0).toLocaleString()}`, sub: 'All time', icon: Banknote, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Active Members', value: `${members.filter(m=>m.status==='active').length}`, sub: `of ${members.length} total`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Retention Rate', value: `${retentionRate}%`, sub: 'Active vs total', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Avg. Revenue/Member', value: `₵${avgRevenuePerMember}`, sub: 'Lifetime avg.', icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.bg}`}>
                <k.icon size={18} className={k.color} />
              </div>
              <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Attendance row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Revenue (GHS)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₵${v}`} />
              <Tooltip formatter={(v) => [`₵${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#f97316" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Attendance — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Check-ins']} />
              <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan dist + Gender + Top members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Active Plan Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={planData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {planData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {planData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue by Plan</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueByPlan} barSize={30} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `₵${v}`} />
              <YAxis type="category" dataKey="plan" tick={{ fontSize: 11 }} width={65} />
              <Tooltip formatter={(v) => [`₵${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#f97316" radius={[0,5,5,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Top Active Members</h2>
          <div className="space-y-3">
            {memberVisits.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.plan}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-orange-600">{m.visits}</p>
                  <p className="text-xs text-gray-400">visits</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New vs Renewals */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">New Registrations vs Renewals (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData} barSize={18} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="newMembers" name="New Registrations" fill="#22c55e" radius={[4,4,0,0]} />
            <Bar dataKey="renewals" name="Renewals" fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
