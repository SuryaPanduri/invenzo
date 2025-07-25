
-- Create the database
CREATE DATABASE IF NOT EXISTS invenzo_db;
USE invenzo_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Manager', 'Viewer') NOT NULL DEFAULT 'Viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(100),
  purchase_date DATE,
  status VARCHAR(50) DEFAULT 'Available',
  serial_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create checkouts table
CREATE TABLE IF NOT EXISTS checkouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  user_id INT NOT NULL,
  checkout_date DATE NOT NULL,
  return_date DATE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@invenzo.com', 'admin123', 'Admin'),
('Manager User', 'manager@invenzo.com', 'manager123', 'Manager'),
('Viewer User', 'viewer@invenzo.com', 'viewer123', 'Viewer');

-- Insert sample assets
INSERT INTO assets (name, type, purchase_date, status, serial_number, notes) VALUES
('Laptop HP Elitebook', 'Laptop', '2023-01-10', 'Available', 'HP123456', 'For remote developers'),
('Dell Monitor 24\"', 'Monitor', '2022-11-15', 'Checked Out', 'DELL98765', 'Dual-screen setup'),
('Apple MacBook Pro', 'Laptop', '2023-06-01', 'Available', 'MAC456789', 'High-end development'),
('Projector BenQ', 'Projector', '2021-12-01', 'Available', 'PROJ112233', 'For conference room use');

-- Insert sample checkouts
INSERT INTO checkouts (asset_id, user_id, checkout_date, return_date) VALUES
(2, 2, '2024-01-05', NULL),
(3, 1, '2024-02-01', '2024-03-01');