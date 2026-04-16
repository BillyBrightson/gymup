import { format, parseISO, differenceInDays } from 'date-fns';

// Convert Ghana local number (0XXXXXXXXX) to international (233XXXXXXXXX)
export const toIntl = (phone) => {
  if (!phone) return '';
  const clean = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (clean.startsWith('+233')) return clean.slice(1);
  if (clean.startsWith('233')) return clean;
  if (clean.startsWith('0')) return '233' + clean.slice(1);
  return clean;
};

export const getSMSLink = (phone, message) =>
  `sms:+${toIntl(phone)}?body=${encodeURIComponent(message)}`;

export const getWhatsAppLink = (phone, message) =>
  `https://wa.me/${toIntl(phone)}?text=${encodeURIComponent(message)}`;

// Message templates
export const templates = {
  welcome: (m) =>
`Hi ${m.name.split(' ')[0]}! 👋 Welcome to GymUp Fitness Centre.

Your ${m.plan} membership is now ACTIVE ✅
Member ID: ${m.memberNumber}
Valid until: ${format(parseISO(m.expiryDate), 'd MMM yyyy')}

We're excited to have you! Stay consistent and keep pushing! 💪

— GymUp Fitness Centre`,

  renewalConfirmed: (m) =>
`Hi ${m.name.split(' ')[0]}! ✅ Your GymUp membership has been renewed.

Plan: ${m.plan}
Valid until: ${format(parseISO(m.expiryDate), 'd MMM yyyy')}
Member ID: ${m.memberNumber}

Thank you for staying with us. Keep up the great work! 💪

— GymUp Fitness Centre`,

  expiryWarning: (m) => {
    const days = differenceInDays(parseISO(m.expiryDate), new Date());
    return `Hi ${m.name.split(' ')[0]}! ⚠️ Just a reminder.

Your GymUp membership expires in ${days} day${days !== 1 ? 's' : ''} on ${format(parseISO(m.expiryDate), 'd MMM yyyy')}.

Renew now to avoid any interruption to your fitness journey!
Contact us today to keep your access going. 🏋️

— GymUp Fitness Centre`;
  },

  expiredToday: (m) =>
`Hi ${m.name.split(' ')[0]}! Your GymUp membership expired today.

Don't let this break your routine — come in and renew now to jump straight back into training! 💪

We'd love to have you back.

— GymUp Fitness Centre`,

  expired: (m) =>
`Hi ${m.name.split(' ')[0]}! ❌ Your GymUp membership expired on ${format(parseISO(m.expiryDate), 'd MMM yyyy')}.

Renew today and get back on track! We miss seeing you at the gym. 🏋️

Contact us to renew your membership.

— GymUp Fitness Centre`,
};
