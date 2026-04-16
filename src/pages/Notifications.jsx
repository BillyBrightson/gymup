import { useState } from 'react';
import { useGym } from '../context/GymContext';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Bell, AlertTriangle, Clock, RefreshCw, Phone, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import SMSComposer from '../components/SMSComposer';
import { templates } from '../utils/sms';

export default function Notifications() {
  const { members, getExpiringMembers, getExpiredMembers, renewMembership, logSMS } = useGym();
  const [tab, setTab] = useState('expiring');
  const [renewModal, setRenewModal] = useState(null);
  const [renewPlan, setRenewPlan] = useState('Monthly');
  const [toast, setToast] = useState(null);
  const [days, setDays] = useState(7);
  const [smsTarget, setSmsTarget] = useState(null);   // { member, message }
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkIndex, setBulkIndex] = useState(0);

  const expiring = getExpiringMembers(days);
  const expired = getExpiredMembers();
  const suspended = members.filter(m => m.status === 'suspended');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleRenew = () => {
    renewMembership(renewModal.id, renewPlan);
    showToast(`${renewModal.name} renewed successfully!`);
    setRenewModal(null);
  };

  const openSMS = (member) => {
    const daysLeft = differenceInDays(parseISO(member.expiryDate), new Date());
    const msg = member.status === 'expired' ? templates.expired(member) : templates.expiryWarning(member);
    setSmsTarget({ member, message: msg });
  };

  // Bulk send — step through each member one by one
  const startBulkSend = () => {
    setBulkSending(true);
    setBulkIndex(0);
    const m = currentList[0];
    const msg = m.status === 'expired' ? templates.expired(m) : templates.expiryWarning(m);
    setSmsTarget({ member: m, message: msg });
  };

  const nextBulk = () => {
    const next = bulkIndex + 1;
    if (next >= currentList.length) {
      setBulkSending(false);
      setBulkIndex(0);
      showToast(`All ${currentList.length} members notified!`);
      return;
    }
    setBulkIndex(next);
    const m = currentList[next];
    const msg = m.status === 'expired' ? templates.expired(m) : templates.expiryWarning(m);
    setSmsTarget({ member: m, message: msg });
  };

  const tabs = [
    { key: 'expiring', label: 'Expiring Soon', count: expiring.length, color: 'text-amber-600' },
    { key: 'expired', label: 'Expired', count: expired.length, color: 'text-red-600' },
    { key: 'suspended', label: 'Suspended', count: suspended.length, color: 'text-gray-600' },
  ];

  const currentList = tab === 'expiring' ? expiring : tab === 'expired' ? expired : suspended;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {smsTarget && (
        <SMSComposer
          member={smsTarget.member}
          initialMessage={smsTarget.message}
          title={bulkSending ? `Sending ${bulkIndex + 1} of ${currentList.length}` : 'Send Notification'}
          subtitle={bulkSending ? 'Send then tap Next to continue' : undefined}
          onClose={() => {
            logSMS(smsTarget.member.id, smsTarget.member.name,
              smsTarget.member.status === 'expired' ? 'expired' : 'expiry_warning',
              smsTarget.message);
            setSmsTarget(null);
            if (bulkSending) nextBulk();
          }}
        />
      )}

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell size={24} className="text-orange-500" /> Notifications
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track membership expirations and send alerts</p>
      </div>

      {/* Summary banner */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{expiring.length}</p>
          <p className="text-xs text-amber-700 font-medium mt-1">Expiring Soon</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{expired.length}</p>
          <p className="text-xs text-red-700 font-medium mt-1">Expired</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-600">{suspended.length}</p>
          <p className="text-xs text-gray-600 font-medium mt-1">Suspended</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {t.label} ({t.count})
          </button>
        ))}
        {tab === 'expiring' && (
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none">
            <option value={3}>Next 3 days</option>
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 14 days</option>
            <option value={30}>Next 30 days</option>
          </select>
        )}
        {currentList.length > 0 && tab !== 'suspended' && (
          <button
            onClick={startBulkSend}
            className="ml-auto flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Send size={14} /> Notify All ({currentList.length})
          </button>
        )}
      </div>

      {/* Member list */}
      {currentList.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <Bell size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-500">No members in this category</p>
          <p className="text-sm text-gray-400 mt-1">Great news — everything looks good here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map(m => {
            const daysLeft = differenceInDays(parseISO(m.expiryDate), new Date());
            const urgency = daysLeft <= 1 ? 'high' : daysLeft <= 3 ? 'medium' : 'low';

            return (
              <div key={m.id} className={`bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4 card-hover ${
                m.status === 'expired' ? 'border-red-200 bg-red-50/30'
                : urgency === 'high' ? 'border-red-200'
                : urgency === 'medium' ? 'border-amber-200'
                : 'border-gray-100'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                  m.status === 'expired' ? 'bg-red-400'
                  : urgency === 'high' ? 'bg-red-400'
                  : urgency === 'medium' ? 'bg-amber-400'
                  : 'bg-amber-300'
                }`}>
                  {m.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/members/${m.id}`} className="font-bold text-gray-900 hover:text-orange-600">{m.name}</Link>
                    <span className="text-xs text-gray-400">{m.memberNumber}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{m.plan}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone size={11} /> {m.phone}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={11} />
                      {m.status === 'expired'
                        ? `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`
                        : daysLeft === 0 ? 'Expires TODAY'
                        : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                      }
                      {' '}· {format(parseISO(m.expiryDate), 'd MMM yyyy')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {(tab === 'expiring' || tab === 'expired') && urgency === 'high' && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-red-600 font-semibold">
                      <AlertTriangle size={12} /> Urgent!
                    </span>
                  )}
                  {tab !== 'suspended' && (
                    <button
                      onClick={() => openSMS(m)}
                      className="flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl font-semibold transition-colors"
                      title="Send SMS or WhatsApp"
                    >
                      <MessageSquare size={12} /> Notify
                    </button>
                  )}
                  <button
                    onClick={() => { setRenewModal(m); setRenewPlan(m.plan); }}
                    className="flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-xl font-semibold transition-colors"
                  >
                    <RefreshCw size={12} /> Renew
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick action tip */}
      {tab === 'expiring' && expiring.length > 0 && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-2xl p-4 text-sm text-orange-800">
          <p className="font-semibold mb-1">Tip: Contact members before their subscription expires!</p>
          <p className="text-orange-700 text-xs">Reach out via phone or WhatsApp to remind them to renew. Early renewals help you maintain a steady income.</p>
        </div>
      )}

      {/* Renew modal */}
      {renewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Renew Membership</h3>
            <p className="text-gray-500 text-sm mb-5">{renewModal.name} · {renewModal.memberNumber}</p>
            <div className="space-y-3 mb-5">
              {[{ key: 'Monthly', amount: 200, desc: '1 month' }, { key: 'Quarterly', amount: 550, desc: '3 months · Save ₵50' }, { key: 'Annual', amount: 1800, desc: '12 months · Save ₵600' }].map(p => (
                <button key={p.key} onClick={() => setRenewPlan(p.key)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${renewPlan === p.key ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{p.key}</p>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                  <p className="font-bold text-orange-600">₵{p.amount}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRenewModal(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700">Cancel</button>
              <button onClick={handleRenew} className="flex-1 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
