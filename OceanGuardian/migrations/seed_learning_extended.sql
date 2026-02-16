-- Seed User Quiz Stats
INSERT OR IGNORE INTO user_quiz_stats (user_id, streak_days, last_quiz_date, total_xp_earned, quizzes_completed, perfect_scores) VALUES
('user_player1', 5, date('now', '-1 day'), 500, 10, 5),
('user_scientist', 12, date('now'), 1200, 25, 20),
('user_ambassador', 30, date('now'), 3000, 60, 50);

-- Seed User Lesson Progress
-- Assuming lesson IDs 1-3 exist from seed_learning.sql
INSERT OR IGNORE INTO user_lessons (user_id, lesson_id, completed_at, xp_awarded) VALUES
('user_player1', 1, datetime('now', '-5 days'), 100), -- Intro to Marine Ecosystems
('user_player1', 2, datetime('now', '-2 days'), 150), -- The Plastic Problem
('user_scientist', 1, datetime('now', '-20 days'), 100),
('user_scientist', 2, datetime('now', '-15 days'), 150),
('user_scientist', 3, datetime('now', '-10 days'), 200); -- Coral Bleaching Explained
