-- OceanGuardian Turso Schema
-- Application database for marine conservation platform

-- User profiles (linked to Mocha auth user IDs)
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,                    -- Mocha user ID
  username TEXT,
  avatar_url TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'player' CHECK(role IN ('guest','player','ambassador','scientist','admin')),
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  reputation INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  streak_freezes INTEGER NOT NULL DEFAULT 0,
  last_check_in TEXT,                     -- ISO timestamp
  total_sightings INTEGER NOT NULL DEFAULT 0,
  total_missions INTEGER NOT NULL DEFAULT 0,
  assigned_regions TEXT,                  -- JSON array for ambassadors
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  leaderboard_visible INTEGER NOT NULL DEFAULT 1,
  theme TEXT NOT NULL DEFAULT 'light',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_active TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sightings (marine observations)
CREATE TABLE IF NOT EXISTS sightings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('garbage','floating','wildlife','coral')),
  subcategory TEXT NOT NULL,
  description TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK(severity BETWEEN 1 AND 5),
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  address TEXT,
  image_key TEXT,
  bleach_percent REAL,
  water_temp REAL,
  depth REAL,
  mission_id INTEGER,
  validated INTEGER NOT NULL DEFAULT 0,
  validation_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','flagged','removed')),
  flag_reason TEXT,
  ai_analysis TEXT,                       -- JSON: { bleachPercent, confidence, modelVersion }
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_sightings_user_id ON sightings(user_id);
CREATE INDEX IF NOT EXISTS idx_sightings_type ON sightings(type);
CREATE INDEX IF NOT EXISTS idx_sightings_created_at ON sightings(created_at);
CREATE INDEX IF NOT EXISTS idx_sightings_status ON sightings(status);

-- Badges (definitions)
CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('milestone','mission','streak','specialty','community','seasonal')),
  rarity TEXT NOT NULL CHECK(rarity IN ('common','uncommon','rare','epic','legendary')),
  icon TEXT NOT NULL,                     -- Emoji or URL
  requirement_type TEXT NOT NULL,         -- 'xp','level','sightings','missions','streak'
  requirement_value INTEGER NOT NULL,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User badges (earned badges junction)
CREATE TABLE IF NOT EXISTS user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  badge_id INTEGER NOT NULL,
  earned_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id),
  FOREIGN KEY (badge_id) REFERENCES badges(id),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,                     -- 'sighting','badge','mission','quiz','streak','level_up'
  description TEXT NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  metadata TEXT,                          -- JSON for extra context
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- Seed initial badge definitions
INSERT OR IGNORE INTO badges (name, description, category, rarity, icon, requirement_type, requirement_value) VALUES
  ('First Sighting', 'Submit your first marine sighting', 'milestone', 'common', '🌊', 'sightings', 1),
  ('Ocean Scout', 'Submit 10 marine sightings', 'milestone', 'common', '🔭', 'sightings', 10),
  ('Marine Reporter', 'Submit 50 marine sightings', 'milestone', 'rare', '📋', 'sightings', 50),
  ('Ocean Guardian', 'Submit 100 marine sightings', 'milestone', 'epic', '🛡️', 'sightings', 100),
  ('Level 5', 'Reach Level 5', 'milestone', 'common', '⭐', 'level', 5),
  ('Level 10', 'Reach Level 10', 'milestone', 'uncommon', '🌟', 'level', 10),
  ('Level 25', 'Reach Level 25', 'milestone', 'rare', '💫', 'level', 25),
  ('Level 50', 'Reach Level 50 - Marine Legend', 'milestone', 'legendary', '👑', 'level', 50),
  ('Plastic Warrior', '7-day plastic-free streak', 'streak', 'common', '🔥', 'streak', 7),
  ('Eco Champion', '30-day plastic-free streak', 'streak', 'uncommon', '♻️', 'streak', 30),
  ('Ocean Protector', '100-day plastic-free streak', 'streak', 'rare', '🌍', 'streak', 100),
  ('Marine Legend', '365-day plastic-free streak', 'streak', 'legendary', '🏆', 'streak', 365),
  ('Coral Protector', 'Submit 10 coral bleaching reports', 'specialty', 'rare', '🪸', 'sightings', 10),
  ('Mission Rookie', 'Complete your first cleanup mission', 'mission', 'common', '🎯', 'missions', 1),
  ('Mission Master', 'Complete 10 cleanup missions', 'mission', 'rare', '🏅', 'missions', 10);

-- Streak Log
CREATE TABLE IF NOT EXISTS streak_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  activity_date TEXT NOT NULL, -- YYYY-MM-DD
  type TEXT NOT NULL CHECK(type IN ('check_in','freeze','restore')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_streak_log_user_date ON streak_log(user_id, activity_date);
