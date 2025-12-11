INSERT INTO users (email, password, first_name, last_name, ssn)
SELECT 'test@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Testbruker', 'Testesen', '12345678901'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'test@example.com');

INSERT INTO user_plans (user_id, phase, persona, needs, diary)
SELECT id, 'INTRO', 'Testpersona', 'need1,need2', 'Standard testplan diary'
FROM users u
WHERE email = 'test@example.com'
  AND NOT EXISTS (SELECT 1 FROM user_plans WHERE user_id = u.id);

INSERT INTO insurance_request (user_id, xml_content, status)
SELECT id, '<InsuranceRequest><UserId>1</UserId><Test>OK</Test></InsuranceRequest>', 'SENT'
FROM users u
WHERE email = 'test@example.com'
  AND NOT EXISTS (SELECT 1 FROM insurance_request WHERE user_id = u.id);
