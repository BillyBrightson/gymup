import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGym } from '../context/GymContext';
import { format } from 'date-fns';
import { ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';

const PLANS = [
  { key: 'Monthly', label: 'Monthly', amount: 200, desc: '1 month access' },
  { key: 'Quarterly', label: 'Quarterly', amount: 550, desc: '3 months access · Save ₵50' },
  { key: 'Annual', label: 'Annual', amount: 1800, desc: '12 months access · Save ₵600' },
];

export default function AddMember() {
  const { addMember } = useGym();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', gender: 'Male', dob: '',
    emergencyContact: '', plan: 'Monthly',
    startDate: format(new Date(), 'yyyy-MM-dd'), notes: ''
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) e.phone = 'Enter a valid Ghana phone number (e.g. 0244123456)';
    if (!form.startDate) e.startDate = 'Start date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const member = addMember(form);
    setSuccess(member);
  };

  if (success) {
    return (
      <div className="p-6 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Member Registered!</h2>
        <p className="text-gray-500 mb-1">{success.name} has been added successfully.</p>
        <p className="text-gray-400 text-sm mb-6">Member ID: <span className="font-semibold text-gray-700">{success.memberNumber}</span></p>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 w-full mb-6 text-left">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Plan:</span> <span className="font-semibold">{success.plan}</span></div>
            <div><span className="text-gray-500">Starts:</span> <span className="font-semibold">{format(new Date(success.startDate), 'd MMM yyyy')}</span></div>
            <div><span className="text-gray-500">Expires:</span> <span className="font-semibold">{format(new Date(success.expiryDate), 'd MMM yyyy')}</span></div>
            <div><span className="text-gray-500">Paid:</span> <span className="font-bold text-green-600">₵{PLANS.find(p => p.key === success.plan)?.amount}</span></div>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => { setSuccess(null); setForm({ name:'', phone:'', email:'', gender:'Male', dob:'', emergencyContact:'', plan:'Monthly', startDate: format(new Date(),'yyyy-MM-dd'), notes:'' }); }}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Add Another
          </button>
          <button
            onClick={() => navigate(`/members/${success.id}`)}
            className="flex-1 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
          >
            View Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <UserPlus size={20} className="text-orange-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Register New Member</h1>
          <p className="text-gray-500 text-sm">Fill in the member's details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Kofi Mensah"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="0244123456"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="email@example.com" type="email"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              <input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)}
                placeholder="0501234567"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Any special notes about this member..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
            </div>
          </div>
        </div>

        {/* Membership Plan */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Membership Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {PLANS.map(p => (
              <button
                key={p.key} type="button"
                onClick={() => set('plan', p.key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  form.plan === p.key
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`font-bold text-lg ${form.plan === p.key ? 'text-orange-600' : 'text-gray-900'}`}>₵{p.amount}</p>
                <p className="font-semibold text-sm text-gray-800">{p.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
              className={`w-full sm:w-64 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${errors.startDate ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <h3 className="font-semibold text-orange-900 mb-2">Payment Summary</h3>
          <div className="flex justify-between items-center">
            <span className="text-orange-800 text-sm">{form.plan} Plan</span>
            <span className="text-2xl font-bold text-orange-600">₵{PLANS.find(p=>p.key===form.plan)?.amount}</span>
          </div>
        </div>

        <button type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
          <UserPlus size={18} /> Register Member & Record Payment
        </button>
      </form>
    </div>
  );
}
