import { useState } from 'react';
import { useGym } from '../context/GymContext';
import { format, parseISO } from 'date-fns';
import { Search, UserCheck, Clock, LogIn, LogOut, Calendar, CheckCircle } from 'lucide-react';

export default function Attendance() {
  const { members, attendance, checkIn, checkOut } = useGym();
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [toast, setToast] = useState(null);
  const [searchMember, setSearchMember] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCheckIn = (member) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (selectedDate !== todayStr) { showToast('Can only check-in for today', 'error'); return; }
    if (member.status !== 'active') { showToast(`${member.name}'s membership is ${member.status}`, 'error'); return; }
    const existing = attendance.find(a => a.memberId === member.id && a.date === todayStr);
    if (existing) { showToast(`${member.name} already checked in today`, 'info'); return; }
    checkIn(member.id);
    showToast(`${member.name} checked in! ✓`);
    setSearchMember('');
  };

  const handleCheckOut = (attId, name) => {
    checkOut(attId);
    showToast(`${name} checked out`);
  };

  const dayAttendance = attendance.filter(a => a.date === selectedDate);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isToday = selectedDate === todayStr;

  const searchResults = searchMember.length >= 2
    ? members.filter(m => m.name.toLowerCase().includes(searchMember.toLowerCase()) || m.phone.includes(searchMember) || m.memberNumber.toLowerCase().includes(searchMember.toLowerCase())).slice(0, 6)
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500 text-white' : toast.type === 'info' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
          <CheckCircle size={16} /> {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Track daily member check-ins and check-outs</p>
      </div>

      {/* Quick check-in */}
      {isToday && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <LogIn size={18} className="text-orange-500" /> Quick Check-In
          </h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchMember}
              onChange={e => setSearchMember(e.target.value)}
              placeholder="Search member name, phone, or member number..."
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
              {searchResults.map(m => {
                const alreadyIn = attendance.some(a => a.memberId === m.id && a.date === todayStr);
                return (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-400">{m.memberNumber} · {m.plan} · {m.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.status !== 'active' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{m.status}</span>
                      )}
                      {alreadyIn ? (
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium">Checked In</span>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(m)}
                          className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Date filter */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm">
          <Calendar size={16} className="text-gray-400" />
          <input
            type="date" value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-sm focus:outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2 bg-orange-100 text-orange-700 rounded-xl px-4 py-2.5">
          <UserCheck size={16} />
          <span className="text-sm font-semibold">{dayAttendance.length} check-in{dayAttendance.length !== 1 ? 's' : ''}</span>
        </div>
        {isToday && (
          <span className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded-xl font-semibold">Today</span>
        )}
      </div>

      {/* Attendance list */}
      {dayAttendance.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
          <UserCheck size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No attendance records</p>
          <p className="text-sm mt-1">for {format(parseISO(selectedDate), 'EEEE, d MMMM yyyy')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">Member</div>
            <div className="col-span-2">Plan</div>
            <div className="col-span-2">Check-In</div>
            <div className="col-span-2">Check-Out</div>
            <div className="col-span-2">Action</div>
          </div>
          {dayAttendance.map((a, idx) => {
            const member = members.find(m => m.id === a.memberId);
            return (
              <div key={a.id} className={`grid grid-cols-12 gap-4 px-5 py-4 items-center border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {a.memberName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.memberName}</p>
                    <p className="text-xs text-gray-400">{member?.memberNumber}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{member?.plan}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1 text-sm text-gray-700">
                  <LogIn size={13} className="text-green-500" /> {a.checkIn}
                </div>
                <div className="col-span-2 flex items-center gap-1 text-sm text-gray-500">
                  {a.checkOut ? (
                    <><LogOut size={13} className="text-red-400" /> {a.checkOut}</>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </div>
                <div className="col-span-2">
                  {!a.checkOut && isToday ? (
                    <button
                      onClick={() => handleCheckOut(a.id, a.memberName)}
                      className="text-xs bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1"
                    >
                      <LogOut size={12} /> Check Out
                    </button>
                  ) : a.checkOut ? (
                    <span className="text-xs text-gray-400">Completed</span>
                  ) : (
                    <span className="text-xs text-gray-300">Past record</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All active members quick view */}
      {isToday && (
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">All Active Members</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {members.filter(m => m.status === 'active').map(m => {
              const checkedIn = dayAttendance.some(a => a.memberId === m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => !checkedIn && handleCheckIn(m)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${checkedIn ? 'border-green-200 bg-green-50 cursor-default' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${checkedIn ? 'bg-green-200 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{m.name.split(' ')[0]}</p>
                      {checkedIn && <p className="text-xs text-green-600 font-medium">✓ In</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
