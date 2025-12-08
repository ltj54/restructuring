CREATE UNIQUE INDEX IF NOT EXISTS ux_user_plans_user_id
    ON user_plans (user_id);

CREATE INDEX IF NOT EXISTS ix_insurance_request_user
    ON insurance_request (user_id);

CREATE INDEX IF NOT EXISTS ix_journal_entry_created
    ON journal_entry (created_at DESC);
