ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token_hash VARCHAR(128),
  ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_reset_token_hash ON users(reset_token_hash);
