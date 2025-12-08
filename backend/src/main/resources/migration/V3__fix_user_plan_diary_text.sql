-- Align user_plans.diary with application expectation (TEXT)
-- Handles cases where diary was created as an OID/LOB.

DO $$
DECLARE
    diary_type TEXT;
BEGIN
    -- Ensure table exists
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

    -- Determine type of diary column
    SELECT data_type
    INTO diary_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_plans'
      AND column_name = 'diary';

    -- Add if missing
    IF diary_type IS NULL THEN
        ALTER TABLE user_plans ADD COLUMN diary TEXT;
        RETURN;
    END IF;

    -- If already TEXT → nothing to do
    IF diary_type = 'text' THEN
        RETURN;
    END IF;

    -------------------------------------------------------------------
    -- SAFEST MIGRATION:
    -- 1) Add diary_tmp TEXT
    -- 2) Copy values using UPDATE (allowed to use subqueries here)
    -- 3) Drop original diary column
    -- 4) Rename diary_tmp → diary
    -------------------------------------------------------------------

    ALTER TABLE user_plans ADD COLUMN diary_tmp TEXT;

    -- Copy data
    UPDATE user_plans
    SET diary_tmp =
        CASE
            WHEN diary IS NULL THEN NULL
            WHEN EXISTS (
                SELECT 1
                FROM pg_largeobject
                WHERE loid = user_plans.diary
            )
                THEN convert_from(lo_get(diary), 'UTF8')
            ELSE diary::text
        END;

    ALTER TABLE user_plans DROP COLUMN diary;

    ALTER TABLE user_plans RENAME COLUMN diary_tmp TO diary;

END $$;
