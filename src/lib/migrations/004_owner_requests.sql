-- Create owner_requests table
CREATE TABLE owner_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    driving_license_url TEXT NOT NULL,
    address_proof_url TEXT NOT NULL,
    ownership_declaration TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_owner_requests_user_id ON owner_requests(user_id);
CREATE INDEX idx_owner_requests_status ON owner_requests(status);

-- Add trigger for updated_at
CREATE TRIGGER set_owner_requests_updated_at
    BEFORE UPDATE ON owner_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraint for status values
ALTER TABLE owner_requests
    ADD CONSTRAINT valid_status
    CHECK (status IN ('pending', 'approved', 'rejected')); 