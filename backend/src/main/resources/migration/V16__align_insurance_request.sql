-- Align insurance_request table with current actual schema
-- Removes legacy columns from old migration
-- Ensures xml_content and status exist

ALTER TABLE insurance_request
    DROP COLUMN IF EXISTS full_name,
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS insurance_type,
    DROP COLUMN IF EXISTS explanation;

ALTER TABLE insurance_request
    ADD COLUMN IF NOT EXISTS xml_content TEXT NOT NULL,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- created_at is expected to already exist
