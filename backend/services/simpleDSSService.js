const db = require('../db');

class SimpleDSSService {
  /**
   * Generate basic DSS recommendations for a claim without running Python script
   */
  static async generateRecommendationsForClaim(claimId) {
    try {
      // Get claim data
      const claimQuery = `
        SELECT
          id,
          claimant_name,
          age,
          gender,
          state,
          district,
          village,
          category,
          annual_income,
          claim_type,
          status_of_claim,
          land_use
        FROM claims
        WHERE id = $1
      `;

      const claimResult = await db.query(claimQuery, [claimId]);

      if (claimResult.rows.length === 0) {
        return null;
      }

      const claim = claimResult.rows[0];

      // Calculate priority scores based on simple rules
      const priorities = this.calculatePriorities(claim);

      // Determine recommended schemes (≥70% priority)
      const schemes = this.getRecommendedSchemes(priorities, claim);

      // Insert into dss_recommendations table
      const insertQuery = `
        INSERT INTO dss_recommendations (
          claim_id,
          claimant_name,
          age,
          gender,
          state,
          district,
          village,
          category,
          annual_income,
          claim_type,
          status_of_claim,
          jal_jeevan_mission_priority,
          dajgua_priority,
          mgnrega_priority,
          pm_kisan_priority,
          pmay_priority
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (claim_id) DO UPDATE SET
          claimant_name = EXCLUDED.claimant_name,
          age = EXCLUDED.age,
          gender = EXCLUDED.gender,
          state = EXCLUDED.state,
          district = EXCLUDED.district,
          village = EXCLUDED.village,
          category = EXCLUDED.category,
          annual_income = EXCLUDED.annual_income,
          claim_type = EXCLUDED.claim_type,
          status_of_claim = EXCLUDED.status_of_claim,
          jal_jeevan_mission_priority = EXCLUDED.jal_jeevan_mission_priority,
          dajgua_priority = EXCLUDED.dajgua_priority,
          mgnrega_priority = EXCLUDED.mgnrega_priority,
          pm_kisan_priority = EXCLUDED.pm_kisan_priority,
          pmay_priority = EXCLUDED.pmay_priority,
          updated_at = CURRENT_TIMESTAMP
      `;

      await db.query(insertQuery, [
        claim.id,
        claim.claimant_name,
        claim.age,
        claim.gender,
        claim.state,
        claim.district,
        claim.village,
        claim.category,
        claim.annual_income,
        claim.claim_type,
        claim.status_of_claim,
        priorities.jalJeevanMission,
        priorities.dajgua,
        priorities.mgnrega,
        priorities.pmKisan,
        priorities.pmay
      ]);

      return {
        claimId: claim.id,
        claimantName: claim.claimant_name,
        location: {
          state: claim.state,
          district: claim.district,
          village: claim.village
        },
        demographics: {
          age: claim.age,
          gender: claim.gender,
          category: claim.category,
          annualIncome: claim.annual_income
        },
        priorities: priorities,
        recommendedSchemes: schemes
      };

    } catch (error) {
      console.error('Error generating DSS recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate priority scores based on claim data
   */
  static calculatePriorities(claim) {
    const priorities = {
      jalJeevanMission: 0,
      dajgua: 0,
      mgnrega: 0,
      pmKisan: 0,
      pmay: 0
    };

    // Income-based calculations
    const income = parseFloat(claim.annual_income) || 0;
    const incomeScore = Math.max(0, Math.min(1, (300000 - income) / 300000)); // Higher priority for lower income

    // Category-based calculations
    const categoryBonus = (claim.category === 'ST' || claim.category === 'SC') ? 0.3 : 0.1;

    // State-based priority (tribal states get higher priority)
    const tribalStates = ['Tripura', 'Jharkhand', 'Chhattisgarh', 'Odisha', 'Telangana'];
    const stateBonus = tribalStates.includes(claim.state) ? 0.2 : 0;

    // Jal Jeevan Mission Priority
    priorities.jalJeevanMission = Math.min(1, 0.4 + incomeScore * 0.3 + categoryBonus + stateBonus);

    // DAJGUA Priority (income and category focused)
    priorities.dajgua = Math.min(1, 0.3 + incomeScore * 0.4 + categoryBonus * 1.5);

    // MGNREGA Priority (employment scheme)
    const employmentNeed = (claim.land_use !== 'Agriculture') ? 0.3 : 0.1;
    priorities.mgnrega = Math.min(1, 0.2 + incomeScore * 0.3 + employmentNeed + categoryBonus);

    // PM-KISAN Priority (farmers only)
    if (claim.land_use === 'Agriculture') {
      priorities.pmKisan = Math.min(1, 0.5 + incomeScore * 0.3 + categoryBonus);
    }

    // PM Awas Yojana Priority (housing scheme)
    if (claim.category === 'ST' || claim.category === 'SC') {
      priorities.pmay = Math.min(1, 0.6 + incomeScore * 0.4);
    } else {
      priorities.pmay = Math.min(1, 0.3 + incomeScore * 0.3);
    }

    return priorities;
  }

  /**
   * Get recommended schemes based on priorities
   */
  static getRecommendedSchemes(priorities, claim) {
    const schemes = [];

    const schemeDefinitions = {
      jalJeevanMission: {
        name: 'Jal Jeevan Mission',
        description: 'Water supply infrastructure for rural households',
        eligibility: 'High priority for rural tribal areas with water access needs'
      },
      dajgua: {
        name: 'DAJGUA (Development of Aspirational Blocks)',
        description: 'Integrated development program for backward blocks',
        eligibility: 'High priority based on income and social category'
      },
      mgnrega: {
        name: 'MGNREGA',
        description: 'Rural employment guarantee scheme',
        eligibility: 'High priority for employment generation in rural areas'
      },
      pmKisan: {
        name: 'PM-KISAN',
        description: 'Direct income support to farmers',
        eligibility: 'Eligible for agricultural land holders'
      },
      pmay: {
        name: 'PM Awas Yojana',
        description: 'Housing scheme for rural poor',
        eligibility: 'High priority for ST/SC categories with low income'
      }
    };

    // Add schemes with priority ≥ 0.7 (70%)
    Object.entries(priorities).forEach(([key, priority]) => {
      if (priority >= 0.7) {
        schemes.push({
          name: schemeDefinitions[key].name,
          priority: priority,
          description: schemeDefinitions[key].description,
          eligibility: schemeDefinitions[key].eligibility
        });
      }
    });

    // Sort by priority (highest first)
    schemes.sort((a, b) => b.priority - a.priority);

    return schemes;
  }
}

module.exports = SimpleDSSService;