-- Add request_type column to owner_requests table
ALTER TABLE owner_requests
ADD COLUMN request_type VARCHAR(50) NOT NULL DEFAULT 'owner_application';

-- Add a check constraint for valid request_type values
ALTER TABLE owner_requests
ADD CONSTRAINT chk_request_type
CHECK (request_type IN ('owner_application', 'vehicle_submission'));

-- Add a column to link to vehicles table for vehicle submissions
ALTER TABLE owner_requests
ADD COLUMN vehicle_id INTEGER REFERENCES vehicles(id);

-- Update existing entries to have request_type 'owner_application'
UPDATE owner_requests
SET request_type = 'owner_application'
WHERE request_type IS NULL;

-- Remove the DEFAULT 'owner_application' now that existing rows are updated
ALTER TABLE owner_requests ALTER COLUMN request_type DROP DEFAULT; 