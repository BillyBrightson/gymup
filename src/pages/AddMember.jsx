import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGym } from '../context/GymContext';
import { format } from 'date-fns';
import { ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';
import SMSComposer from '../components/SMSComposer';
import { templates } from '../utils/sms';

const PLANS = [
  { key: 'Monthly', label: 'Monthly', amount: 200, desc: '1 month access' },
  { key: 'Quarterly', label: 'Quarterly', amount: 550, desc: '3 months access · Save ₵50' },
  { key: 'Annual', label: 'Annual', amount: 1800, desc: '12 months access · Save ₵600' },
];

export default function AddMember() {
  const { addMember, logSMS } = useGym();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(null);
  const [showSMS, setShowSMS] = useState(false);
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
    setShowSMS(true);
  };

  if (success) {
    return (
      <div className="p-6 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        {showSMS && (
          <SMSComposer
            member={success}
            title="Send Welcome Message"
            subtitle="Notify the new member about their membership"
            initialMessage={templates.welcome(success)}
            onClose={() => {
              logSMS(success.id, success.name, 'welcome', templates.welcome(success));
              setShowSMS(false);
            }}
          />
        )}
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

        {!showSMS && (
          <button
            onClick={() => setShowSMS(true)}
            className="w-full mb-3 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Send Welcome Message (SMS / WhatsApp)
          </button>
        )}

        <div className="flex gap-3 w-full">
          <button
            onClick={() => { setSuccess(null); setShowSMS(false); setForm({ name:'', phone:'', email:'', gender:'Male', dob:'', emergencyContact:'', plan:'Monthly', startDate: format(new Date(),'yyyy-MM-dd'), notes:'' }); }}
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
