-- Add idempotency keys for comments and mission chat retries
ALTER TABLE sighting_comments ADD COLUMN client_request_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sighting_comments_request_id
  ON sighting_comments(sighting_id, user_id, client_request_id)
  WHERE client_request_id IS NOT NULL;

ALTER TABLE mission_chat_messages ADD COLUMN client_request_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mission_chat_request_id
  ON mission_chat_messages(mission_id, user_id, client_request_id)
  WHERE client_request_id IS NOT NULL;
