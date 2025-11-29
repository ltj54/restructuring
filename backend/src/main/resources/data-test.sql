INSERT INTO users (email, password, first_name, last_name, ssn)
SELECT 'test@example.com',
       '$2a$10$abcdefghijklmnopqrstuv',
       'Testbruker',
       'Testesen',
       '12345678901'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'test@example.com'
);

WITH resolved_user AS (
  SELECT id FROM users WHERE email = 'test@example.com'
)
INSERT INTO user_plans (user_id, phase, persona, needs, diary)
SELECT id, 'INTRO', 'Testpersona', 'need1,need2', 'Standard testplan diary'
FROM resolved_user ru
WHERE NOT EXISTS (
  SELECT 1 FROM user_plans WHERE user_id = ru.id
);

WITH resolved_user AS (
  SELECT id FROM users WHERE email = 'test@example.com'
)
INSERT INTO insurance_request (user_id, xml_content, status)
SELECT id, '<InsuranceRequest><UserId>1</UserId><Test>OK</Test></InsuranceRequest>', 'SENT'
FROM resolved_user ru
WHERE NOT EXISTS (
  SELECT 1 FROM insurance_request WHERE user_id = ru.id
);
