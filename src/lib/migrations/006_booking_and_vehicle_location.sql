-- Add location to vehicles
ALTER TABLE vehicles ADD COLUMN location VARCHAR(255);

-- Update bookings table for modern booking system
ALTER TABLE bookings
    ADD COLUMN start_date DATE,
    ADD COLUMN end_date DATE,
    ADD COLUMN status VARCHAR(32) DEFAULT 'pending',
    ADD COLUMN total_amount NUMERIC(10,2),
    ADD COLUMN created_at TIMESTAMP DEFAULT NOW(),
    ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Ensure bookings table has user_id and vehicle_id as foreign keys
ALTER TABLE bookings
    ADD CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_bookings_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id); 