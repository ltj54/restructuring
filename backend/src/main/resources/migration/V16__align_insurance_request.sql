-- Align res_insurance_request table with current actual schema
-- Removes legacy columns from old migration
-- Ensures xml_content and status exist

DO $$
BEGIN
    ALTER TABLE res_insurance_request
        DROP COLUMN IF EXISTS full_name,
        DROP COLUMN IF EXISTS email,
        DROP COLUMN IF EXISTS phone,
        DROP COLUMN IF EXISTS insurance_type,
        DROP COLUMN IF EXISTS explanation;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'res_insurance_request'
          AND column_name  = 'xml_content'
    ) THEN
        ALTER TABLE res_insurance_request
            ADD COLUMN xml_content TEXT NOT NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'res_insurance_request'
          AND column_name  = 'status'
    ) THEN
        ALTER TABLE res_insurance_request
            ADD COLUMN status VARCHAR(50);
    END IF;
END $$;

-- created_at is expected to already exist
