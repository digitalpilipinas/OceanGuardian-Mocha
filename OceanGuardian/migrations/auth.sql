-- Auth Sessions and OTPs for Custom Turso Auth

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,                    -- Session token
  user_id TEXT NOT NULL,                  -- Links to user_profiles.id
  expires_at TEXT NOT NULL,               -- ISO timestamp
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

CREATE TABLE IF NOT EXISTS auth_otps (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,               -- ISO timestamp
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_otps_expires_at ON auth_otps(expires_at);
