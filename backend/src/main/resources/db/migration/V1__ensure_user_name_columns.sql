-- Ensure users table exists with name columns
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    ssn VARCHAR(11),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add missing first_name/last_name columns if the table already existed without them
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
