-- Seed Data for Learning System

-- Quizzes
INSERT INTO quiz_questions (question, options, correct_answer, explanation, category, difficulty) VALUES
('What percentage of the Earth''s surface is covered by oceans?', '["50%", "60%", "71%", "85%"]', 2, 'The ocean covers approximately 71% of the Earth''s surface.', 'General', 'easy'),
('Which of these is NOT a type of coral reef?', '["Fringing", "Barrier", "Atoll", "Continental"]', 3, 'Continental is not a standard classification for coral reefs. The main types are fringing, barrier, and atolls.', 'Marine Life', 'medium'),
('How long does it take for a plastic bottle to decompose in the ocean?', '["10 years", "50 years", "450 years", "It never decomposes"]', 2, 'Plastic bottles take approximately 450 years to decompose, and even then, they break down into microplastics.', 'Pollution', 'medium'),
('What is the largest animal to have ever lived on Earth?', '["African Elephant", "Blue Whale", "T-Rex", "Megalodon"]', 1, 'The Blue Whale is the largest animal known to have ever lived, reaching lengths of up to 100 feet.', 'Marine Life', 'easy'),
('Which ocean is the largest?', '["Atlantic", "Indian", "Arctic", "Pacific"]', 3, 'The Pacific Ocean is the largest and deepest of Earth''s oceanic divisions.', 'General', 'easy'),
('What is "ghost fishing"?', '["Fishing in haunted waters", "Fishing without bait", "Lost or abandoned fishing gear trapping animals", "Fishing at night"]', 2, 'Ghost fishing occurs when lost or abandoned fishing gear continues to trap and kill marine life.', 'Conservation', 'medium'),
('How much of the flexible oxygen we breathe comes from the ocean?', '["10%", "25%", "50-80%", "None"]', 2, 'Scientists estimate that 50-80% of the oxygen production on Earth comes from the ocean, mostly from plankton.', 'General', 'medium'),
('What is coral bleaching caused by?', '["Warm water temperatures", "Plastic pollution", "Overfishing", "Noise pollution"]', 0, 'Coral bleaching is primarily caused by stress from rising water temperatures, causing corals to expel their algae.', 'Climate Change', 'medium'),
('Which marine animal has three hearts?', '["Dolphin", "Octopus", "Shark", "Sea Turtle"]', 1, 'Octopuses have three hearts: two pump blood to the gills, and one pumps it to the rest of the body.', 'Marine Life', 'hard'),
('What is the Great Pacific Garbage Patch?', '["A landfill on an island", "A collection of marine debris in the North Pacific", "A recycling center", "A new continent"]', 1, 'It is a massive collection of marine debris, mostly plastics, floating in the North Pacific Ocean.', 'Pollution', 'easy');

-- Facts
INSERT INTO facts (content, category, source, tags) VALUES
('The ocean contains 97% of Earth''s water.', 'General', 'NOAA', 'water,earth'),
('Less than 5% of the ocean has been explored.', 'General', 'NOAA', 'exploration,mystery'),
('Sharks have existed for more than 400 million years, long before dinosaurs.', 'Marine Life', 'NatGeo', 'sharks,history'),
('A single plastic bag can kill numerous marine animals because it takes so long to disintegrate.', 'Pollution', 'Ocean Conservancy', 'plastic,danger'),
('Corals are animals, not plants.', 'Marine Life', 'NOAA', 'coral,biology'),
('The Great Barrier Reef is the only living thing on Earth visible from space.', 'Marine Life', 'NASA', 'coral,space'),
('Sea otters hold hands when they sleep to keep from drifting apart.', 'Marine Life', 'Aquarium of the Pacific', 'cute,behavior'),
('Sound travels roughly 4.3 times faster in water than in air.', 'Science', 'Discovery', 'physics,sound'),
('The blue whale''s heart is the size of a small car.', 'Marine Life', 'WWF', 'whales,anatomy'),
('Ocean acidification is often called "climate change''s evil twin."', 'Climate Change', 'NOAA', 'acidification,climate');

-- Lessons
INSERT INTO lessons (title, slug, description, content, unlock_level, xp_reward) VALUES 
('Introduction to Marine Ecosystems', 'intro-marine-ecosystems', 'Learn about the diverse habitats that make up our oceans.', 
'# Introduction to Marine Ecosystems

The ocean is not just one uniform body of water. It is a collection of diverse ecosystems, each with its own unique characteristics and inhabitants.

## 1. Coral Reefs
Often called the "rainforests of the sea," coral reefs support 25% of all marine species despite covering less than 1% of the ocean floor.

## 2. The Open Ocean (Pelagic Zone)
This vast area away from the coast is home to some of the fastest and largest animals, including tuna, sharks, and whales.

## 3. The Deep Sea
Dark, cold, and under immense pressure, the deep sea is home to bizarre creatures adapted to extreme conditions.

## Why it Matters
Understanding these ecosystems is the first step in protecting them. Each plays a vital role in the planet''s health.
', 1, 100),

('The Plastic Problem', 'plastic-problem', 'Understand the scale of plastic pollution and its impact.', 
'# The Plastic Problem

## A Global Crisis
Millions of tons of plastic enter our oceans every year. From microplastics to massive ghost nets, this pollution threatens marine life at every level.

## Microplastics
Plastic doesn''t go away; it breaks down into smaller pieces called microplastics. These are eaten by plankton and move up the food chain, eventually reaching humans.

## What Can We Do?
- Reduce single-use plastics
- Participate in beach cleanups
- Support bans on harmful plastics

Your actions as an Ocean Guardian make a real difference!
', 1, 150),

('Coral Bleaching Explained', 'coral-bleaching', 'Deep dive into what causes coral bleaching and how to stop it.', 
'# Coral Bleaching Explained

## The Symbiosis
Corals have a symbiotic relationship with microscopic algae called zooxanthellae that live in their tissues. These algae provide food and color to the corals.

## The Stress Response
When water temperatures rise due to climate change, corals become stressed. To survive, they expel the algae. This leaves the coral tissue transparent, revealing the white skeleton underneath—hence "bleaching."

## Is it Fatal?
Bleached corals are not dead, but they are starving. If temperatures return to normal quickly, they can recover. If the stress continues, they die.

## Solutions
- Reduce carbon emissions
- Protect local water quality
- Establish Marine Protected Areas
', 5, 200);
