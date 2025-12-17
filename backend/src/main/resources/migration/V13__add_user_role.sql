-- V13__add_user_role.sql
-- Legger til rolle på res_users-tabellen og sikrer default-verdi

ALTER TABLE res_users
ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'USER';

-- Ekstra sikkerhet hvis tabellen allerede har rader (defensivt)
UPDATE res_users
SET role = 'USER'
WHERE role IS NULL;

