DO $$
BEGIN
    -- Create table if missing
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'user_plans'
    ) THEN
        CREATE TABLE user_plans (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            phase VARCHAR(50),
            persona VARCHAR(255),
            needs TEXT,
            diary TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE UNIQUE INDEX IF NOT EXISTS ux_user_plans_user_id
            ON user_plans (user_id);

        RETURN;
    END IF;

    -- Ensure columns exist
    ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS phase VARCHAR(50);
    ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS persona VARCHAR(255);
    ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS needs TEXT;
    ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS diary TEXT;
    ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

END $$;
