-- Recreate Flyway tracking for res_insurance_request table
-- Ensures schema is aligned with application expectation but without dropping existing data.

DO $$
BEGIN
    -- Create table only if it does NOT already exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'res_insurance_request'
    ) THEN
        CREATE TABLE res_insurance_request (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES res_users(id) ON DELETE CASCADE,
            xml_content TEXT NOT NULL,
            status VARCHAR(50),
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    END IF;
END $$;

