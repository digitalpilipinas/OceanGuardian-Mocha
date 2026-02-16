-- Seed Comments
INSERT OR IGNORE INTO sighting_comments (sighting_id, user_id, content, created_at) VALUES
(1, 'user_scientist', 'Good catch! Make sure to recycle what you can.', datetime('now', '-1 days')),
(1, 'user_player2', 'I was there too, it was messy.', datetime('now', '-1 days', '+1 hour')),
(3, 'user_player1', 'Amazing photo! Turtles are so majestic.', datetime('now', '-9 days')),
(6, 'user_ambassador', 'This is heartbreaking. We need to act fast.', datetime('now', '-5 days'));

-- Seed Validations (Upvotes)
INSERT OR IGNORE INTO sighting_validations (sighting_id, user_id) VALUES
(1, 'user_scientist'), (1, 'user_ambassador'), (1, 'user_player2'),
(2, 'user_admin'), (2, 'user_player1'),
(3, 'user_player1'), (3, 'user_player2'), (3, 'user_admin'), (3, 'user_scientist');

-- Seed User Follows
INSERT OR IGNORE INTO user_follows (follower_id, following_id) VALUES
('user_player1', 'user_scientist'),
('user_player1', 'user_ambassador'),
('user_player2', 'user_player1'),
('user_ambassador', 'user_scientist'),
('user_scientist', 'user_admin');

-- Seed Notifications
INSERT OR IGNORE INTO notifications (user_id, type, title, message, related_id, is_read, created_at) VALUES
('user_player1', 'comment', 'New Comment', 'DrMarine commented on your sighting.', '1', 0, datetime('now', '-1 days')),
('user_player1', 'level_up', 'Level Up!', 'You reached Level 15!', NULL, 1, datetime('now', '-5 days')),
('user_scientist', 'mission_invite', 'Mission Invite', 'You are invited to join the Coral Survey.', '2', 0, datetime('now', '-1 hours'));
