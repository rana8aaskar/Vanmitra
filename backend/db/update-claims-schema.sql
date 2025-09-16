-- Add new columns to claims table to match CSV data
ALTER TABLE claims
ADD COLUMN IF NOT EXISTS claimant_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS spouse_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS aadhaar_no VARCHAR(20),
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS gram_panchayat VARCHAR(255),
ADD COLUMN IF NOT EXISTS block_tehsil VARCHAR(255),
ADD COLUMN IF NOT EXISTS claim_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS land_use VARCHAR(100),
ADD COLUMN IF NOT EXISTS annual_income VARCHAR(50),
ADD COLUMN IF NOT EXISTS tax_payer VARCHAR(10),
ADD COLUMN IF NOT EXISTS boundary_description TEXT,
ADD COLUMN IF NOT EXISTS geo_coordinates VARCHAR(100),
ADD COLUMN IF NOT EXISTS verified_by_gram_sabha VARCHAR(10),
ADD COLUMN IF NOT EXISTS status_of_claim VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_of_submission DATE,
ADD COLUMN IF NOT EXISTS date_of_decision DATE,
ADD COLUMN IF NOT EXISTS patta_title_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS nearby_water_body VARCHAR(255),
ADD COLUMN IF NOT EXISTS irrigation_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS infrastructure_present VARCHAR(255),
ADD COLUMN IF NOT EXISTS claimant_signature VARCHAR(100),
ADD COLUMN IF NOT EXISTS gram_sabha_chairperson VARCHAR(255),
ADD COLUMN IF NOT EXISTS forest_dept_officer VARCHAR(255),
ADD COLUMN IF NOT EXISTS revenue_dept_officer VARCHAR(255);

-- Note: status column already exists in the original schema
-- We'll update it after importing the data

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_claims_claimant_name ON claims(claimant_name);
CREATE INDEX IF NOT EXISTS idx_claims_district ON claims(district);
CREATE INDEX IF NOT EXISTS idx_claims_state ON claims(state);
CREATE INDEX IF NOT EXISTS idx_claims_claim_type ON claims(claim_type);
CREATE INDEX IF NOT EXISTS idx_claims_status_of_claim ON claims(status_of_claim);
CREATE INDEX IF NOT EXISTS idx_claims_date_of_submission ON claims(date_of_submission);