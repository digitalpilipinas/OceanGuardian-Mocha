-- Learning System Schema

-- Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON array of strings
  correct_answer INTEGER NOT NULL, -- Index of correct option (0-3)
  explanation TEXT,
  category TEXT NOT NULL,
  difficulty TEXT CHECK(difficulty IN ('easy','medium','hard')) DEFAULT 'easy',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User Quiz Stats (Separate streak from plastic-free streak)
CREATE TABLE IF NOT EXISTS user_quiz_stats (
  user_id TEXT PRIMARY KEY,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_quiz_date TEXT, -- YYYY-MM-DD
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  quizzes_completed INTEGER NOT NULL DEFAULT 0,
  perfect_scores INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

-- Facts Library
CREATE TABLE IF NOT EXISTS facts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT,
  tags TEXT, -- Comma-separated or JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Deep Dive Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown content
  unlock_level INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  cover_image TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User Lesson Progress
CREATE TABLE IF NOT EXISTS user_lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  lesson_id INTEGER NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  xp_awarded INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_facts_category ON facts(category);
CREATE INDEX IF NOT EXISTS idx_lessons_unlock_level ON lessons(unlock_level);
