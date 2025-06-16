-- Verify and fix any missing columns
DO $$ 
BEGIN
    -- Check if any required columns are missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'owner_requests' 
        AND column_name = 'phone_number'
    ) THEN
        RAISE EXCEPTION 'Required column phone_number is missing';
    END IF;

    -- Verify NOT NULL constraints
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'owner_requests' 
        AND column_name = 'phone_number'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE owner_requests ALTER COLUMN phone_number SET NOT NULL;
    END IF;

    -- Verify constraints
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'owner_requests' 
        AND constraint_name = 'valid_phone_number'
    ) THEN
        ALTER TABLE owner_requests
            ADD CONSTRAINT valid_phone_number
            CHECK (phone_number ~ '^[0-9]{10}$');
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'owner_requests' 
        AND constraint_name = 'valid_vehicle_type'
    ) THEN
        ALTER TABLE owner_requests
            ADD CONSTRAINT valid_vehicle_type
            CHECK (vehicle_type IN ('car', 'bike'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'owner_requests' 
        AND constraint_name = 'valid_fuel_type'
    ) THEN
        ALTER TABLE owner_requests
            ADD CONSTRAINT valid_fuel_type
            CHECK (fuel_type IN ('petrol', 'diesel', 'ev'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'owner_requests' 
        AND constraint_name = 'valid_transmission'
    ) THEN
        ALTER TABLE owner_requests
            ADD CONSTRAINT valid_transmission
            CHECK (transmission IN ('manual', 'automatic'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'owner_requests' 
        AND constraint_name = 'valid_government_id_type'
    ) THEN
        ALTER TABLE owner_requests
            ADD CONSTRAINT valid_government_id_type
            CHECK (government_id_type IN ('aadhar', 'pan', 'license'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'owner_requests' 
        AND constraint_name = 'valid_registration_number'
    ) THEN
        ALTER TABLE owner_requests
            ADD CONSTRAINT valid_registration_number
            CHECK (registration_number ~ '^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$');
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'owner_requests' 
        AND constraint_name = 'valid_year'
    ) THEN
        ALTER TABLE owner_requests
            ADD CONSTRAINT valid_year
            CHECK (year_of_manufacture >= 1900 AND year_of_manufacture <= EXTRACT(YEAR FROM CURRENT_DATE));
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'owner_requests' 
        AND constraint_name = 'valid_seating_capacity'
    ) THEN
        ALTER TABLE owner_requests
            ADD CONSTRAINT valid_seating_capacity
            CHECK (seating_capacity >= 1 AND seating_capacity <= 10);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'owner_requests' 
        AND constraint_name = 'valid_price'
    ) THEN
        ALTER TABLE owner_requests
            ADD CONSTRAINT valid_price
            CHECK (price_per_day >= 100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'owner_requests' 
        AND constraint_name = 'valid_dates'
    ) THEN
        ALTER TABLE owner_requests
            ADD CONSTRAINT valid_dates
            CHECK (available_to IS NULL OR available_to >= available_from);
    END IF;
END $$;

-- Verify and create indexes if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'owner_requests' 
        AND indexname = 'idx_owner_requests_user_id'
    ) THEN
        CREATE INDEX idx_owner_requests_user_id ON owner_requests(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'owner_requests' 
        AND indexname = 'idx_owner_requests_status'
    ) THEN
        CREATE INDEX idx_owner_requests_status ON owner_requests(status);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'owner_requests' 
        AND indexname = 'idx_owner_requests_registration'
    ) THEN
        CREATE INDEX idx_owner_requests_registration ON owner_requests(registration_number);
    END IF;
END $$; 