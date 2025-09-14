-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    claim_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',

    -- Personal Information
    name VARCHAR(255),
    father_husband_name VARCHAR(255),
    address TEXT,
    village VARCHAR(255),
    panchayat VARCHAR(255),
    tehsil VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),

    -- Claim Details
    area_of_land VARCHAR(100),
    khasra_number VARCHAR(255),
    date_of_possession DATE,
    nature_of_possession VARCHAR(255),

    -- Additional Information
    boundary_north VARCHAR(255),
    boundary_south VARCHAR(255),
    boundary_east VARCHAR(255),
    boundary_west VARCHAR(255),

    -- Document Information
    document_path VARCHAR(500),

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    processed_at TIMESTAMP
);

-- Create documents table for storing uploaded files
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create claim_history table for tracking status changes
CREATE TABLE IF NOT EXISTS claim_history (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(id) ON DELETE CASCADE,
    status VARCHAR(50),
    comments TEXT,
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_documents_claim_id ON documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_history_claim_id ON claim_history(claim_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();