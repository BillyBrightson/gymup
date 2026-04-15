import { createContext, useContext, useState, useEffect } from 'react';
import { addMonths, addDays, subDays, format, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';

const GymContext = createContext(null);

const today = new Date();
const fmt = (d) => format(d, 'yyyy-MM-dd');

// Seed data – realistic Ghanaian gym members
const SEED_MEMBERS = [
  { id: 'M001', memberNumber: 'GU-001', name: 'Kofi Mensah', phone: '0244123456', email: 'kofi.mensah@gmail.com', gender: 'Male', dob: '1990-03-14', emergencyContact: '0501234567', plan: 'Monthly', startDate: fmt(subDays(today, 20)), expiryDate: fmt(addDays(today, 10)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 50)), notes: 'Prefers morning sessions' },
  { id: 'M002', memberNumber: 'GU-002', name: 'Ama Boateng', phone: '0201234567', email: 'ama.boateng@yahoo.com', gender: 'Female', dob: '1995-07-22', emergencyContact: '0241234567', plan: 'Quarterly', startDate: fmt(subDays(today, 60)), expiryDate: fmt(addDays(today, 30)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 60)), notes: '' },
  { id: 'M003', memberNumber: 'GU-003', name: 'Kwame Asante', phone: '0551234567', email: 'kwame.asante@gmail.com', gender: 'Male', dob: '1988-11-05', emergencyContact: '0241112222', plan: 'Annual', startDate: fmt(subDays(today, 200)), expiryDate: fmt(addDays(today, 165)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 200)), notes: 'Personal trainer client' },
  { id: 'M004', memberNumber: 'GU-004', name: 'Abena Darko', phone: '0271234567', email: 'abena.darko@gmail.com', gender: 'Female', dob: '1992-01-30', emergencyContact: '0501112233', plan: 'Monthly', startDate: fmt(subDays(today, 35)), expiryDate: fmt(subDays(today, 5)), status: 'expired', photo: null, registrationDate: fmt(subDays(today, 65)), notes: '' },
  { id: 'M005', memberNumber: 'GU-005', name: 'Kojo Ofori', phone: '0241234567', email: 'kojo.ofori@gmail.com', gender: 'Male', dob: '1985-09-18', emergencyContact: '0271112233', plan: 'Monthly', startDate: fmt(subDays(today, 25)), expiryDate: fmt(addDays(today, 5)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 55)), notes: 'Interested in weight loss' },
  { id: 'M006', memberNumber: 'GU-006', name: 'Akosua Amponsah', phone: '0261234567', email: 'akosua@gmail.com', gender: 'Female', dob: '1998-04-12', emergencyContact: '0244556677', plan: 'Quarterly', startDate: fmt(subDays(today, 80)), expiryDate: fmt(addDays(today, 10)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 80)), notes: '' },
  { id: 'M007', memberNumber: 'GU-007', name: 'Yaw Owusu', phone: '0231234567', email: 'yaw.owusu@gmail.com', gender: 'Male', dob: '1991-06-28', emergencyContact: '0201234000', plan: 'Monthly', startDate: fmt(subDays(today, 15)), expiryDate: fmt(addDays(today, 15)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 45)), notes: '' },
  { id: 'M008', memberNumber: 'GU-008', name: 'Adwoa Sarpong', phone: '0501234567', email: 'adwoa.sarpong@outlook.com', gender: 'Female', dob: '1993-08-14', emergencyContact: '0241234567', plan: 'Annual', startDate: fmt(subDays(today, 300)), expiryDate: fmt(addDays(today, 65)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 300)), notes: '' },
  { id: 'M009', memberNumber: 'GU-009', name: 'Kweku Antwi', phone: '0551123456', email: 'kweku.antwi@gmail.com', gender: 'Male', dob: '1987-02-09', emergencyContact: '0261112233', plan: 'Monthly', startDate: fmt(subDays(today, 40)), expiryDate: fmt(subDays(today, 10)), status: 'expired', photo: null, registrationDate: fmt(subDays(today, 70)), notes: 'Usually comes in the evenings' },
  { id: 'M010', memberNumber: 'GU-010', name: 'Efua Asiedu', phone: '0241122334', email: 'efua.asiedu@gmail.com', gender: 'Female', dob: '1996-12-01', emergencyContact: '0501122334', plan: 'Monthly', startDate: fmt(subDays(today, 10)), expiryDate: fmt(addDays(today, 20)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 10)), notes: 'New member' },
  { id: 'M011', memberNumber: 'GU-011', name: 'Nana Adjei', phone: '0271122334', email: 'nana.adjei@gmail.com', gender: 'Male', dob: '1983-05-20', emergencyContact: '0241122335', plan: 'Quarterly', startDate: fmt(subDays(today, 50)), expiryDate: fmt(addDays(today, 40)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 120)), notes: 'Senior member' },
  { id: 'M012', memberNumber: 'GU-012', name: 'Maame Osei', phone: '0201122334', email: 'maame.osei@gmail.com', gender: 'Female', dob: '1999-10-17', emergencyContact: '0241122999', plan: 'Monthly', startDate: fmt(subDays(today, 3)), expiryDate: fmt(addDays(today, 7)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 3)), notes: '' },
  { id: 'M013', memberNumber: 'GU-013', name: 'Fiifi Quaye', phone: '0261122334', email: 'fiifi.quaye@gmail.com', gender: 'Male', dob: '1994-03-25', emergencyContact: '0261122000', plan: 'Monthly', startDate: fmt(subDays(today, 50)), expiryDate: fmt(subDays(today, 20)), status: 'suspended', photo: null, registrationDate: fmt(subDays(today, 80)), notes: 'Suspended due to outstanding balance' },
  { id: 'M014', memberNumber: 'GU-014', name: 'Akua Frimpong', phone: '0241234890', email: 'akua.frimpong@gmail.com', gender: 'Female', dob: '1997-07-08', emergencyContact: '0501234890', plan: 'Annual', startDate: fmt(subDays(today, 100)), expiryDate: fmt(addDays(today, 265)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 100)), notes: '' },
  { id: 'M015', memberNumber: 'GU-015', name: 'Kofi Agyeman', phone: '0551234890', email: 'kofi.agyeman@gmail.com', gender: 'Male', dob: '1989-01-15', emergencyContact: '0241234891', plan: 'Quarterly', startDate: fmt(subDays(today, 70)), expiryDate: fmt(addDays(today, 20)), status: 'active', photo: null, registrationDate: fmt(subDays(today, 150)), notes: 'Pays on time always' },
];

