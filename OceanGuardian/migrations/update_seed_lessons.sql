-- Update seeded lessons with immersive Unsplash cover images

-- Introduction to Marine Ecosystems
UPDATE lessons 
SET cover_image = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=400&auto=format&fit=crop' 
WHERE slug = 'intro-marine-ecosystems';

-- The Plastic Problem
UPDATE lessons 
SET cover_image = 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=400&auto=format&fit=crop' 
WHERE slug = 'plastic-problem';

-- Coral Bleaching Explained
UPDATE lessons 
SET cover_image = 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?q=80&w=400&auto=format&fit=crop' 
WHERE slug = 'coral-bleaching';
