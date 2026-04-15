import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGym } from '../context/GymContext';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Search, Plus, Filter, UserCheck, Clock, XCircle, Phone, RefreshCw, Eye } from 'lucide-react';

function StatusBadge({ status, expiryDate }) {
  if (status === 'expired') return <span className="badge-expired">Expired</span>;
  if (status === 'suspended') return <span className="badge-suspended">Suspended</span>;
  const days = differenceInDays(parseISO(expiryDate), new Date());
  if (days <= 7) return <span className="badge-expiring">Expiring in {days}d</span>;
  return <span className="badge-active">Active</span>;
}

export default function Members() {
  const { members } = useGym();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filtered = members
    .filter(m => {
      const q = search.toLowerCase();
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.phone.includes(q) || m.memberNumber.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || m.status === filterStatus || (filterStatus === 'expiring' && differenceInDays(parseISO(m.expiryDate), new Date()) <= 7 && m.status === 'active');
      const matchPlan = filterPlan === 'all' || m.plan === filterPlan;
      return matchSearch && matchStatus && matchPlan;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'expiry') return a.expiryDate.localeCompare(b.expiryDate);
      if (sortBy === 'recent') return b.registrationDate.localeCompare(a.registrationDate);
      return 0;
    });

  const counts = {
    all: members.length,
    active: members.filter(m => m.status === 'active').length,
    expired: members.filter(m => m.status === 'expired').length,
    suspended: members.filter(m => m.status === 'suspended').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-500 text-sm mt-1">{counts.all} total members registered</p>
        </div>
        <Link
          to="/members/add"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <Plus size={18} /> Add Member
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'active', label: 'Active', count: counts.active },
          { key: 'expiring', label: 'Expiring Soon', count: null },
          { key: 'expired', label: 'Expired', count: counts.expired },
          { key: 'suspended', label: 'Suspended', count: counts.suspended },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterStatus === tab.key
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label} {tab.count !== null && <span className="ml-1 opacity-75">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Search & filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, member #..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <select
          value={filterPlan}
          onChange={e => setFilterPlan(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
        >
          <option value="all">All Plans</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Annual">Annual</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none"
        >
          <option value="name">Sort: Name</option>
          <option value="expiry">Sort: Expiry</option>
          <option value="recent">Sort: Recent</option>
        </select>
      </div>

      {/* Members grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <UserCheck size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No members found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => {
            const daysLeft = differenceInDays(parseISO(m.expiryDate), new Date());
            return (
              <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.memberNumber}</p>
                    <div className="mt-1">
                      <StatusBadge status={m.status} expiryDate={m.expiryDate} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={12} />
                    <span>{m.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <RefreshCw size={12} />
                    <span>{m.plan} Plan</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>
                      Expires: {format(parseISO(m.expiryDate), 'd MMM yyyy')}
                      {m.status === 'active' && daysLeft >= 0 && (
                        <span className={`ml-1 font-medium ${daysLeft <= 7 ? 'text-amber-600' : 'text-green-600'}`}>
                          ({daysLeft === 0 ? 'today' : `${daysLeft}d left`})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/members/${m.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-orange-600 border border-orange-200 rounded-lg py-2 hover:bg-orange-50 transition-colors"
                  >
                    <Eye size={13} /> View
                  </Link>
                  <Link
                    to={`/members/${m.id}/renew`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-orange-500 rounded-lg py-2 hover:bg-orange-600 transition-colors"
                  >
                    <RefreshCw size={13} /> Renew
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
