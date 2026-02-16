
CREATE TABLE sightings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  description TEXT NOT NULL,
  severity INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  address TEXT,
  image_key TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sightings_user_id ON sightings(user_id);
CREATE INDEX idx_sightings_type ON sightings(type);
CREATE INDEX idx_sightings_created_at ON sightings(created_at);
