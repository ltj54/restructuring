-- Render-safe migration for ensuring diary column is TEXT.
-- No use of pg_largeobject or lo_get(), which are blocked on Render.

DO $$
DECLARE
    diary_type TEXT;
BEGIN
    -- Ensure table exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'res_user_plans'
    ) THEN
        CREATE TABLE res_user_plans (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES res_users(id) ON DELETE CASCADE,
            phase VARCHAR(50),
            persona VARCHAR(255),
            needs TEXT,
            diary TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS ux_user_plans_user_id
            ON res_user_plans (user_id);
        RETURN;
    END IF;

    -- Determine type of diary column
    SELECT data_type
    INTO diary_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'res_user_plans'
      AND column_name = 'diary';

    -- If missing, add it
    IF diary_type IS NULL THEN
        ALTER TABLE res_user_plans ADD COLUMN diary TEXT;
        RETURN;
    END IF;

    -- If already TEXT, done
    IF diary_type = 'text' THEN
        RETURN;
    END IF;

    -------------------------------------------------------------------
    -- SAFE MIGRATION:
    -- Convert any possible legacy/non-text type to TEXT using ::text
    -------------------------------------------------------------------
    ALTER TABLE res_user_plans
        ALTER COLUMN diary TYPE TEXT
        USING (
            CASE
                WHEN diary IS NULL THEN NULL
                ELSE diary::text
            END
        );

END $$;