const PLAN_AMOUNTS = { Monthly: 200, Quarterly: 550, Annual: 1800 };
const PLAN_MONTHS = { Monthly: 1, Quarterly: 3, Annual: 12 };

const SEED_PAYMENTS = [
  { id: 'P001', memberId: 'M001', memberName: 'Kofi Mensah', amount: 200, date: fmt(subDays(today, 20)), type: 'renewal', plan: 'Monthly', receiptNo: 'RCT-001', note: '' },
  { id: 'P002', memberId: 'M002', memberName: 'Ama Boateng', amount: 550, date: fmt(subDays(today, 60)), type: 'new', plan: 'Quarterly', receiptNo: 'RCT-002', note: '' },
  { id: 'P003', memberId: 'M003', memberName: 'Kwame Asante', amount: 1800, date: fmt(subDays(today, 200)), type: 'renewal', plan: 'Annual', receiptNo: 'RCT-003', note: 'Paid in full' },
  { id: 'P004', memberId: 'M005', memberName: 'Kojo Ofori', amount: 200, date: fmt(subDays(today, 25)), type: 'renewal', plan: 'Monthly', receiptNo: 'RCT-004', note: '' },
  { id: 'P005', memberId: 'M006', memberName: 'Akosua Amponsah', amount: 550, date: fmt(subDays(today, 80)), type: 'renewal', plan: 'Quarterly', receiptNo: 'RCT-005', note: '' },
  { id: 'P006', memberId: 'M007', memberName: 'Yaw Owusu', amount: 200, date: fmt(subDays(today, 15)), type: 'new', plan: 'Monthly', receiptNo: 'RCT-006', note: '' },
  { id: 'P007', memberId: 'M008', memberName: 'Adwoa Sarpong', amount: 1800, date: fmt(subDays(today, 300)), type: 'new', plan: 'Annual', receiptNo: 'RCT-007', note: 'Referred by Kofi Mensah' },
  { id: 'P008', memberId: 'M010', memberName: 'Efua Asiedu', amount: 200, date: fmt(subDays(today, 10)), type: 'new', plan: 'Monthly', receiptNo: 'RCT-008', note: '' },
  { id: 'P009', memberId: 'M011', memberName: 'Nana Adjei', amount: 550, date: fmt(subDays(today, 50)), type: 'renewal', plan: 'Quarterly', receiptNo: 'RCT-009', note: '' },
  { id: 'P010', memberId: 'M012', memberName: 'Maame Osei', amount: 200, date: fmt(subDays(today, 3)), type: 'new', plan: 'Monthly', receiptNo: 'RCT-010', note: '' },
  { id: 'P011', memberId: 'M014', memberName: 'Akua Frimpong', amount: 1800, date: fmt(subDays(today, 100)), type: 'renewal', plan: 'Annual', receiptNo: 'RCT-011', note: '' },
  { id: 'P012', memberId: 'M015', memberName: 'Kofi Agyeman', amount: 550, date: fmt(subDays(today, 70)), type: 'renewal', plan: 'Quarterly', receiptNo: 'RCT-012', note: '' },
  { id: 'P013', memberId: 'M001', memberName: 'Kofi Mensah', amount: 200, date: fmt(subDays(today, 50)), type: 'renewal', plan: 'Monthly', receiptNo: 'RCT-013', note: '' },
];

