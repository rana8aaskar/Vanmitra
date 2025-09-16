const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get claim details by coordinates or claimant name
router.get('/claim-details', async (req, res) => {
  try {
    const { lat, lng, claimantName } = req.query;

    let query;
    let values;

    if (claimantName) {
      // Search by claimant name
      query = `
        SELECT
          id,
          claimant_name,
          spouse_name,
          age,
          gender,
          aadhaar_no,
          category,
          village,
          gram_panchayat,
          tehsil,
          district,
          state,
          claim_type,
          land_claimed,
          land_use,
          annual_income,
          tax_payer,
          boundary_description,
          geo_coordinates,
          verified_by_gram_sabha,
          status_of_claim,
          claim_status,
          date_of_submission,
          date_of_decision,
          patta_title_no,
          water_body,
          irrigation_source,
          infrastructure_present,
          claimant_signature,
          gram_sabha_chairperson,
          forest_dept_officer,
          revenue_dept_officer,
          created_at,
          updated_at
        FROM claims
        WHERE LOWER(claimant_name) = LOWER($1)
        LIMIT 1
      `;
      values = [claimantName];
    } else if (lat && lng) {
      // Search by coordinates (with some tolerance for floating point differences)
      query = `
        SELECT
          id,
          claimant_name,
          spouse_name,
          age,
          gender,
          aadhaar_no,
          category,
          village,
          gram_panchayat,
          tehsil,
          district,
          state,
          claim_type,
          land_claimed,
          land_use,
          annual_income,
          tax_payer,
          boundary_description,
          geo_coordinates,
          verified_by_gram_sabha,
          status_of_claim,
          claim_status,
          date_of_submission,
          date_of_decision,
          patta_title_no,
          water_body,
          irrigation_source,
          infrastructure_present,
          claimant_signature,
          gram_sabha_chairperson,
          forest_dept_officer,
          revenue_dept_officer,
          created_at,
          updated_at
        FROM claims
        WHERE geo_coordinates LIKE '%' || $1 || '%'
           OR geo_coordinates LIKE '%' || $2 || '%'
        LIMIT 1
      `;

      // Format coordinates to match the database format
      const latStr = parseFloat(lat).toFixed(4);
      const lngStr = parseFloat(lng).toFixed(4);
      values = [latStr, lngStr];
    } else {
      return res.status(400).json({ error: 'Please provide either coordinates or claimant name' });
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const claim = result.rows[0];

    // Parse geo_coordinates if it exists
    if (claim.geo_coordinates) {
      const coords = claim.geo_coordinates.split(',').map(c => c.trim());
      if (coords.length === 2) {
        claim.lat = parseFloat(coords[0]);
        claim.lng = parseFloat(coords[1]);
      }
    }

    // Determine asset type based on land use or other factors
    const landUse = (claim.land_use || '').toLowerCase();
    if (landUse.includes('water') || landUse.includes('aqua')) {
      claim.asset_type = 'water';
    } else if (landUse.includes('forest') || landUse.includes('tree')) {
      claim.asset_type = 'forest';
    } else if (landUse.includes('agri') || landUse.includes('farm') || landUse.includes('crop')) {
      claim.asset_type = 'agriculture';
    } else if (landUse.includes('home') || landUse.includes('build') || landUse.includes('house')) {
      claim.asset_type = 'builtup';
    } else if (landUse.includes('mixed')) {
      claim.asset_type = 'mixed';
    } else {
      claim.asset_type = 'other';
    }

    res.json({ success: true, data: claim });

  } catch (error) {
    console.error('Error fetching claim details:', error);
    res.status(500).json({ error: 'Failed to fetch claim details' });
  }
});

// Get all claims for map display
router.get('/all-claims', async (req, res) => {
  try {
    const { state, district, status } = req.query;

    let query = `
      SELECT
        id,
        claimant_name,
        state,
        district,
        geo_coordinates,
        claim_type,
        status_of_claim,
        land_use
      FROM claims
      WHERE geo_coordinates IS NOT NULL
    `;

    const conditions = [];
    const values = [];

    if (state) {
      conditions.push(`state = $${values.length + 1}`);
      values.push(state);
    }

    if (district) {
      conditions.push(`district = $${values.length + 1}`);
      values.push(district);
    }

    if (status) {
      conditions.push(`LOWER(status_of_claim) = LOWER($${values.length + 1})`);
      values.push(status);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' LIMIT 500'; // Limit to prevent overwhelming the map

    const result = await pool.query(query, values);

    // Transform data for map display
    const claims = result.rows.map(claim => {
      const coords = claim.geo_coordinates ? claim.geo_coordinates.split(',').map(c => c.trim()) : null;
      return {
        id: claim.id,
        claimant_name: claim.claimant_name,
        lat: coords ? parseFloat(coords[0]) : null,
        lng: coords ? parseFloat(coords[1]) : null,
        state: claim.state,
        district: claim.district,
        claim_type: claim.claim_type,
        status: claim.status_of_claim,
        land_use: claim.land_use
      };
    }).filter(claim => claim.lat && claim.lng); // Only return claims with valid coordinates

    res.json({ success: true, data: claims });

  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// Get claim statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_claims,
        SUM(CASE WHEN LOWER(status_of_claim) = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN LOWER(status_of_claim) = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN LOWER(status_of_claim) = 'rejected' THEN 1 ELSE 0 END) as rejected,
        COUNT(DISTINCT state) as states_covered,
        COUNT(DISTINCT district) as districts_covered
      FROM claims
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;