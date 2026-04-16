import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase client — gracefully no-ops if env vars are missing (local dev without setup)
export const supabase = url && key ? createClient(url, key) : null;

// Convert member object (camelCase) to Supabase row (snake_case)
export const memberToRow = (m) => ({
  id: m.id,
  member_number: m.memberNumber,
  name: m.name,
  phone: m.phone,
  email: m.email || null,
  gender: m.gender,
  dob: m.dob || null,
  emergency_contact: m.emergencyContact || null,
  plan: m.plan,
  start_date: m.startDate,
  expiry_date: m.expiryDate,
  status: m.status,
  registration_date: m.registrationDate,
  notes: m.notes || null,
  updated_at: new Date().toISOString(),
});

// Upsert one or many members to Supabase (fire-and-forget, never blocks UI)
export async function syncMembers(members) {
  if (!supabase) return;
  const rows = Array.isArray(members) ? members.map(memberToRow) : [memberToRow(members)];
  await supabase.from('members').upsert(rows, { onConflict: 'id' });
}

// Remove a member from Supabase
export async function removeSupabaseMember(id) {
  if (!supabase) return;
  await supabase.from('members').delete().eq('id', id);
}
