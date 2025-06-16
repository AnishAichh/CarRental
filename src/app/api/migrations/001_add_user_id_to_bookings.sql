-- Add user_id to bookings table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN user_id INTEGER REFERENCES users(id);
    END IF;
END $$; 