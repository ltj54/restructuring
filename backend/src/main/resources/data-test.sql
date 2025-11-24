------------------------------------------------------------
-- USERS
------------------------------------------------------------
INSERT INTO users (id, email, password, first_name, last_name, ssn, created_at, updated_at)
VALUES
  (1, 'test@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Testbruker', 'Testesen', '12345678901', NOW(), NOW());

------------------------------------------------------------
-- USER PLANS
------------------------------------------------------------
INSERT INTO user_plans (id, user_id, phase, persona, needs, diary, created_at, updated_at)
VALUES
  (1, 1, 'INTRO', 'Testpersona', 'need1,need2', 'Standard testplan diary', NOW(), NOW());

------------------------------------------------------------
-- INSURANCE REQUEST
------------------------------------------------------------
INSERT INTO insurance_request (id, user_id, xml_content, status, created_at)
VALUES
  (1, 1, '<InsuranceRequest><UserId>1</UserId><Test>OK</Test></InsuranceRequest>', 'SENT', NOW());
