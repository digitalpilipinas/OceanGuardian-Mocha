-- Missions
CREATE TABLE IF NOT EXISTS missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  start_time TEXT NOT NULL, -- ISO timestamp
  end_time TEXT NOT NULL,   -- ISO timestamp
  organizer_id TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK(difficulty BETWEEN 1 AND 5),
  max_participants INTEGER,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming','active','completed','cancelled')),
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organizer_id) REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_missions_organizer ON missions(organizer_id);
CREATE INDEX IF NOT EXISTS idx_missions_start_time ON missions(start_time);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_location ON missions(latitude, longitude);

-- Mission Participants
CREATE TABLE IF NOT EXISTS mission_participants (
  mission_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'rsvp' CHECK(status IN ('rsvp','checked_in','cancelled')),
  checked_in_at TEXT,
  xp_awarded INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (mission_id, user_id),
  FOREIGN KEY (mission_id) REFERENCES missions(id),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_mission_participants_user ON mission_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_participants_mission ON mission_participants(mission_id);

-- Mission Chat Messages
CREATE TABLE IF NOT EXISTS mission_chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (mission_id) REFERENCES missions(id),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_mission_chat_mission ON mission_chat_messages(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_chat_created_at ON mission_chat_messages(created_at);

-- Mission Impact Reports
CREATE TABLE IF NOT EXISTS mission_impact_reports (
  mission_id INTEGER PRIMARY KEY,
  total_trash_weight REAL NOT NULL DEFAULT 0, -- in kg
  trash_bags_count INTEGER NOT NULL DEFAULT 0,
  participants_count INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (mission_id) REFERENCES missions(id)
);
