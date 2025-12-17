-- Fail fast if the table is locked so Flyway doesn't hang forever.
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '30s';

ALTER TABLE res_users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(32);

