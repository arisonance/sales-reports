-- Audit trail for admin report edits
CREATE TABLE report_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  edited_by TEXT NOT NULL DEFAULT 'admin',
  edited_at TIMESTAMPTZ DEFAULT NOW(),
  changes JSONB NOT NULL,
  edit_reason TEXT
);

CREATE INDEX idx_report_edit_history_report_id ON report_edit_history(report_id);

-- Enable RLS
ALTER TABLE report_edit_history ENABLE ROW LEVEL SECURITY;

-- Allow all access (admin-only table)
CREATE POLICY "Allow all access to report_edit_history" ON report_edit_history FOR ALL USING (true);
