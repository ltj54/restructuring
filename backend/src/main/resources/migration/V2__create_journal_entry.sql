CREATE TABLE IF NOT EXISTS res_journal_entry (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES res_users(id) ON DELETE CASCADE,
    phase INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_journal_entry_user_created
    ON res_journal_entry (user_id, created_at DESC);

