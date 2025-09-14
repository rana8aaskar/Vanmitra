const db = require('../db');
const bcrypt = require('bcrypt');

class UserModel {
  // Create new user
  static async createUser(userData) {
    const { name, email, password, role = 'user' } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
    `;

    const values = [name, email, hashedPassword, role];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  // Update user
  static async updateUser(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    values.push(id);

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `
      UPDATE users
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING id, name, email, role, created_at
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Get all users (admin only)
  static async getAllUsers(limit = 50, offset = 0) {
    const query = `
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }
}

module.exports = UserModel;