-- Align user_plans.diary with application expectation (plain TEXT JSON)
-- Handles existing tables where diary was created as OID/LOB.
DO $$
DECLARE
    diary_type TEXT;
BEGIN
    -- Ensure table exists (older setups relied on Hibernate auto DDL)
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

    SELECT data_type
    INTO diary_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_plans'
      AND column_name = 'diary';

    -- Add column if missing
    IF diary_type IS NULL THEN
        ALTER TABLE user_plans ADD COLUMN diary TEXT;
        RETURN;
    END IF;

    -- Convert OID/other types to TEXT safely
    IF diary_type <> 'text' THEN
        ALTER TABLE user_plans
            ALTER COLUMN diary TYPE TEXT
            USING (
                CASE
                    WHEN diary IS NULL THEN NULL
                    WHEN EXISTS (SELECT 1 FROM pg_largeobject WHERE loid = diary) THEN
                        convert_from(lo_get(diary), 'UTF8')
                    ELSE diary::text
                END
            );
    END IF;
END $$;
