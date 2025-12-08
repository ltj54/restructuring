-- Adds automatic update of updated_at column on user_plans updates

-- Create function only if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc
        WHERE proname = 'set_updated_at'
    ) THEN
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS trigger AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
    END IF;
END $$;

-- Create trigger if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'trg_set_updated_at_user_plans'
    ) THEN
        CREATE TRIGGER trg_set_updated_at_user_plans
        BEFORE UPDATE ON user_plans
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;
