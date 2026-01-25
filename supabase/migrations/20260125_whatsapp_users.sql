-- WhatsApp Registration Users Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS whatsapp_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('lawyer', 'articling_student')),
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  pin VARCHAR(6),
  pin_expires_at TIMESTAMP WITH TIME ZONE,      -- NULL for lawyers (never expires), capped at 9 months for A/S
  articling_end_date TIMESTAMP WITH TIME ZONE,  -- A/S articling period end date
  principal_phone VARCHAR(20),                   -- Phone number of supervising lawyer for A/S
  is_verified BOOLEAN DEFAULT FALSE,             -- PIN is inactive until verified
  registration_step VARCHAR(30) DEFAULT 'idle' CHECK (
    registration_step IN (
      'idle',
      'awaiting_email',
      'awaiting_name',
      'awaiting_principal_phone',
      'awaiting_articling_end_date',
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
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_principal ON whatsapp_users(principal_phone);

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
COMMENT ON COLUMN whatsapp_users.pin_expires_at IS 'PIN expiry - NULL for lawyers, capped at 9 months from registration for A/S';
COMMENT ON COLUMN whatsapp_users.articling_end_date IS 'End date of articling period (A/S only)';
COMMENT ON COLUMN whatsapp_users.principal_phone IS 'Phone number of supervising lawyer for articling students';
COMMENT ON COLUMN whatsapp_users.is_verified IS 'Lawyers auto-verified, A/S need principal verification. PIN inactive until verified.';
