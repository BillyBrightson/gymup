import { useState } from 'react';
import { useGym } from '../context/GymContext';
import { format, parseISO } from 'date-fns';
import { Banknote, Search, TrendingUp, RefreshCw, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Payments() {
  const { payments, members, stats, renewMembership, PLAN_AMOUNTS } = useGym();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [sortDir, setSortDir] = useState('desc');
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewSearch, setRenewSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [renewPlan, setRenewPlan] = useState('Monthly');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = payments
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.memberName.toLowerCase().includes(q) || p.receiptNo.toLowerCase().includes(q);
      const matchType = filterType === 'all' || p.type === filterType;
      const matchPlan = filterPlan === 'all' || p.plan === filterPlan;
      return matchSearch && matchType && matchPlan;
    })
    .sort((a, b) => sortDir === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));

  const thisMonth = format(new Date(), 'yyyy-MM');
  const monthPayments = payments.filter(p => p.date.startsWith(thisMonth));
  const monthRevenue = monthPayments.reduce((s, p) => s + p.amount, 0);
  const newCount = monthPayments.filter(p => p.type === 'new').length;
  const renewCount = monthPayments.filter(p => p.type === 'renewal').length;

  const renewMemberSearch = renewSearch.length >= 2
    ? members.filter(m => m.name.toLowerCase().includes(renewSearch.toLowerCase()) || m.phone.includes(renewSearch))
    : [];

  const handleRenew = () => {
    if (!selectedMember) return;
    renewMembership(selectedMember.id, renewPlan);
    setShowRenewModal(false);
    setSelectedMember(null);
    setRenewSearch('');
    showToast(`${selectedMember.name}'s membership renewed!`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">{payments.length} total transactions</p>
        </div>
        <button
          onClick={() => setShowRenewModal(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <RefreshCw size={16} /> Record Renewal
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">This Month</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₵{monthRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">{format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">₵{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">New Registrations</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{newCount}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Renewals</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{renewCount}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or receipt..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none">
          <option value="all">All Types</option>
          <option value="new">New Registration</option>
          <option value="renewal">Renewal</option>
        </select>
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none">
          <option value="all">All Plans</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Annual">Annual</option>
        </select>
        <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm hover:bg-gray-50 flex items-center gap-1">
          <TrendingUp size={14} /> {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* Payments table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <div className="col-span-3">Member</div>
          <div className="col-span-2">Receipt</div>
          <div className="col-span-2">Plan</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-1">Amount</div>
          <div className="col-span-2">Date</div>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Banknote size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No payment records found</p>
          </div>
        ) : (
          filtered.map((p, idx) => (
            <div key={p.id} className={`grid grid-cols-12 gap-4 px-5 py-4 items-center border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                  {p.memberName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <Link to={`/members/${p.memberId}`} className="text-sm font-semibold text-gray-800 hover:text-orange-600 truncate block">{p.memberName}</Link>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{p.receiptNo}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{p.plan}</span>
              </div>
              <div className="col-span-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.type === 'new' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                  {p.type === 'new' ? 'New Reg.' : 'Renewal'}
                </span>
              </div>
              <div className="col-span-1">
                <span className="text-sm font-bold text-gray-900">₵{p.amount.toLocaleString()}</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600">{format(parseISO(p.date), 'd MMM yyyy')}</span>
              </div>
            </div>
          ))
        )}
        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
            <span className="text-xs text-gray-500">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
            <span className="text-sm font-bold text-gray-800">
              Total: ₵{filtered.reduce((s, p) => s + p.amount, 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Renewal Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Record Renewal Payment</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Member</label>
              <input
                value={renewSearch} onChange={e => { setRenewSearch(e.target.value); setSelectedMember(null); }}
                placeholder="Name or phone number..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              {renewMemberSearch.length > 0 && !selectedMember && (
                <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden">
                  {renewMemberSearch.map(m => (
                    <button key={m.id} onClick={() => { setSelectedMember(m); setRenewSearch(m.name); setRenewPlan(m.plan); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-left border-b last:border-0">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{m.name}</p>
                        <p className="text-xs text-gray-400">{m.memberNumber} · {m.plan}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedMember && (
              <>
                <div className="bg-orange-50 rounded-xl p-3 mb-4 text-sm">
                  <p className="font-semibold text-orange-800">{selectedMember.name}</p>
                  <p className="text-orange-600 text-xs">{selectedMember.memberNumber} · Current: {selectedMember.plan}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select New Plan</label>
                  <div className="space-y-2">
                    {[{ key: 'Monthly', amount: 200, desc: '1 month' }, { key: 'Quarterly', amount: 550, desc: '3 months' }, { key: 'Annual', amount: 1800, desc: '12 months' }].map(p => (
                      <button key={p.key} onClick={() => setRenewPlan(p.key)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${renewPlan === p.key ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                        <span className="text-sm font-semibold">{p.key} <span className="font-normal text-gray-500 text-xs">· {p.desc}</span></span>
                        <span className="font-bold text-orange-600">₵{p.amount}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowRenewModal(false); setSelectedMember(null); setRenewSearch(''); }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700">Cancel</button>
              <button onClick={handleRenew} disabled={!selectedMember}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
