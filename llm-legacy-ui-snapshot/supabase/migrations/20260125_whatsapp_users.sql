-- WhatsApp Users Table (with invitation codes)
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
  
  -- PIN and access (8-character alphanumeric)
  pin VARCHAR(8),
  pin_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Invitation code (6-character alphanumeric, lawyers only)
  invitation_code VARCHAR(6) UNIQUE,
  invited_by UUID REFERENCES whatsapp_users(id),
  
  -- Articling student specific
  firm_name VARCHAR(255),
  principal_name VARCHAR(255),
  articling_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Referrer (must be a verified lawyer)
  referrer_id UUID REFERENCES whatsapp_users(id),
  referrer_name VARCHAR(255),
  referrer_phone VARCHAR(20),
  
  -- Lawyer specific
  call_date TIMESTAMP WITH TIME ZONE,
  
  -- Temp data for multi-step flows
  temp_data TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_phone ON whatsapp_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_email ON whatsapp_users(email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_type ON whatsapp_users(user_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_referrer ON whatsapp_users(referrer_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_pin ON whatsapp_users(pin);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_invite_code ON whatsapp_users(invitation_code);

-- If table already exists, add new columns
ALTER TABLE whatsapp_users ADD COLUMN IF NOT EXISTS invitation_code VARCHAR(6) UNIQUE;
ALTER TABLE whatsapp_users ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES whatsapp_users(id);

-- Update pin column to allow 8 characters (if needed)
ALTER TABLE whatsapp_users ALTER COLUMN pin TYPE VARCHAR(8);
