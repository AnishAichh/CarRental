-- Create owner_requests table
CREATE TABLE owner_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    
    -- Owner Info
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    government_id_type VARCHAR(20) NOT NULL,
    government_id_number VARCHAR(50) NOT NULL,
    id_image_url TEXT NOT NULL,
    selfie_url TEXT NOT NULL,
    
    -- Vehicle Details
    vehicle_type VARCHAR(20) NOT NULL,
    brand_model VARCHAR(255) NOT NULL,
    registration_number VARCHAR(20) NOT NULL,
    year_of_manufacture INTEGER NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    seating_capacity INTEGER NOT NULL,
    vehicle_photo_url TEXT NOT NULL,
    insurance_document_url TEXT,
    rc_document_url TEXT NOT NULL,
    
    -- Pricing & Availability
    price_per_day DECIMAL(10,2) NOT NULL,
    available_from DATE NOT NULL,
    available_to DATE,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_owner_requests_user_id ON owner_requests(user_id);
CREATE INDEX idx_owner_requests_status ON owner_requests(status);
CREATE INDEX idx_owner_requests_registration ON owner_requests(registration_number);

-- Add trigger for updated_at
CREATE TRIGGER set_owner_requests_updated_at
    BEFORE UPDATE ON owner_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE owner_requests
    ADD CONSTRAINT valid_status
    CHECK (status IN ('pending', 'approved', 'rejected')),
    ADD CONSTRAINT valid_vehicle_type
    CHECK (vehicle_type IN ('car', 'bike')),
    ADD CONSTRAINT valid_fuel_type
    CHECK (fuel_type IN ('petrol', 'diesel', 'ev')),
    ADD CONSTRAINT valid_transmission
    CHECK (transmission IN ('manual', 'automatic')),
    ADD CONSTRAINT valid_government_id_type
    CHECK (government_id_type IN ('aadhar', 'pan', 'license')),
    ADD CONSTRAINT valid_registration_number
    CHECK (registration_number ~ '^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$'),
    ADD CONSTRAINT valid_phone_number
    CHECK (phone_number ~ '^[0-9]{10}$'),
    ADD CONSTRAINT valid_year
    CHECK (year_of_manufacture >= 1900 AND year_of_manufacture <= EXTRACT(YEAR FROM CURRENT_DATE)),
    ADD CONSTRAINT valid_seating_capacity
    CHECK (seating_capacity >= 1 AND seating_capacity <= 10),
    ADD CONSTRAINT valid_price
    CHECK (price_per_day >= 100),
    ADD CONSTRAINT valid_dates
    CHECK (available_to IS NULL OR available_to >= available_from);

-- Drop existing constraints if they exist
ALTER TABLE owner_requests
    DROP CONSTRAINT IF EXISTS valid_status,
    DROP CONSTRAINT IF EXISTS valid_vehicle_type,
    DROP CONSTRAINT IF EXISTS valid_fuel_type,
    DROP CONSTRAINT IF EXISTS valid_transmission,
    DROP CONSTRAINT IF EXISTS valid_government_id_type,
    DROP CONSTRAINT IF EXISTS valid_registration_number,
    DROP CONSTRAINT IF EXISTS valid_phone_number,
    DROP CONSTRAINT IF EXISTS valid_year,
    DROP CONSTRAINT IF EXISTS valid_seating_capacity,
    DROP CONSTRAINT IF EXISTS valid_price,
    DROP CONSTRAINT IF EXISTS valid_dates;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_owner_requests_user_id;
DROP INDEX IF EXISTS idx_owner_requests_status;
DROP INDEX IF EXISTS idx_owner_requests_registration;

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Owner Info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'phone_number') THEN
        ALTER TABLE owner_requests ADD COLUMN phone_number VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'email') THEN
        ALTER TABLE owner_requests ADD COLUMN email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'address') THEN
        ALTER TABLE owner_requests ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'government_id_type') THEN
        ALTER TABLE owner_requests ADD COLUMN government_id_type VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'government_id_number') THEN
        ALTER TABLE owner_requests ADD COLUMN government_id_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'id_image_url') THEN
        ALTER TABLE owner_requests ADD COLUMN id_image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'selfie_url') THEN
        ALTER TABLE owner_requests ADD COLUMN selfie_url TEXT;
    END IF;
    
    -- Vehicle Details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'vehicle_type') THEN
        ALTER TABLE owner_requests ADD COLUMN vehicle_type VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'brand_model') THEN
        ALTER TABLE owner_requests ADD COLUMN brand_model VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'registration_number') THEN
        ALTER TABLE owner_requests ADD COLUMN registration_number VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'year_of_manufacture') THEN
        ALTER TABLE owner_requests ADD COLUMN year_of_manufacture INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'fuel_type') THEN
        ALTER TABLE owner_requests ADD COLUMN fuel_type VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'transmission') THEN
        ALTER TABLE owner_requests ADD COLUMN transmission VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'seating_capacity') THEN
        ALTER TABLE owner_requests ADD COLUMN seating_capacity INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'vehicle_photo_url') THEN
        ALTER TABLE owner_requests ADD COLUMN vehicle_photo_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'insurance_document_url') THEN
        ALTER TABLE owner_requests ADD COLUMN insurance_document_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'rc_document_url') THEN
        ALTER TABLE owner_requests ADD COLUMN rc_document_url TEXT;
    END IF;
    
    -- Pricing & Availability
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'price_per_day') THEN
        ALTER TABLE owner_requests ADD COLUMN price_per_day DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'available_from') THEN
        ALTER TABLE owner_requests ADD COLUMN available_from DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_requests' AND column_name = 'available_to') THEN
        ALTER TABLE owner_requests ADD COLUMN available_to DATE;
    END IF;
