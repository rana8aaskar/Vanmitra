const db = require('../db');

class FRAModel {
  // Create or update FRA document based on unique person identifiers
  static async createDocument(data) {
    // First, check if a claim already exists for this person
    const existingClaim = await this.findExistingClaim(data);

    if (existingClaim) {
      // Update existing claim
      console.log(`Found existing claim for person (ID: ${existingClaim.id}). Updating...`);
      return await this.updateExistingClaim(existingClaim.id, data);
    } else {
      // Create new claim
      console.log('No existing claim found. Creating new claim...');
      return await this.createNewClaim(data);
    }
  }

  // Find existing claim by aadhaar or name+village+district
  static async findExistingClaim(data) {
    let query;
    let values;

    // First try to find by aadhaar_no if provided
    if (data.aadhaar_no && data.aadhaar_no.trim() !== '') {
      query = 'SELECT * FROM claims WHERE aadhaar_no = $1 LIMIT 1';
      values = [data.aadhaar_no];
      const result = await db.query(query, values);
      if (result.rows[0]) {
        console.log(`Found existing claim by Aadhaar: ${data.aadhaar_no}`);
        return result.rows[0];
      }
    }

    // If not found by aadhaar, try by name+village+district combination
    if (data.claimant_name && data.village && data.district) {
      query = `
        SELECT * FROM claims
        WHERE LOWER(claimant_name) = LOWER($1)
          AND LOWER(village) = LOWER($2)
          AND LOWER(district) = LOWER($3)
          AND (aadhaar_no IS NULL OR aadhaar_no = '')
        LIMIT 1
      `;
      values = [data.claimant_name, data.village, data.district];
      const result = await db.query(query, values);
      if (result.rows[0]) {
        console.log(`Found existing claim by name+village+district: ${data.claimant_name}, ${data.village}, ${data.district}`);
        return result.rows[0];
      }
    }

    return null;
  }

  // Update existing claim with new data
  static async updateExistingClaim(claimId, data) {
    // Get current claim data for audit
    const currentClaim = await this.getDocumentById(claimId);

    // Build update query with only non-null/non-empty values
    const updateFields = [];
    const values = [];
    let paramCounter = 1;

    const fieldMapping = {
      spouse_name: data.spouse_name,
      age: data.age,
      gender: data.gender,
      patta_title_no: data.patta_title_no,
      aadhaar_no: data.aadhaar_no,
      category: data.category,
      gram_panchayat: data.gram_panchayat,
      tehsil: data.tehsil,
      claim_type: data.claim_type,
      land_claimed: data.land_claimed,
      land_use: data.land_use,
      annual_income: data.annual_income,
      tax_payer: data.tax_payer,
      boundary_description: data.boundary_description,
      geo_coordinates: data.geo_coordinates,
      status_of_claim: data.status_of_claim,
      water_body: data.water_body,
      irrigation_source: data.irrigation_source,
      infrastructure_present: data.infrastructure_present,
      document_path: data.document_path
    };

    // Track changed fields for audit
    const changedFields = [];
    for (const [field, value] of Object.entries(fieldMapping)) {
      if (value !== undefined && value !== null && value !== '') {
        if (currentClaim[field] !== value) {
          updateFields.push(`${field} = $${paramCounter}`);
          values.push(value);
          changedFields.push(field);
          paramCounter++;
        }
      }
    }

    // Always update these fields
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateFields.push(`last_update_source = 'FRA Upload'`);
    updateFields.push(`update_count = COALESCE(update_count, 0) + 1`);

    if (updateFields.length > 3) { // More than just the always-update fields
      values.push(claimId);
      const query = `
        UPDATE claims
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING *
      `;

      const result = await db.query(query, values);
      const updatedClaim = result.rows[0];

      // Create audit record
      if (changedFields.length > 0) {
        await this.createAuditRecord(claimId, currentClaim, updatedClaim, changedFields, data.user_id);
      }

      return { ...updatedClaim, operation: 'update', changed_fields: changedFields };
    } else {
      // No actual changes, return existing claim
      return { ...currentClaim, operation: 'no_change' };
    }
  }

