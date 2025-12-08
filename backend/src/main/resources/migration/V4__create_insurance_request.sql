-- Recreate Flyway tracking for insurance_request table
-- Ensures schema is aligned with application expectation but without dropping existing data.

DO $$
BEGIN
    -- Create table only if it does NOT already exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'insurance_request'
    ) THEN
        CREATE TABLE insurance_request (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            full_name VARCHAR(255),
            email VARCHAR(255),
            phone VARCHAR(50),
            insurance_type VARCHAR(100),
            explanation TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    END IF;
END $$;
