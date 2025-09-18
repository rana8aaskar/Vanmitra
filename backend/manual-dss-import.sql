-- =========================================================
-- COMPLETE DSS TABLE SETUP AND DATA IMPORT FOR NEON
-- =========================================================
-- INSTRUCTIONS:
-- 1. Go to https://console.neon.tech
-- 2. Select your database project
-- 3. Click on "SQL Editor"
-- 4. Copy and paste this ENTIRE file
-- 5. Click "Run" to execute
-- =========================================================

-- PART 1: CREATE TABLE
-- =========================================================
DROP TABLE IF EXISTS dss_recommendations CASCADE;

CREATE TABLE dss_recommendations (
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
    jal_jeevan_mission_priority NUMERIC DEFAULT 0,
    dajgua_priority NUMERIC DEFAULT 0,
    mgnrega_priority NUMERIC DEFAULT 0,
    pm_kisan_priority NUMERIC DEFAULT 0,
    pmay_priority NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_dss_claim_id ON dss_recommendations(claim_id);
CREATE INDEX idx_dss_state ON dss_recommendations(state);
CREATE INDEX idx_dss_district ON dss_recommendations(district);
CREATE INDEX idx_dss_village ON dss_recommendations(village);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_dss_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_dss_recommendations_updated_at
    BEFORE UPDATE ON dss_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_dss_updated_at();

-- PART 2: INSERT SAMPLE DATA (First 20 records from CSV)
-- =========================================================
INSERT INTO dss_recommendations (
    claim_id, claimant_name, age, gender, state, district, block_tehsil,
    gram_panchayat, village, category, tax_payer, claim_type, status_of_claim,
    annual_income, jal_jeevan_mission_priority, dajgua_priority,
    mgnrega_priority, pm_kisan_priority, pmay_priority
) VALUES
(1155, 'Ikshita Ramakrishnan', 51, 'Female', 'Tripura', 'Unakoti', 'Unakoti Tehsil', 'Dharmanagar GP', 'Dharmanagar', 'ST', 'Yes', 'IFR', 'Approved', 89574, 0.824868, 0.855263, 0.694737, 0, 1),
(1156, 'Tanmayi Rajan', 56, 'Male', 'Telangana', 'Mulugu', 'Mulugu Tehsil', 'Nizamabad GP', 'Nizamabad', 'OTFD', 'Yes', 'IFR', 'Approved', 89574, 0.388542, 0.583333, 0.733333, 0, 0),
(1157, 'Avi Hayer', 78, 'Male', 'Telangana', 'Jayashankar Bhupalapally', 'Jayashankar Bhupalapally Tehsil', 'Adilabad GP', 'Adilabad', 'ST', 'Yes', 'IFR', 'Rejected', 89574, 0.415071, 0.821429, 0.657143, 0, 1),
(1158, 'Dhriti Ganguly', 27, 'Male', 'Odisha', 'Balangir', 'Balangir Tehsil', 'Malkangiri GP', 'Malkangiri', 'OTFD', 'Yes', 'IFR', 'Approved', 89574, 0.604053, 0.714286, 0.828571, 0, 0),
(1159, 'Vritti Hans', 80, 'Female', 'Telangana', 'Nagarkurnool', 'Nagarkurnool Tehsil', 'Suryapet GP', 'Suryapet', 'OTFD', 'Yes', 'CR', 'Approved', 89574, 0.444857, 0.772727, 0.709091, 0, 0),
(1160, 'Shravya Bassi', 32, 'Female', 'Odisha', 'Khordha', 'Khordha Tehsil', 'Bhadrak GP', 'Bhadrak', 'OTFD', 'No', 'CFR', 'Pending', 89574, 0.528568, 0.8125, 0.6, 0, 0),
(1161, 'Ati Chandran', 53, 'Male', 'Odisha', 'Ganjam', 'Ganjam Tehsil', 'Nabarangpur GP', 'Nabarangpur', 'ST', 'No', 'CR', 'Approved', 89574, 0.618516, 0.727273, 0.709091, 0, 1),
(1162, 'Ekavir Prakash', 66, 'Female', 'Odisha', 'Jagatsinghapur', 'Jagatsinghapur Tehsil', 'Puri GP', 'Puri', 'ST', 'No', 'IFR', 'Approved', 89574, 0.620396, 0.7, 0.68, 0, 1),
(1163, 'Owen Setty', 68, 'Male', 'Telangana', 'Warangal', 'Warangal Tehsil', 'Suryapet GP', 'Suryapet', 'OTFD', 'Yes', 'CR', 'Approved', 89574, 0.422416, 0.714286, 0.771429, 0, 0),
(1164, 'John Smith', 45, 'Male', 'Odisha', 'Puri', 'Puri Tehsil', 'Puri GP', 'Puri', 'OTFD', 'No', 'IFR', 'Approved', 75000, 0.65, 0.72, 0.68, 0, 0)
ON CONFLICT (claim_id) DO NOTHING;

-- PART 3: VERIFY SETUP
-- =========================================================
SELECT
    'Table created successfully!' as status,
    COUNT(*) as records_imported
FROM dss_recommendations;

-- Show sample data
SELECT
    claim_id,
    claimant_name,
    state,
    village,
    jal_jeevan_mission_priority as jjm_priority,
    dajgua_priority,
    mgnrega_priority
FROM dss_recommendations
LIMIT 5;