  // Create new claim
  static async createNewClaim(data) {
    const fields = [];
    const values = [];
    const placeholders = [];
    let paramCounter = 1;

    const fieldMapping = {
      claimant_name: data.claimant_name || '',
      spouse_name: data.spouse_name || '',
      age: data.age || null,
      gender: data.gender || '',
      patta_title_no: data.patta_title_no || '',
      aadhaar_no: data.aadhaar_no || '',
      category: data.category || '',
      village: data.village || '',
      gram_panchayat: data.gram_panchayat || '',
      tehsil: data.tehsil || '',
      district: data.district || '',
      state: data.state || '',
      claim_type: data.claim_type || '',
      land_claimed: data.land_claimed || '',
      land_use: data.land_use || '',
      annual_income: data.annual_income || '',
      tax_payer: data.tax_payer || '',
      boundary_description: data.boundary_description || '',
      geo_coordinates: data.geo_coordinates || '',
      status_of_claim: data.status_of_claim || '',
      date_of_submission: data.date_of_submission || null,
      date_of_decision: data.date_of_decision || null,
      water_body: data.water_body || '',
      irrigation_source: data.irrigation_source || '',
      infrastructure_present: data.infrastructure_present || '',
      document_path: data.document_path || '',
      user_id: data.user_id || null,
      claim_status: data.claim_status || 'pending',
      update_count: 0,
      last_update_source: 'FRA Upload'
    };

    for (const [field, value] of Object.entries(fieldMapping)) {
      if (value !== undefined && value !== null && value !== '') {
        fields.push(field);
        values.push(value);
        placeholders.push(`$${paramCounter}`);
        paramCounter++;
      }
    }

    fields.push('submitted_at');
    placeholders.push('NOW()');

    const query = `
      INSERT INTO claims (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *`;

    const result = await db.query(query, values);
    return { ...result.rows[0], operation: 'insert' };
  }

  // Create audit record for tracking changes
  static async createAuditRecord(claimId, oldData, newData, changedFields, userId) {
    const query = `
      INSERT INTO claim_updates_audit
      (claim_id, old_data, new_data, changed_fields, update_source, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      claimId,
      JSON.stringify(oldData),
      JSON.stringify(newData),
      changedFields,
      'FRA Upload',
      userId || null
    ];

    try {
      await db.query(query, values);
      console.log(`Audit record created for claim ${claimId} with ${changedFields.length} changed fields`);
    } catch (error) {
      console.error('Error creating audit record:', error);
      // Don't fail the main operation if audit fails
    }
  }

  // Get all documents with filters
  static async getDocuments(filters = {}, limit = 50, offset = 0) {
    let query = 'SELECT * FROM claims WHERE 1=1';
    const values = [];
    let paramCounter = 1;

    if (filters.state) {
      query += ` AND state = $${paramCounter}`;
      values.push(filters.state);
      paramCounter++;
    }

    if (filters.district) {
      query += ` AND district = $${paramCounter}`;
      values.push(filters.district);
      paramCounter++;
    }

    if (filters.status) {
      query += ` AND status = $${paramCounter}`;
      values.push(filters.status);
      paramCounter++;
    }

    if (filters.user_id) {
      query += ` AND user_id = $${paramCounter}`;
      values.push(filters.user_id);
      paramCounter++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
  }

  // Get document by ID
  static async getDocumentById(id) {
    const query = 'SELECT * FROM claims WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Update document
  static async updateDocument(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    values.push(id);

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE claims SET ${setClause} WHERE id = $${values.length} RETURNING *`;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Delete document
  static async deleteDocument(id) {
    const query = 'DELETE FROM claims WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Get statistics
  static async getStatistics() {
    const query = `
      SELECT
        COUNT(*) as total_documents,
        COUNT(CASE WHEN LOWER(status_of_claim) = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN LOWER(status_of_claim) = 'pending' OR LOWER(status_of_claim) = 'under review' OR status_of_claim IS NULL THEN 1 END) as pending,
        COUNT(CASE WHEN LOWER(status_of_claim) = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN LOWER(status_of_claim) = 'approved' OR LOWER(status_of_claim) = 'rejected' THEN 1 END) as processed,
        COUNT(DISTINCT state) as states_covered,
        COUNT(DISTINCT district) as districts_covered
      FROM claims
    `;
    const result = await db.query(query);
    return result.rows[0];
  }

  // Create upload record
  static async createUpload(data) {
    const { file_path, original_filename, processed_data, uploaded_by, fra_document_id } = data;
    const query = `
      INSERT INTO documents (file_path, file_name, file_type, claim_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [file_path, original_filename, 'document', fra_document_id];
    const result = await db.query(query, values);
    return result.rows[0];
  }
}

module.exports = FRAModel;