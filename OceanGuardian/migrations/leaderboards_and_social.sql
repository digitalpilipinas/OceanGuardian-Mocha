-- Migration: Leaderboards and Social Features

-- 1. Add social relationship tracking
CREATE TABLE IF NOT EXISTS user_follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (follower_id) REFERENCES user_profiles(id),
  FOREIGN KEY (following_id) REFERENCES user_profiles(id),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- 2. Add region and privacy fields to user_profiles
-- Note: SQLite does not support adding multiple columns in one statement easily in older versions, 
-- but we can do it one by one or in a batch if supported. safely doing one by one.

ALTER TABLE user_profiles ADD COLUMN region TEXT;
ALTER TABLE user_profiles ADD COLUMN country TEXT;
ALTER TABLE user_profiles ADD COLUMN is_anonymous INTEGER NOT NULL DEFAULT 0;
