-- Test seed data (H2-friendly). Use MERGE (upsert) instead of PostgreSQL ON CONFLICT.

MERGE INTO users (email, password, first_name, last_name, ssn) KEY(email)
VALUES (
  'test@example.com',
  '$2a$10$abcdefghijklmnopqrstuv',
  'Testbruker',
  'Testesen',
  '12345678901'
);

INSERT INTO user_plans (user_id, phase, persona, needs, diary)
SELECT u.id, 'INTRO', 'Testpersona', 'need1,need2', 'Standard testplan diary'
FROM users u
WHERE u.email = 'test@example.com'
  AND NOT EXISTS (SELECT 1 FROM user_plans WHERE user_id = u.id);

INSERT INTO insurance_request (user_id, xml_content, status)
SELECT u.id, '<InsuranceRequest><UserId>1</UserId><Test>OK</Test></InsuranceRequest>', 'SENT'
FROM users u
WHERE u.email = 'test@example.com'
  AND NOT EXISTS (SELECT 1 FROM insurance_request WHERE user_id = u.id);
