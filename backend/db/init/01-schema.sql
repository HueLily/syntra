-- 01-schema.sql
-- Create tables with sensitive data support
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,  -- for role-based access
    region VARCHAR(50) NOT NULL  -- for regional filtering
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ssn VARCHAR(11) NOT NULL,    -- sensitive field for masking
    email VARCHAR(255) NOT NULL, -- sensitive field for masking
    phone VARCHAR(15),           -- sensitive field for masking
    department VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL, -- for regional filtering
    salary DECIMAL(10,2)        -- sensitive field
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_date DATE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    region VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL
);