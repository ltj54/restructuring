-- V13__add_user_role.sql
-- Legger til rolle på users-tabellen og sikrer default-verdi

ALTER TABLE users
ADD COLUMN role VARCHAR(30) NOT NULL DEFAULT 'USER';

-- Ekstra sikkerhet hvis tabellen allerede har rader (defensivt)
UPDATE users
SET role = 'USER'
WHERE role IS NULL;
