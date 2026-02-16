-- Seed Users
INSERT OR IGNORE INTO user_profiles (id, username, email, role, level, xp, reputation, streak_days, total_sightings, total_missions, region, country) VALUES
('user_admin', 'AdminUser', 'admin@ocean.com', 'admin', 50, 10000, 5000, 100, 50, 20, 'Global', 'Global'),
('user_scientist', 'DrMarine', 'scientist@ocean.com', 'scientist', 40, 8000, 4000, 50, 200, 5, 'Pacific', 'USA'),
('user_ambassador', 'CoastalAmbassador', 'ambassador@ocean.com', 'ambassador', 30, 5000, 2500, 30, 100, 50, 'California', 'USA'),
('user_player1', 'OceanExplorer', 'player1@ocean.com', 'player', 15, 2500, 1200, 12, 45, 3, 'Florida', 'USA'),
('user_player2', 'CoralDiver', 'player2@ocean.com', 'player', 25, 4500, 2000, 25, 80, 8, 'Queensland', 'Australia'),
('user_player3', 'BeachCleaner', 'player3@ocean.com', 'player', 5, 500, 100, 2, 10, 1, 'Bali', 'Indonesia');
