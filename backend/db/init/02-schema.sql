-- 02-seed-data.sql
-- Insert test users with different roles and regions
INSERT INTO users (username, role, region) VALUES
('john_analyst', 'analyst', 'Midwest'),
('sarah_manager', 'manager', 'East'),
('mike_admin', 'admin', 'All');

-- Insert employee data with sensitive information
INSERT INTO employees (name, ssn, email, phone, department, region, salary) VALUES
('John Doe', '123-45-6789', 'john.doe@company.com', '555-0101', 'Sales', 'Midwest', 75000.00),
('Jane Smith', '987-65-4321', 'jane.smith@company.com', '555-0102', 'IT', 'East', 85000.00),
('Bob Wilson', '456-78-9012', 'bob.wilson@company.com', '555-0103', 'HR', 'West', 65000.00);

-- Insert sample orders
INSERT INTO orders (order_date, customer_name, amount, region, status) VALUES
('2025-10-01', 'Acme Corp', 1500.00, 'Midwest', 'completed'),
('2025-10-15', 'Tech Solutions', 2500.00, 'East', 'pending'),
('2025-10-20', 'West Coast Ltd', 3500.00, 'West', 'completed');