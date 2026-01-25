-- WhatsApp Registration Users Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS whatsapp_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('lawyer', 'articling_student')),
  email VARCHAR(255),
  full_name VARCHAR(255),
  pin VARCHAR(6),
  pin_expires_at TIMESTAMP WITH TIME ZONE,
  articling_end_date TIMESTAMP WITH TIME ZONE,
  firm_name VARCHAR(255),
  principal_name VARCHAR(255),
  principal_phone VARCHAR(20),
  call_to_bar_date TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT FALSE,
  registration_step VARCHAR(50) DEFAULT 'idle',
  -- Temp fields for verification flow
  temp_student_name VARCHAR(255),
  temp_student_phone VARCHAR(20),
  temp_firm_name VARCHAR(255),
  temp_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_phone ON whatsapp_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_email ON whatsapp_users(email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_pin ON whatsapp_users(pin);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_principal_phone ON whatsapp_users(principal_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_user_type ON whatsapp_users(user_type);

-- Enable Row Level Security
ALTER TABLE whatsapp_users ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role has full access" ON whatsapp_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE whatsapp_users IS 'WhatsApp bot registration for LLM app';
COMMENT ON COLUMN whatsapp_users.user_type IS 'lawyer or articling_student';
COMMENT ON COLUMN whatsapp_users.pin_expires_at IS 'NULL for lawyers (never expires), capped at 9 months for A/S';
COMMENT ON COLUMN whatsapp_users.articling_end_date IS 'A/S articling period end date';
COMMENT ON COLUMN whatsapp_users.firm_name IS 'Articling firm name';
COMMENT ON COLUMN whatsapp_users.principal_name IS 'Principal/referrer full name';
COMMENT ON COLUMN whatsapp_users.principal_phone IS 'Principal/referrer phone number';
COMMENT ON COLUMN whatsapp_users.call_to_bar_date IS 'Date called to bar (for upgraded A/S)';
COMMENT ON COLUMN whatsapp_users.is_verified IS 'Lawyers auto-verified, A/S need principal verification';