END $$;

-- Make new columns NOT NULL if they have data
DO $$ 
BEGIN
    -- Update existing rows to have default values where needed
    UPDATE owner_requests 
    SET 
        phone_number = '0000000000',
        email = 'temp@example.com',
        address = 'Temporary Address',
        government_id_type = 'aadhar',
        government_id_number = '000000000000',
        id_image_url = driving_license_url,
        selfie_url = address_proof_url,
        vehicle_type = 'car',
        brand_model = 'Unknown',
        registration_number = 'XX00XX0000',
        year_of_manufacture = 2024,
        fuel_type = 'petrol',
        transmission = 'manual',
        seating_capacity = 4,
        vehicle_photo_url = driving_license_url,
        rc_document_url = address_proof_url,
        price_per_day = 1000,
        available_from = CURRENT_DATE
    WHERE phone_number IS NULL;

    -- Now make columns NOT NULL
    ALTER TABLE owner_requests
        ALTER COLUMN phone_number SET NOT NULL,
        ALTER COLUMN email SET NOT NULL,
        ALTER COLUMN address SET NOT NULL,
        ALTER COLUMN government_id_type SET NOT NULL,
        ALTER COLUMN government_id_number SET NOT NULL,
        ALTER COLUMN id_image_url SET NOT NULL,
        ALTER COLUMN selfie_url SET NOT NULL,
        ALTER COLUMN vehicle_type SET NOT NULL,
        ALTER COLUMN brand_model SET NOT NULL,
        ALTER COLUMN registration_number SET NOT NULL,
        ALTER COLUMN year_of_manufacture SET NOT NULL,
        ALTER COLUMN fuel_type SET NOT NULL,
        ALTER COLUMN transmission SET NOT NULL,
        ALTER COLUMN seating_capacity SET NOT NULL,
        ALTER COLUMN vehicle_photo_url SET NOT NULL,
        ALTER COLUMN rc_document_url SET NOT NULL,
        ALTER COLUMN price_per_day SET NOT NULL,
        ALTER COLUMN available_from SET NOT NULL;
END $$;

-- Drop old columns
ALTER TABLE owner_requests
    DROP COLUMN IF EXISTS driving_license_url,
    DROP COLUMN IF EXISTS address_proof_url,
    DROP COLUMN IF EXISTS ownership_declaration;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_owner_requests_user_id ON owner_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_owner_requests_status ON owner_requests(status);
CREATE INDEX IF NOT EXISTS idx_owner_requests_registration ON owner_requests(registration_number);

-- Add new constraints
ALTER TABLE owner_requests
    ADD CONSTRAINT valid_status
    CHECK (status IN ('pending', 'approved', 'rejected')),
    ADD CONSTRAINT valid_vehicle_type
    CHECK (vehicle_type IN ('car', 'bike')),
    ADD CONSTRAINT valid_fuel_type
    CHECK (fuel_type IN ('petrol', 'diesel', 'ev')),
    ADD CONSTRAINT valid_transmission
    CHECK (transmission IN ('manual', 'automatic')),
    ADD CONSTRAINT valid_government_id_type
    CHECK (government_id_type IN ('aadhar', 'pan', 'license')),
    ADD CONSTRAINT valid_registration_number
    CHECK (registration_number ~ '^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$'),
    ADD CONSTRAINT valid_phone_number
    CHECK (phone_number ~ '^[0-9]{10}$'),
    ADD CONSTRAINT valid_year
    CHECK (year_of_manufacture >= 1900 AND year_of_manufacture <= EXTRACT(YEAR FROM CURRENT_DATE)),
    ADD CONSTRAINT valid_seating_capacity
    CHECK (seating_capacity >= 1 AND seating_capacity <= 10),
    ADD CONSTRAINT valid_price
    CHECK (price_per_day >= 100),
    ADD CONSTRAINT valid_dates
    CHECK (available_to IS NULL OR available_to >= available_from); 