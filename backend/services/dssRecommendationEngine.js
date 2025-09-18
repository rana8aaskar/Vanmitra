const db = require('../db');

class DSSRecommendationEngine {
  /**
   * Generate structured recommendations based on DSS scores from database
   * Follows the expert rules for scheme recommendations
   */
  static async generateRecommendations(claimId) {
    try {
      // Fetch DSS data from database
      const query = `
        SELECT
          claim_id,
          claimant_name,
          state,
          district,
          village,
          category,
          annual_income,
          jal_jeevan_mission_priority,
          dajgua_priority,
          mgnrega_priority,
          pm_kisan_priority,
          pmay_priority
        FROM dss_recommendations
        WHERE claim_id = $1
      `;

      const result = await db.query(query, [claimId]);

      if (result.rows.length === 0) {
        return {
          error: 'No DSS data found for this claim',
          claimId: claimId
        };
      }

      const dssData = result.rows[0];

      // Apply recommendation logic
      const recommendations = this.applyRecommendationRules(dssData);

      return {
        claimId: claimId,
        claimantName: dssData.claimant_name,
        location: {
          state: dssData.state,
          district: dssData.district,
          village: dssData.village
        },
        demographics: {
          category: dssData.category,
          annualIncome: dssData.annual_income
        },
        dssScores: {
          jalJeevanMission: parseFloat(dssData.jal_jeevan_mission_priority) || 0,
          dajgua: parseFloat(dssData.dajgua_priority) || 0,
          mgnrega: parseFloat(dssData.mgnrega_priority) || 0,
          pmKisan: parseFloat(dssData.pm_kisan_priority) || 0,
          pmay: parseFloat(dssData.pmay_priority) || 0
        },
        recommendations: recommendations.schemes,
        analysis: recommendations.analysis,
        summary: recommendations.summary
      };

    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Apply expert recommendation rules to DSS scores
   */
  static applyRecommendationRules(dssData) {
    const scores = {
      jalJeevanMission: parseFloat(dssData.jal_jeevan_mission_priority) || 0,
      dajgua: parseFloat(dssData.dajgua_priority) || 0,
      mgnrega: parseFloat(dssData.mgnrega_priority) || 0,
      pmKisan: parseFloat(dssData.pm_kisan_priority) || 0,
      pmay: parseFloat(dssData.pmay_priority) || 0
    };

    const schemes = [];
    const analysis = {};

    // Rule 1: PM-KISAN eligibility check
    if (scores.pmKisan === 1) {
      schemes.push({
        name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        type: 'eligible',
        priority: 1.0,
        status: 'recommended',
        reasoning: 'Beneficiary is eligible for PM-KISAN scheme as a farmer',
        description: 'Direct income support of ₹6,000 per year to small and marginal farmers',
        benefits: ['₹2,000 transferred in 3 installments', 'Direct benefit transfer to bank account']
      });

      analysis.pmKisan = {
        eligible: true,
        reasoning: 'Meets eligibility criteria as agricultural land holder'
      };
    } else {
      analysis.pmKisan = {
        eligible: false,
        reasoning: 'Not eligible - either not a farmer or does not meet land ownership criteria'
      };
    }

    // Rule 2: PMAY eligibility check
    if (scores.pmay === 1) {
      schemes.push({
        name: 'PM Awas Yojana (Pradhan Mantri Awas Yojana)',
        type: 'eligible',
        priority: 1.0,
        status: 'recommended',
        reasoning: 'Beneficiary is eligible for PMAY housing scheme',
        description: 'Housing assistance for rural poor and homeless families',
        benefits: ['Financial assistance for house construction', 'Technical support for construction']
      });

      analysis.pmay = {
        eligible: true,
        reasoning: 'Meets eligibility criteria for housing assistance'
      };
    } else {
      analysis.pmay = {
        eligible: false,
        reasoning: 'Not eligible - may already have pucca house or income exceeds limit'
      };
    }

    // Rule 3: Priority-based recommendations for other schemes
    const prioritySchemes = [
      {
        key: 'jalJeevanMission',
        name: 'Jal Jeevan Mission',
        score: scores.jalJeevanMission,
        description: 'Functional Household Tap Connection (FHTC) to every rural household',
        benefits: ['Piped water supply to household', 'Water quality monitoring', 'Community participation in water management']
      },
      {
        key: 'dajgua',
        name: 'DAJGUA (Development of Aspirational Blocks Program)',
        score: scores.dajgua,
        description: 'Integrated development program for backward blocks',
        benefits: ['Infrastructure development', 'Skill development programs', 'Health and education improvement']
      },
      {
        key: 'mgnrega',
        name: 'MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act)',
        score: scores.mgnrega,
        description: 'Employment guarantee scheme providing 100 days of wage employment',
        benefits: ['Guaranteed 100 days employment', 'Wage payment within 15 days', 'Asset creation in rural areas']
      }
    ];

    // Sort by priority score
    prioritySchemes.sort((a, b) => b.score - a.score);

    // Find highest score and close scores (within 0.05)
    const highestScore = prioritySchemes[0].score;
    const threshold = 0.05;

    prioritySchemes.forEach(scheme => {
      const scoreDiff = highestScore - scheme.score;

      if (scheme.score > 0.6) { // Minimum threshold for recommendation
        let status = 'recommended';
        let reasoning = '';

        if (scoreDiff <= threshold) {
          if (scheme.score === highestScore) {
            reasoning = `Highest priority scheme with score ${(scheme.score * 100).toFixed(1)}%`;
          } else {
            reasoning = `High priority scheme with score ${(scheme.score * 100).toFixed(1)}% (within ${threshold} of highest)`;
          }
        } else {
          status = 'considered';
          reasoning = `Moderate priority with score ${(scheme.score * 100).toFixed(1)}%`;
        }

        schemes.push({
          name: scheme.name,
          type: 'priority-based',
          priority: scheme.score,
          status: status,
          reasoning: reasoning,
          description: scheme.description,
          benefits: scheme.benefits
        });

        analysis[scheme.key] = {
          score: scheme.score,
          recommended: status === 'recommended',
          reasoning: reasoning
        };
      } else {
        analysis[scheme.key] = {
          score: scheme.score,
          recommended: false,
          reasoning: `Low priority score ${(scheme.score * 100).toFixed(1)}% - below recommendation threshold`
        };
      }
    });

    // Sort final recommendations by priority
    schemes.sort((a, b) => b.priority - a.priority);

    // Generate summary
    const recommendedSchemes = schemes.filter(s => s.status === 'recommended');
    const summary = {
      totalRecommended: recommendedSchemes.length,
      highestPriority: recommendedSchemes.length > 0 ? recommendedSchemes[0].name : 'None',
      eligibleSchemes: schemes.filter(s => s.type === 'eligible').length,
      prioritySchemes: schemes.filter(s => s.type === 'priority-based' && s.status === 'recommended').length,
      message: this.generateSummaryMessage(recommendedSchemes, dssData)
    };

    return {
      schemes,
      analysis,
      summary
    };
  }

  /**
   * Generate a summary message based on recommendations
   */
  static generateSummaryMessage(recommendedSchemes, dssData) {
    if (recommendedSchemes.length === 0) {
      return 'No schemes are currently recommended based on the DSS analysis. Consider reviewing eligibility criteria or improving priority factors.';
    }

    const eligibleCount = recommendedSchemes.filter(s => s.type === 'eligible').length;
    const priorityCount = recommendedSchemes.filter(s => s.type === 'priority-based').length;

    let message = `Based on DSS analysis, ${recommendedSchemes.length} scheme(s) are recommended for ${dssData.claimant_name}.`;

    if (eligibleCount > 0) {
      message += ` ${eligibleCount} scheme(s) based on direct eligibility.`;
    }

    if (priorityCount > 0) {
      message += ` ${priorityCount} scheme(s) based on high priority scores.`;
    }

    return message;
  }

  /**
   * Batch process recommendations for multiple claims
   */
  static async generateBatchRecommendations(claimIds) {
    const results = [];

    for (const claimId of claimIds) {
      try {
        const recommendation = await this.generateRecommendations(claimId);
        results.push(recommendation);
      } catch (error) {
        results.push({
          claimId: claimId,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get summary statistics for all recommendations
   */
  static async getRecommendationStatistics() {
    try {
      const query = `
        SELECT
          COUNT(*) as total_claims,
          AVG(jal_jeevan_mission_priority) as avg_jjm_priority,
          AVG(dajgua_priority) as avg_dajgua_priority,
          AVG(mgnrega_priority) as avg_mgnrega_priority,
          SUM(CASE WHEN pm_kisan_priority = 1 THEN 1 ELSE 0 END) as pm_kisan_eligible,
          SUM(CASE WHEN pmay_priority = 1 THEN 1 ELSE 0 END) as pmay_eligible,
          SUM(CASE WHEN jal_jeevan_mission_priority > 0.6 THEN 1 ELSE 0 END) as jjm_high_priority,
          SUM(CASE WHEN dajgua_priority > 0.6 THEN 1 ELSE 0 END) as dajgua_high_priority,
          SUM(CASE WHEN mgnrega_priority > 0.6 THEN 1 ELSE 0 END) as mgnrega_high_priority
        FROM dss_recommendations
      `;

      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting recommendation statistics:', error);
      throw error;
    }
  }
}

module.exports = DSSRecommendationEngine;