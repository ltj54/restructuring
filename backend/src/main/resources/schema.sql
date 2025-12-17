CREATE TABLE IF NOT EXISTS res_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    ssn VARCHAR(11),
    phone VARCHAR(32),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    role varchar(30) not null default 'USER'
);

CREATE TABLE IF NOT EXISTS res_user_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES res_users(id) ON DELETE CASCADE,
    phase VARCHAR(50),
    persona VARCHAR(255),
    needs TEXT,
    diary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS res_insurance_request (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES res_users(id) ON DELETE CASCADE,
    xml_content TEXT NOT NULL,
    status VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS res_journal_entry (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES res_users(id) ON DELETE CASCADE,
    phase INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_journal_entry_user_created
    ON res_journal_entry (user_id, created_at DESC);

