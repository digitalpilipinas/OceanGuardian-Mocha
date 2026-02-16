-- Update seeded users with real Unsplash avatars

-- Admin: Professional / Tech
UPDATE user_profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' 
WHERE id = 'user_admin';

-- Scientist: Professional / Marine Biologist look
UPDATE user_profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop' 
WHERE id = 'user_scientist';

-- Ambassador: Friendly / Outdoorsy
UPDATE user_profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop' 
WHERE id = 'user_ambassador';

-- Player 1: Young / Energetic
UPDATE user_profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' 
WHERE id = 'user_player1';

-- Player 2: Diver / Water enthusiast
UPDATE user_profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop' 
WHERE id = 'user_player2';

-- Player 3: Volunteer / Friendly
UPDATE user_profiles 
SET avatar_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' 
WHERE id = 'user_player3';