const SEED_ATTENDANCE = [
  ...['M001','M003','M005','M007','M010'].map((id, i) => ({
    id: `A${Date.now()}${i}`, memberId: id,
    memberName: SEED_MEMBERS.find(m=>m.id===id)?.name,
    date: fmt(today), checkIn: '06:30', checkOut: null
  })),
  ...['M002','M006','M008','M011','M014'].map((id, i) => ({
    id: `B${Date.now()}${i}`, memberId: id,
    memberName: SEED_MEMBERS.find(m=>m.id===id)?.name,
    date: fmt(subDays(today, 1)), checkIn: '07:00', checkOut: '09:00'
  })),
  ...['M001','M003','M007','M015'].map((id, i) => ({
    id: `C${Date.now()}${i}`, memberId: id,
    memberName: SEED_MEMBERS.find(m=>m.id===id)?.name,
    date: fmt(subDays(today, 2)), checkIn: '06:45', checkOut: '08:30'
  })),
];

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function GymProvider({ children }) {
  const [members, setMembers] = useState(() => loadFromStorage('gymup_members', SEED_MEMBERS));
  const [payments, setPayments] = useState(() => loadFromStorage('gymup_payments', SEED_PAYMENTS));
  const [attendance, setAttendance] = useState(() => loadFromStorage('gymup_attendance', SEED_ATTENDANCE));
  const [gymName] = useState('GymUp Fitness Centre');

  useEffect(() => { saveToStorage('gymup_members', members); }, [members]);
  useEffect(() => { saveToStorage('gymup_payments', payments); }, [payments]);
  useEffect(() => { saveToStorage('gymup_attendance', attendance); }, [attendance]);

  // Auto-update member statuses based on expiry
  useEffect(() => {
    setMembers(prev => prev.map(m => {
      if (m.status === 'suspended') return m;
      const expired = isBefore(parseISO(m.expiryDate), today);
      if (expired && m.status === 'active') return { ...m, status: 'expired' };
      if (!expired && m.status === 'expired') return { ...m, status: 'active' };
      return m;
    }));
  }, []);

  const addMember = (data) => {
    const count = members.length + 1;
    const id = `M${String(count).padStart(3, '0')}`;
    const memberNumber = `GU-${String(count).padStart(3, '0')}`;
    const expiryDate = fmt(addMonths(parseISO(data.startDate), PLAN_MONTHS[data.plan]));
    const newMember = { ...data, id, memberNumber, status: 'active', expiryDate, registrationDate: fmt(today) };
    setMembers(prev => [...prev, newMember]);

    // Auto-record payment for new member
    const payId = `P${Date.now()}`;
    const receiptNo = `RCT-${String(payments.length + 1).padStart(3, '0')}`;
    setPayments(prev => [...prev, {
      id: payId, memberId: id, memberName: data.name,
      amount: PLAN_AMOUNTS[data.plan], date: data.startDate,
      type: 'new', plan: data.plan, receiptNo, note: 'New registration'
    }]);
    return newMember;
  };

  const updateMember = (id, updates) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const renewMembership = (memberId, plan, paymentDate) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const newStart = fmt(today);
    const newExpiry = fmt(addMonths(today, PLAN_MONTHS[plan]));
    updateMember(memberId, { plan, startDate: newStart, expiryDate: newExpiry, status: 'active' });

    const payId = `P${Date.now()}`;
    const receiptNo = `RCT-${String(payments.length + 1).padStart(3, '0')}`;
    setPayments(prev => [...prev, {
      id: payId, memberId, memberName: member.name,
      amount: PLAN_AMOUNTS[plan], date: paymentDate || fmt(today),
      type: 'renewal', plan, receiptNo, note: ''
    }]);
  };

  const checkIn = (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return null;
    const todayStr = fmt(today);
    const existing = attendance.find(a => a.memberId === memberId && a.date === todayStr);
    if (existing) return existing;
    const rec = {
      id: `ATT${Date.now()}`,
      memberId,
      memberName: member.name,
      date: todayStr,
      checkIn: format(new Date(), 'HH:mm'),
      checkOut: null
    };
    setAttendance(prev => [rec, ...prev]);
    return rec;
  };

  const checkOut = (attendanceId) => {
    setAttendance(prev => prev.map(a =>
      a.id === attendanceId ? { ...a, checkOut: format(new Date(), 'HH:mm') } : a
    ));
  };

  const getExpiringMembers = (days = 7) => {
    return members.filter(m => {
      if (m.status !== 'active') return false;
      const diff = differenceInDays(parseISO(m.expiryDate), today);
      return diff >= 0 && diff <= days;
    }).sort((a, b) => differenceInDays(parseISO(a.expiryDate), today) - differenceInDays(parseISO(b.expiryDate), today));
  };

  const getExpiredMembers = () => members.filter(m => m.status === 'expired');

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    expired: members.filter(m => m.status === 'expired').length,
    suspended: members.filter(m => m.status === 'suspended').length,
    expiringThisWeek: getExpiringMembers(7).length,
    todayAttendance: attendance.filter(a => a.date === fmt(today)).length,
    monthRevenue: payments
      .filter(p => p.date.startsWith(format(today, 'yyyy-MM')))
      .reduce((sum, p) => sum + p.amount, 0),
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <GymContext.Provider value={{
      members, payments, attendance, gymName, stats,
      addMember, updateMember, deleteMember, renewMembership,
      checkIn, checkOut, getExpiringMembers, getExpiredMembers,
      PLAN_AMOUNTS, PLAN_MONTHS,
    }}>
      {children}
    </GymContext.Provider>
  );
}

export const useGym = () => {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error('useGym must be used within GymProvider');
  return ctx;
};
