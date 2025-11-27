-- Opprett eksempelbrukere eller grunn-data for dev
INSERT INTO app_user (email, password, full_name)
VALUES
  ('test@example.com', 'dummy', 'Test User')
ON CONFLICT DO NOTHING;
