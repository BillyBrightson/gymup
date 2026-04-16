import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (service role — full access)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Convert Ghana local number → international format for Arkesel
function toIntlPhone(phone) {
  const clean = (phone || '').replace(/[\s\-]/g, '');
  if (clean.startsWith('+233')) return clean.replace('+', '');
  if (clean.startsWith('233')) return clean;
  if (clean.startsWith('0')) return '233' + clean.slice(1);
  return clean;
}

// Format date for SMS message (e.g. "15 Apr 2026")
function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// Build the right message per trigger type
function buildMessage(member, triggerDays) {
  const first = member.name.split(' ')[0];
  const expiry = fmtDate(member.expiry_date);

  if (triggerDays === 7) {
    return `Hi ${first}! Just a reminder — your GymUp membership expires in 7 days on ${expiry}.\n\nRenew early to keep your fitness going! 💪\n— GymUp Fitness Centre`;
  }
  if (triggerDays === 3) {
    return `Hi ${first}! ⚠️ Your GymUp membership expires in 3 days on ${expiry}.\n\nDon't let it lapse — come in or contact us to renew now!\n— GymUp Fitness Centre`;
  }
  if (triggerDays === 1) {
    return `Hi ${first}! 🚨 URGENT: Your GymUp membership expires TOMORROW (${expiry}).\n\nRenew today to avoid any interruption to your training!\n— GymUp Fitness Centre`;
  }
  if (triggerDays === 0) {
    return `Hi ${first}! Your GymUp membership expires TODAY (${expiry}).\n\nCome in now to renew and keep training without a break! 💪\n— GymUp Fitness Centre`;
  }
  return null;
}

// Send SMS via Arkesel API
async function sendSMS(phone, message) {
  const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
    method: 'POST',
    headers: {
      'api-key': process.env.ARKESEL_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: process.env.ARKESEL_SENDER_ID || 'GymUp',
      message,
      recipients: [toIntlPhone(phone)],
    }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

// Check if this exact notification type was already sent today for this member
async function alreadySentToday(memberId, type, todayStr) {
  const { data } = await supabase
    .from('sms_log')
    .select('id')
    .eq('member_id', memberId)
    .eq('type', type)
    .gte('sent_at', `${todayStr}T00:00:00.000Z`)
    .limit(1);
  return data?.length > 0;
}

export default async function handler(req, res) {
  // Vercel automatically sends this header for cron invocations
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // We trigger notifications at: 7 days, 3 days, 1 day, and 0 days (expiry day)
  const triggerDays = [7, 3, 1, 0];
  const summary = { sent: 0, skipped: 0, failed: 0, log: [] };

  for (const days of triggerDays) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const notifType = `expiry_${days}day`;

    // Fetch active members whose membership expires on the target date
    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, phone, plan, expiry_date')
      .eq('expiry_date', targetDateStr)
      .eq('status', 'active');

    if (error) {
      summary.log.push({ days, error: error.message });
      continue;
    }
    if (!members?.length) continue;

    for (const member of members) {
      // Skip if already notified today (prevents duplicate sends on retries)
      const duplicate = await alreadySentToday(member.id, notifType, todayStr);
      if (duplicate) {
        summary.skipped++;
        continue;
      }

      const message = buildMessage(member, days);
      if (!message) continue;

      let status = 'failed';
      try {
        const { ok, data: arkeselResponse } = await sendSMS(member.phone, message);
        status = ok ? 'sent' : 'failed';
        if (ok) summary.sent++;
        else summary.failed++;
        summary.log.push({ member: member.name, days, status, arkeselResponse });
      } catch (err) {
        summary.failed++;
        summary.log.push({ member: member.name, days, status: 'error', error: err.message });
      }

      // Always log the attempt to Supabase
      await supabase.from('sms_log').insert({
        id: `AUTO_${Date.now()}_${member.id}_${days}d`,
        member_id: member.id,
        member_name: member.name,
        type: notifType,
        message,
        phone: member.phone,
        status,
        auto: true,
        sent_at: new Date().toISOString(),
      });
    }
  }

  return res.status(200).json({ date: todayStr, ...summary });
}
