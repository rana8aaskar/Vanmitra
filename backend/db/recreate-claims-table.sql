-- Drop existing claims table and recreate with CSV column names
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS claim_history CASCADE;
DROP TABLE IF EXISTS claims CASCADE;

-- Create claims table with exact CSV column names
CREATE TABLE claims (
    id SERIAL PRIMARY KEY,

    -- CSV field names (exactly matching)
    claimant_name VARCHAR(255),
    spouse_name VARCHAR(255),
    patta_title_no VARCHAR(100),
    aadhaar_no VARCHAR(20),
    category VARCHAR(50),
    village VARCHAR(255),
    gram_panchayat VARCHAR(255),
    tehsil VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    claim_type VARCHAR(50),
    land_claimed VARCHAR(100),
    land_use VARCHAR(255),
    annual_income VARCHAR(50),
    tax_payer VARCHAR(10),
    boundary_description TEXT,
    geo_coordinates VARCHAR(255),
    status_of_claim VARCHAR(50),
    date_of_submission DATE,
    date_of_decision DATE,
    water_body VARCHAR(255),
    irrigation_source VARCHAR(255),
    infrastructure_present VARCHAR(255),

    -- System fields
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    document_path TEXT,
    claim_status VARCHAR(50) DEFAULT 'pending', -- For system tracking

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_claims_district ON claims(district);
CREATE INDEX idx_claims_state ON claims(state);
CREATE INDEX idx_claims_user_id ON claims(user_id);
CREATE INDEX idx_claims_claim_status ON claims(claim_status);
CREATE INDEX idx_claims_status_of_claim ON claims(status_of_claim);

-- Create documents table for file uploads
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create claim history table for tracking changes
CREATE TABLE IF NOT EXISTS claim_history (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(id) ON DELETE CASCADE,
    changed_by INTEGER REFERENCES users(id),
    change_type VARCHAR(50),
    old_values JSONB,
    new_values JSONB,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_claims_updated_at
    BEFORE UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();