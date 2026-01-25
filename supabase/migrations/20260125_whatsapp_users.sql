-- WhatsApp Users table for LLM Registration System
-- Run this in Supabase SQL Editor

-- Drop existing table if you need to start fresh (comment out if you have data)
-- DROP TABLE IF EXISTS whatsapp_users;

CREATE TABLE IF NOT EXISTS whatsapp_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  
  -- User type and status
  user_type VARCHAR(20) CHECK (user_type IN ('lawyer', 'articling_student')),
  is_verified BOOLEAN DEFAULT FALSE,
  registration_step VARCHAR(30) DEFAULT 'idle',
  
  -- Basic info
  full_name VARCHAR(255),
  email VARCHAR(255),
  
  -- PIN and access
  pin VARCHAR(6),
  pin_expires_at TIMESTAMP WITH TIME ZONE, -- NULL for lawyers (no expiry)
  
  -- Articling student specific
  firm_name VARCHAR(255),
  principal_name VARCHAR(255),
  principal_phone VARCHAR(20),
  articling_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Lawyer specific (for upgraded A/S)
  call_date TIMESTAMP WITH TIME ZONE,
  
  -- Temp data for multi-step flows (JSON string)
  temp_data TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_phone ON whatsapp_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_email ON whatsapp_users(email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_type ON whatsapp_users(user_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_principal ON whatsapp_users(principal_phone);

-- Comments
COMMENT ON TABLE whatsapp_users IS 'WhatsApp registration system for LLM app';
COMMENT ON COLUMN whatsapp_users.user_type IS 'lawyer or articling_student';
COMMENT ON COLUMN whatsapp_users.is_verified IS 'For lawyers: self-confirmed. For A/S: verified by principal';
COMMENT ON COLUMN whatsapp_users.pin_expires_at IS 'NULL for lawyers (no expiry), date for A/S (max 9 months)';
COMMENT ON COLUMN whatsapp_users.temp_data IS 'JSON string for storing intermediate data during multi-step flows';
