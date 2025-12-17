DO $$
BEGIN
    -- Create table if missing
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

    -- Ensure columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'res_user_plans'
          AND column_name  = 'phase'
    ) THEN
        ALTER TABLE res_user_plans ADD COLUMN phase VARCHAR(50);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'res_user_plans'
          AND column_name  = 'persona'
    ) THEN
        ALTER TABLE res_user_plans ADD COLUMN persona VARCHAR(255);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'res_user_plans'
          AND column_name  = 'needs'
    ) THEN
        ALTER TABLE res_user_plans ADD COLUMN needs TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'res_user_plans'
          AND column_name  = 'diary'
    ) THEN
        ALTER TABLE res_user_plans ADD COLUMN diary TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'res_user_plans'
          AND column_name  = 'created_at'
    ) THEN
        ALTER TABLE res_user_plans ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'res_user_plans'
          AND column_name  = 'updated_at'
    ) THEN
        ALTER TABLE res_user_plans ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename  = 'res_user_plans'
          AND indexname  = 'ux_user_plans_user_id'
    ) THEN
        CREATE UNIQUE INDEX ux_user_plans_user_id
            ON res_user_plans (user_id);
    END IF;

END $$;
