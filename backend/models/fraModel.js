const db = require('../db');

class FRAModel {
  // Create new FRA document
  static async createDocument(data) {
    // Build the INSERT query dynamically based on available data
    const fields = [];
    const values = [];
    const placeholders = [];
    let paramCounter = 1;

    // Map to exact CSV field names
    const fieldMapping = {
      claimant_name: data.claimant_name || '',
      spouse_name: data.spouse_name || '',
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
      claim_status: data.claim_status || 'pending'
    };

    // Build query dynamically
    for (const [field, value] of Object.entries(fieldMapping)) {
      if (value !== undefined && value !== null && value !== '') {
        fields.push(field);
        values.push(value);
        placeholders.push(`$${paramCounter}`);
        paramCounter++;
      }
    }

    // Add submitted_at
    fields.push('submitted_at');
    placeholders.push('NOW()');

    const query = `
      INSERT INTO claims (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *`;

    console.log('Creating document with fields:', fields);
    console.log('Values:', values);

    const result = await db.query(query, values);
    return result.rows[0];
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
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
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