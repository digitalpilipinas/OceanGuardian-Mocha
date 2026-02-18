-- Migration: Community Features (Comments, Validations, Notifications)

-- 1. Sighting Comments
CREATE TABLE IF NOT EXISTS sighting_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sighting_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (sighting_id) REFERENCES sightings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_sighting_comments_sighting ON sighting_comments(sighting_id);

-- 2. Sighting Validations (Upvotes)
CREATE TABLE IF NOT EXISTS sighting_validations (
  sighting_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (sighting_id, user_id),
  FOREIGN KEY (sighting_id) REFERENCES sightings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

-- 3. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('comment', 'validation', 'follow', 'level_up', 'badge', 'mission_invite', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id TEXT, -- Can be sighting_id, badge_id, user_id, etc.
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON notifications(user_id, created_at DESC);
