-- Seed User Badges
-- Assumes badge IDs 1-16 exist from initial schema seed
INSERT OR IGNORE INTO user_badges (user_id, badge_id, earned_at) VALUES
('user_admin', 4, datetime('now', '-1 year')), -- Ocean Guardian
('user_scientist', 3, datetime('now', '-6 months')), -- Marine Reporter
('user_ambassador', 11, datetime('now', '-2 months')), -- Eco Champion
('user_player1', 1, datetime('now', '-1 week')), -- First Sighting
('user_player2', 14, datetime('now', '-3 weeks')); -- Coral Protector

-- Seed Activity Log
INSERT OR IGNORE INTO activity_log (user_id, type, description, xp_earned, created_at) VALUES
('user_player1', 'sighting', 'Reported plastic bottles', 10, datetime('now', '-2 days')),
('user_player1', 'mission', 'Joined Santa Monica Cleanup', 50, datetime('now', '-2 days')),
('user_scientist', 'sighting', 'Reported healthy coral', 20, datetime('now', '-5 days')),
('user_ambassador', 'streak', 'Reached 30 day streak!', 100, datetime('now', '-1 day')),
('user_player4', 'sighting', 'Spotted dolphins!', 25, datetime('now', '-12 hours')),
('user_player5', 'sighting', 'Reported chemical hazard', 40, datetime('now', '-3 hours')),
('user_player9', 'mission', 'Joined Tokyo Eco-Patrol', 30, datetime('now', '-1 hour'));

-- Seed Streak Log
INSERT OR IGNORE INTO streak_log (user_id, activity_date, type) VALUES
('user_ambassador', date('now', '-1 day'), 'check_in'),
('user_ambassador', date('now', '-2 days'), 'check_in'),
('user_ambassador', date('now', '-3 days'), 'check_in'),
('user_player1', date('now'), 'check_in');
