-- Add address column to users table
ALTER TABLE users ADD COLUMN address TEXT;

-- Add index for address searches if needed
CREATE INDEX idx_users_address ON users(address);
