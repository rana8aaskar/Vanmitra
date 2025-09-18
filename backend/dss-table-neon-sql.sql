-- =====================================================
-- DSS RECOMMENDATIONS TABLE FOR NEON DATABASE
-- =====================================================
-- Copy and paste this entire SQL script into your Neon Console SQL Editor
-- Go to: https://console.neon.tech → Your Project → SQL Editor

-- Step 1: Create the main table
CREATE TABLE IF NOT EXISTS dss_recommendations (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER UNIQUE NOT NULL,
    claimant_name VARCHAR(255),
    age NUMERIC,
    gender VARCHAR(20),
    state VARCHAR(255),
    district VARCHAR(255),
    block_tehsil VARCHAR(255),
    gram_panchayat VARCHAR(255),
    village VARCHAR(255),
    category VARCHAR(50),
    tax_payer VARCHAR(10),
    claim_type VARCHAR(50),
    status_of_claim VARCHAR(50),
    annual_income NUMERIC,
    jal_jeevan_mission_priority NUMERIC,
    dajgua_priority NUMERIC,
    mgnrega_priority NUMERIC,
    pm_kisan_priority NUMERIC,
    pmay_priority NUMERIC,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dss_claim_id ON dss_recommendations(claim_id);
CREATE INDEX IF NOT EXISTS idx_dss_state ON dss_recommendations(state);
CREATE INDEX IF NOT EXISTS idx_dss_district ON dss_recommendations(district);
CREATE INDEX IF NOT EXISTS idx_dss_village ON dss_recommendations(village);

-- Step 3: Create update trigger function
CREATE OR REPLACE FUNCTION update_dss_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Step 4: Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_dss_recommendations_updated_at ON dss_recommendations;

CREATE TRIGGER update_dss_recommendations_updated_at
    BEFORE UPDATE ON dss_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_dss_updated_at();

-- Step 5: Verify the table was created
SELECT
    'Table Created Successfully!' as message,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'dss_recommendations';

-- Step 6: Show table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dss_recommendations'
ORDER BY ordinal_position;