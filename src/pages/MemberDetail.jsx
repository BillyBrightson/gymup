import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGym } from '../context/GymContext';
import { format, differenceInDays, parseISO } from 'date-fns';
import {
  ArrowLeft, Phone, Mail, Calendar, RefreshCw, Trash2,
  CalendarCheck, Banknote, Edit3, Save, X, AlertTriangle, CheckCircle
} from 'lucide-react';

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, payments, attendance, updateMember, deleteMember, renewMembership, PLAN_AMOUNTS } = useGym();
  const member = members.find(m => m.id === id);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [showRenew, setShowRenew] = useState(useParams().action === 'renew');
  const [renewPlan, setRenewPlan] = useState('Monthly');
  const [renewSuccess, setRenewSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!member) return (
    <div className="p-6 text-center text-gray-400">
      <p className="text-lg font-semibold">Member not found</p>
      <Link to="/members" className="text-orange-500 hover:underline text-sm">Back to Members</Link>
    </div>
  );

  const memberPayments = payments.filter(p => p.memberId === id).sort((a, b) => b.date.localeCompare(a.date));
  const memberAttendance = attendance.filter(a => a.memberId === id).sort((a, b) => b.date.localeCompare(a.date));
  const daysLeft = differenceInDays(parseISO(member.expiryDate), new Date());

  const handleRenew = () => {
    renewMembership(id, renewPlan);
    setRenewSuccess(true);
    setShowRenew(false);
    setTimeout(() => setRenewSuccess(false), 3000);
  };

  const handleDelete = () => {
    deleteMember(id);
    navigate('/members');
  };

  const startEdit = () => {
    setEditForm({ ...member });
    setEditing(true);
  };

  const saveEdit = () => {
    updateMember(id, editForm);
    setEditing(false);
  };

  const statusColor = member.status === 'active'
    ? (daysLeft <= 7 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800')
    : member.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700';

  const statusLabel = member.status === 'active'
    ? (daysLeft <= 7 ? `Expiring in ${daysLeft} days` : 'Active')
    : member.status === 'expired' ? 'Expired' : 'Suspended';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/members')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6">
        <ArrowLeft size={16} /> Back to Members
      </button>

      {renewSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-green-800 text-sm">
          <CheckCircle size={16} /> Membership renewed successfully!
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {member.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                className="text-2xl font-bold border-b-2 border-orange-400 outline-none w-full mb-1" />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
            )}
            <p className="text-gray-500 text-sm">{member.memberNumber} · Registered {format(parseISO(member.registrationDate), 'd MMM yyyy')}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full">{member.plan} Plan</span>
              <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full">{member.gender}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {editing ? (
              <>
                <button onClick={saveEdit} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600"><Save size={16} /></button>
                <button onClick={() => setEditing(false)} className="p-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"><X size={16} /></button>
              </>
            ) : (
              <>
                <button onClick={startEdit} className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"><Edit3 size={16} /></button>
                <button onClick={() => setConfirmDelete(true)} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"><Trash2 size={16} /></button>
              </>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={15} className="text-gray-400" />
            {editing ? (
              <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                className="border-b border-gray-300 outline-none text-sm" />
            ) : <span>{member.phone}</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={15} className="text-gray-400" />
            {editing ? (
              <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                className="border-b border-gray-300 outline-none text-sm" />
            ) : <span>{member.email || '—'}</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={15} className="text-orange-400" />
            <span>Emergency: {member.emergencyContact || '—'}</span>
          </div>
        </div>
      </div>

      {/* Membership status card */}
      <div className={`rounded-2xl p-5 mb-4 ${member.status === 'expired' ? 'bg-red-50 border border-red-200' : daysLeft <= 7 ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Membership Period</p>
            <p className="text-lg font-bold text-gray-900">
              {format(parseISO(member.startDate), 'd MMM yyyy')} → {format(parseISO(member.expiryDate), 'd MMM yyyy')}
            </p>
            {member.status === 'expired' ? (
              <p className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1">
                <AlertTriangle size={14} /> Membership expired {Math.abs(daysLeft)} days ago
              </p>
            ) : daysLeft <= 7 ? (
              <p className="text-amber-700 text-sm font-medium mt-1 flex items-center gap-1">
                <AlertTriangle size={14} /> Expiring in {daysLeft} day{daysLeft !== 1 ? 's' : ''}!
              </p>
            ) : (
              <p className="text-green-700 text-sm mt-1">{daysLeft} days remaining</p>
            )}
          </div>
          <button
            onClick={() => setShowRenew(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <RefreshCw size={15} /> Renew
          </button>
        </div>
      </div>

      {/* Renew modal */}
      {showRenew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Renew Membership</h3>
            <p className="text-gray-500 text-sm mb-5">{member.name}</p>
            <div className="space-y-3 mb-5">
              {[
                { key: 'Monthly', amount: 200, desc: '1 month' },
                { key: 'Quarterly', amount: 550, desc: '3 months' },
                { key: 'Annual', amount: 1800, desc: '12 months' },
              ].map(p => (
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
              <button onClick={() => setShowRenew(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700">Cancel</button>
              <button onClick={handleRenew} className="flex-1 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold">Confirm & Pay</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Member?</h3>
            <p className="text-gray-500 text-sm mb-5">This will permanently remove <strong>{member.name}</strong> and all their records. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {(member.notes || editing) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-800 mb-2">Notes</h2>
          {editing ? (
            <textarea value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" rows={2} />
          ) : <p className="text-sm text-gray-600">{member.notes}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment history */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Banknote size={16} className="text-orange-500" /> Payment History
          </h2>
          {memberPayments.length === 0 ? (
            <p className="text-sm text-gray-400">No payments recorded</p>
          ) : (
            <div className="space-y-3">
              {memberPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{p.plan} Plan · {p.type === 'new' ? 'New Reg.' : 'Renewal'}</p>
                    <p className="text-xs text-gray-400">{format(parseISO(p.date), 'd MMM yyyy')} · {p.receiptNo}</p>
                  </div>
                  <p className="font-bold text-green-600">₵{p.amount.toLocaleString()}</p>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">Total paid: <strong className="text-gray-700">₵{memberPayments.reduce((s,p)=>s+p.amount,0).toLocaleString()}</strong></p>
            </div>
          )}
        </div>

        {/* Attendance history */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarCheck size={16} className="text-orange-500" /> Attendance Log
          </h2>
          {memberAttendance.length === 0 ? (
            <p className="text-sm text-gray-400">No attendance recorded</p>
          ) : (
            <div className="space-y-2">
              {memberAttendance.slice(0, 10).map(a => (
                <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <p className="text-sm text-gray-700">{format(parseISO(a.date), 'EEE, d MMM yyyy')}</p>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-600">In: {a.checkIn}</p>
                    {a.checkOut && <p className="text-xs text-gray-400">Out: {a.checkOut}</p>}
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">Total visits: <strong className="text-gray-700">{memberAttendance.length}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
