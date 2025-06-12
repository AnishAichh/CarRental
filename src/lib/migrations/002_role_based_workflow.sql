-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'owner', 'admin'));

-- Add KYC verification status to users
ALTER TABLE users ADD COLUMN is_kyc_verified BOOLEAN NOT NULL DEFAULT false;

-- Modify vehicles table to support approval workflow
ALTER TABLE vehicles 
    ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending_approval' 
    CHECK (status IN ('pending_approval', 'pending_physical_verification', 'approved', 'rejected')),
    ADD COLUMN approved_by_admin BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN last_inspection_date TIMESTAMP,
    ADD COLUMN inspection_notes TEXT;

-- Create table for vehicle review requests (post-ride inspection)
CREATE TABLE vehicle_review_requests (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected')),
    request_date TIMESTAMP NOT NULL DEFAULT NOW(),
    review_date TIMESTAMP,
    review_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create table for bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Create index for faster queries
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_review_requests_vehicle ON vehicle_review_requests(vehicle_id);
CREATE INDEX idx_review_requests_owner ON vehicle_review_requests(owner_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_requests_updated_at
    BEFORE UPDATE ON vehicle_review_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add function to automatically update user role to owner when they list a vehicle
CREATE OR REPLACE FUNCTION update_user_role_to_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.owner_id IS NOT NULL THEN
        UPDATE users SET role = 'owner' WHERE id = NEW.owner_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_role_on_vehicle_listing
    AFTER INSERT ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_role_to_owner();

-- Add missing columns to vehicles table
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS approved_by_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending_approval',
ADD COLUMN IF NOT EXISTS availability BOOLEAN DEFAULT true;

-- Add check constraint for status
ALTER TABLE vehicles
ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('pending_approval', 'approved', 'rejected', 'pending_physical_verification'));

-- Update existing vehicles to have the correct status
UPDATE vehicles 
SET status = 'approved', 
    approved_by_admin = true 
WHERE approved = true;

UPDATE vehicles 
SET status = 'rejected', 
    approved_by_admin = false 
WHERE approved = false;

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to vehicles table
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 