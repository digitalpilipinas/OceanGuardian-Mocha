-- Seed Users
INSERT OR IGNORE INTO user_profiles (id, username, email, role, level, xp, reputation, streak_days, total_sightings, total_missions, region, country) VALUES
('user_admin', 'AdminUser', 'admin@ocean.com', 'admin', 50, 10000, 5000, 100, 50, 20, 'Global', 'Global'),
('user_scientist', 'DrMarine', 'scientist@ocean.com', 'scientist', 40, 8000, 4000, 50, 200, 5, 'Pacific', 'USA'),
('user_ambassador', 'CoastalAmbassador', 'ambassador@ocean.com', 'ambassador', 30, 5000, 2500, 30, 100, 50, 'California', 'USA'),
('user_player1', 'OceanExplorer', 'player1@ocean.com', 'player', 15, 2500, 1200, 12, 45, 3, 'Florida', 'USA'),
('user_player2', 'CoralDiver', 'player2@ocean.com', 'player', 25, 4500, 2000, 25, 80, 8, 'Queensland', 'Australia'),
('user_player3', 'BeachCleaner', 'player3@ocean.com', 'player', 5, 500, 100, 2, 10, 1, 'Bali', 'Indonesia'),
('user_player4', 'WaveRider', 'player4@ocean.com', 'player', 12, 1800, 800, 5, 30, 2, 'Hawaii', 'USA'),
('user_player5', 'MarineManiac', 'player5@ocean.com', 'player', 20, 3200, 1500, 18, 60, 5, 'Cape Town', 'South Africa'),
('user_player6', 'DeepBlue', 'player6@ocean.com', 'player', 8, 900, 300, 3, 15, 1, 'Marseille', 'France'),
('user_player7', 'TideTurner', 'player7@ocean.com', 'player', 14, 2100, 950, 10, 38, 4, 'Lisbon', 'Portugal'),
('user_scientist2', 'ProfPlankton', 'scientist2@ocean.com', 'scientist', 45, 9500, 4800, 60, 250, 8, 'Norway', 'Norway'),
('user_ambassador2', 'EcoGuardian', 'ambassador2@ocean.com', 'ambassador', 35, 6000, 3000, 45, 120, 15, 'Tokyo', 'Japan'),
('user_player8', 'IslandVibes', 'player8@ocean.com', 'player', 10, 1200, 500, 7, 20, 2, 'Fiji', 'Fiji'),
('user_player9', 'AquaLover', 'player9@ocean.com', 'player', 22, 4000, 1800, 22, 75, 7, 'Cancun', 'Mexico'),
('user_player10', 'SeaSeeker', 'player10@ocean.com', 'player', 18, 2800, 1100, 15, 50, 4, 'Rio', 'Brazil'),
('user_player11', 'WhaleWatcher', 'player11@ocean.com', 'player', 7, 700, 200, 4, 12, 1, 'Iceland', 'Iceland');
