INSERT INTO users (name, email, password, role)
SELECT
  'Admin User',
  'admin@invenzo.com',
  '$2b$10$0Kr9DUy2du/UHEiY0ewyI.C.iOuXhEf4e3TaTkYlauLqpvxBX.lgK',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@invenzo.com'
);

INSERT INTO users (name, email, password, role)
SELECT
  'Manager User',
  'manager@invenzo.com',
  '$2b$10$3sX/1lqtL5ihfZIA5U8v5uyCMsINYwl80vQ3nMprXeFZQfp7g79ze',
  'manager'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'manager@invenzo.com'
);

INSERT INTO users (name, email, password, role)
SELECT
  'Viewer User',
  'viewer@invenzo.com',
  '$2b$10$8hhu2RBOmCnJGEB785I32.FXwfz1UraSGJImoqsFA4uwbzrmdl0ky',
  'viewer'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'viewer@invenzo.com'
);

INSERT INTO assets (name, type, purchase_date, status, serial_number, notes)
SELECT
  'Laptop HP Elitebook',
  'Laptop',
  '2023-01-10',
  'Available',
  'HP123456',
  'For remote developers'
WHERE NOT EXISTS (
  SELECT 1 FROM assets WHERE serial_number = 'HP123456'
);

INSERT INTO assets (name, type, purchase_date, status, serial_number, notes)
SELECT
  'Dell Monitor 24"',
  'Monitor',
  '2022-11-15',
  'Checked Out',
  'DELL98765',
  'Dual-screen setup'
WHERE NOT EXISTS (
  SELECT 1 FROM assets WHERE serial_number = 'DELL98765'
);

INSERT INTO assets (name, type, purchase_date, status, serial_number, notes)
SELECT
  'Apple MacBook Pro',
  'Laptop',
  '2023-06-01',
  'Available',
  'MAC456789',
  'High-end development'
WHERE NOT EXISTS (
  SELECT 1 FROM assets WHERE serial_number = 'MAC456789'
);

INSERT INTO assets (name, type, purchase_date, status, serial_number, notes)
SELECT
  'Projector BenQ',
  'Projector',
  '2021-12-01',
  'Available',
  'PROJ112233',
  'For conference room use'
WHERE NOT EXISTS (
  SELECT 1 FROM assets WHERE serial_number = 'PROJ112233'
);
