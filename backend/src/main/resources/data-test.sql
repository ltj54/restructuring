INSERT INTO res_users (email, password, first_name, last_name, ssn)
SELECT 'test@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Testbruker', 'Testesen', '12345678901'
WHERE NOT EXISTS (SELECT 1 FROM res_users WHERE email = 'test@example.com');

INSERT INTO res_user_plans (user_id, phase, persona, needs, diary)
SELECT id, 'INTRO', 'Testpersona', 'need1,need2', 'Standard testplan diary'
FROM res_users u
WHERE email = 'test@example.com'
  AND NOT EXISTS (SELECT 1 FROM res_user_plans WHERE user_id = u.id);

INSERT INTO res_insurance_request (user_id, xml_content, status)
SELECT id, '<InsuranceRequest><UserId>1</UserId><Test>OK</Test></InsuranceRequest>', 'SENT'
FROM res_users u
WHERE email = 'test@example.com'
  AND NOT EXISTS (SELECT 1 FROM res_insurance_request WHERE user_id = u.id);

