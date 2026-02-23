CREATE TABLE IF NOT EXISTS asset_checkouts (
  id SERIAL PRIMARY KEY,
  asset_id INT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  checked_out_to_user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  checked_out_by_user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  checkout_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  returned_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS asset_audit_logs (
  id SERIAL PRIMARY KEY,
  asset_id INT REFERENCES assets(id) ON DELETE SET NULL,
  actor_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(32) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_checkouts_asset_id ON asset_checkouts(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_checkouts_open ON asset_checkouts(asset_id, returned_at);
CREATE INDEX IF NOT EXISTS idx_asset_checkouts_due_date ON asset_checkouts(due_date);
CREATE INDEX IF NOT EXISTS idx_asset_audit_logs_asset_id ON asset_audit_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_audit_logs_created_at ON asset_audit_logs(created_at);
