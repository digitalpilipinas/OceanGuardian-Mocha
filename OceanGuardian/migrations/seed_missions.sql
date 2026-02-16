-- Seed Missions
INSERT OR IGNORE INTO missions (id, title, description, location_name, latitude, longitude, start_time, end_time, organizer_id, difficulty, status, image_url) VALUES
(1, 'Santa Monica Beach Cleanup', 'Join us for a massive cleanup event at Santa Monica Pier.', 'Santa Monica Pier', 34.0094, -118.4973, datetime('now', '+2 days'), datetime('now', '+2 days', '+4 hours'), 'user_ambassador', 2, 'upcoming', 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5'),
(2, 'Great Barrier Reef Survey', 'Help scientists survey coral health in the outer reef.', 'Great Barrier Reef', -18.2871, 147.6992, datetime('now', '+5 days'), datetime('now', '+10 days'), 'user_scientist', 4, 'upcoming', 'https://images.unsplash.com/photo-1546026423-cc4642628d2b'),
(3, 'Bali Plastic Free Initiative', 'Community effort to clean up Kuta Beach.', 'Kuta Beach', -8.7185, 115.1686, datetime('now', '-10 days'), datetime('now', '-10 days', '+3 hours'), 'user_player3', 3, 'completed', 'https://images.unsplash.com/photo-1528123966838-51f681a8c08b'),
(4, 'Miami Coastal Patrol', 'Monitoring wildlife and removing debris along the coast.', 'Miami Beach', 25.7617, -80.1918, datetime('now', '-2 days'), datetime('now', '-2 days', '+5 hours'), 'user_player1', 2, 'completed', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e');

-- Seed Mission Participants
INSERT OR IGNORE INTO mission_participants (mission_id, user_id, status, checked_in_at, xp_awarded) VALUES
(1, 'user_player1', 'rsvp', NULL, 0),
(1, 'user_player2', 'rsvp', NULL, 0),
(3, 'user_player2', 'checked_in', datetime('now', '-10 days'), 150),
(3, 'user_ambassador', 'checked_in', datetime('now', '-10 days'), 150),
(3, 'user_admin', 'checked_in', datetime('now', '-10 days'), 150),
(4, 'user_player1', 'checked_in', datetime('now', '-2 days'), 100);

-- Seed Mission Impact Reports
INSERT OR IGNORE INTO mission_impact_reports (mission_id, total_trash_weight, trash_bags_count, participants_count, duration_minutes, notes) VALUES
(3, 150.5, 45, 12, 180, 'Great turnout! Collected mostly plastic bottles and wrappers.'),
(4, 50.2, 10, 5, 300, 'Found a ghost net and removed it safely.');

-- Seed Mission Chat
INSERT OR IGNORE INTO mission_chat_messages (mission_id, user_id, message, created_at) VALUES
(1, 'user_ambassador', 'Excited for this weekend! Don''t forget gloves.', datetime('now', '-1 days')),
(1, 'user_player1', 'I''ll bring some extra bags.', datetime('now', '-2 hours')),
(3, 'user_player3', 'Thanks everyone for helping out!', datetime('now', '-9 days'));
