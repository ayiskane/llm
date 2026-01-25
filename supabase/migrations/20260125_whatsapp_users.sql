-- WhatsApp Registration Users Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS whatsapp_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('lawyer', 'articling_student')),
  law_society_number VARCHAR(10),
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  pin VARCHAR(6),
  principal_lsbc VARCHAR(10),
  is_verified BOOLEAN DEFAULT FALSE,
  registration_step VARCHAR(30) DEFAULT 'idle' CHECK (
    registration_step IN (
      'idle',
      'awaiting_law_society_number',
      'awaiting_email',
      'awaiting_name',
      'awaiting_principal_lsbc',
      'awaiting_verification_selection',
      'complete'
    )
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_phone ON whatsapp_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_email ON whatsapp_users(email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_pin ON whatsapp_users(pin);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_lsbc ON whatsapp_users(law_society_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_principal ON whatsapp_users(principal_lsbc);

-- Enable Row Level Security
ALTER TABLE whatsapp_users ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role has full access" ON whatsapp_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE whatsapp_users IS 'WhatsApp bot registration for LLM app';
COMMENT ON COLUMN whatsapp_users.user_type IS 'Either lawyer or articling_student';
COMMENT ON COLUMN whatsapp_users.law_society_number IS 'LSBC number for lawyers';
COMMENT ON COLUMN whatsapp_users.principal_lsbc IS 'LSBC number of supervising lawyer for articling students';
COMMENT ON COLUMN whatsapp_users.is_verified IS 'Lawyers are auto-verified, A/S need principal verification';
