-- Add selfie_url column to kyc table if it does not exist
ALTER TABLE kyc ADD COLUMN IF NOT EXISTS selfie_url TEXT; 