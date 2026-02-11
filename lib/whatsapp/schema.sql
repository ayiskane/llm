CREATE TABLE IF NOT EXISTS whatsapp_users (
  id              SERIAL PRIMARY KEY,
  phone           VARCHAR(20) UNIQUE NOT NULL,
  user_type       VARCHAR(20) NOT NULL,
  full_name       VARCHAR(200) NOT NULL,
  firm_name       VARCHAR(200),
  principal_name  VARCHAR(200),
  staff_role       VARCHAR(30),
  staff_role_other VARCHAR(100),
  referrer_id     INTEGER REFERENCES whatsapp_users(id),
  referrer_phone  VARCHAR(20),
  referrer_name   VARCHAR(200),
  is_verified     BOOLEAN DEFAULT FALSE,
  pin             VARCHAR(10),
  invite_code     VARCHAR(10),
  pin_expires_at  TIMESTAMPTZ,
  articling_end   DATE,
  lsbc_confirmed  BOOLEAN DEFAULT FALSE,
  call_to_bar     DATE,
  oath_confirmed  BOOLEAN DEFAULT FALSE,
  staff_revoked_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invite_codes (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(10) UNIQUE NOT NULL,
  created_by  INTEGER REFERENCES whatsapp_users(id),
  used_by     INTEGER REFERENCES whatsapp_users(id),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON whatsapp_users(phone);
CREATE INDEX IF NOT EXISTS idx_users_referrer ON whatsapp_users(referrer_id);
CREATE INDEX IF NOT EXISTS idx_users_type_verified ON whatsapp_users(user_type, is_verified);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
