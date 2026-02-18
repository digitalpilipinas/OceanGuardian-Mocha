-- Add idempotency support for sighting creation retries
ALTER TABLE sightings ADD COLUMN client_request_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sightings_user_request_id
  ON sightings(user_id, client_request_id)
  WHERE client_request_id IS NOT NULL;
