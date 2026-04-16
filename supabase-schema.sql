-- GymUp Supabase Schema
-- Run this in your Supabase project: SQL Editor → New Query → Paste → Run

-- Members table (synced from the app)
create table if not exists members (
  id text primary key,
  member_number text,
  name text not null,
  phone text not null,
  email text,
  gender text,
  dob text,
  emergency_contact text,
  plan text,
  start_date text,
  expiry_date text,
  status text default 'active',
  registration_date text,
  notes text,
  updated_at timestamptz default now()
);

-- SMS log (auto-notifications sent by the cron job)
create table if not exists sms_log (
  id text primary key,
  member_id text,
  member_name text,
  type text,        -- 'expiry_7day' | 'expiry_3day' | 'expiry_1day' | 'expiry_today'
  message text,
  phone text,
  status text,      -- 'sent' | 'failed'
  auto boolean default true,
  sent_at timestamptz default now()
);

-- Index for fast expiry date lookups (cron job uses this)
create index if not exists members_expiry_status on members (expiry_date, status);

-- Index for dedup check on sms_log
create index if not exists sms_log_member_type on sms_log (member_id, type, sent_at);
