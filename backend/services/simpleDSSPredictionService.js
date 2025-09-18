const fs = require('fs').promises;
const path = require('path');
const db = require('../db');
const csv = require('csv-parse/sync');

class SimpleDSSPredictionService {
  static villageStats = null;
  static dssData = null;

  /**
   * Load village statistics from CSV file
   */
  static async loadVillageStats() {
    if (this.villageStats) return this.villageStats;

    try {
      const csvPath = path.join(__dirname, '..', '..', 'DSS', 'dss_village_stats.csv');
      const csvContent = await fs.readFile(csvPath, 'utf8');

      const records = csv.parse(csvContent, {
        columns: true,
        skip_empty_lines: true
      });

      // Convert to lookup map by village name
      this.villageStats = {};
      records.forEach(record => {
        const village = record.Village?.toLowerCase();
        if (village) {
          this.villageStats[village] = {
            state: record.State,
            district: record.District,
            avg_distance_meters: parseFloat(record.avg_distance_meters) || 0,
            claimant_count: parseInt(record.claimant_count) || 0,
            percent_agri: parseFloat(record.percent_agri) || 0,
            avg_annual_income: parseFloat(record.avg_annual_income) || 0,
            percent_insecure_tenure: parseFloat(record.percent_insecure_tenure) || 0
          };
        }
      });

      console.log(`📊 Loaded village stats for ${Object.keys(this.villageStats).length} villages`);
      return this.villageStats;
    } catch (error) {
      console.error('Error loading village stats:', error);
      return {};
    }
  }

  /**
   * Load DSS master data from CSV
   */
  static async loadDSSData() {
    if (this.dssData) return this.dssData;

    try {
      const csvPath = path.join(__dirname, '..', '..', 'DSS', 'dss_definitive_master_db_new.csv');
      const csvContent = await fs.readFile(csvPath, 'utf8');

      const records = csv.parse(csvContent, {
        columns: true,
        skip_empty_lines: true
      });

      // Group by village to get average priorities
      this.dssData = {};
      const villageGroups = {};

      records.forEach(record => {
        const village = record.Village?.toLowerCase();
        if (!village) return;

        if (!villageGroups[village]) {
          villageGroups[village] = {
            priorities: [],
            count: 0
          };
        }

        villageGroups[village].priorities.push({
          jal_jeevan: parseFloat(record['Jal_Jeevan_Mission_Priority']) || 0,
          dajgua: parseFloat(record['DAJGUA_Priority']) || 0,
          mgnrega: parseFloat(record['MGNREGA_Priority']) || 0,
          pm_kisan: parseFloat(record['PM_KISAN_Priority']) || 0,
          pmay: parseFloat(record['PMAY_Priority']) || 0
        });
        villageGroups[village].count++;
      });

      // Calculate average priorities for each village
      Object.keys(villageGroups).forEach(village => {
        const group = villageGroups[village];
        const avgPriorities = {
          jal_jeevan_mission: 0,
          dajgua: 0,
          mgnrega: 0,
          pm_kisan: 0,
          pmay: 0
        };

        group.priorities.forEach(p => {
          avgPriorities.jal_jeevan_mission += p.jal_jeevan;
          avgPriorities.dajgua += p.dajgua;
          avgPriorities.mgnrega += p.mgnrega;
          avgPriorities.pm_kisan += p.pm_kisan;
          avgPriorities.pmay += p.pmay;
        });

        // Calculate averages
        const count = group.count;
        this.dssData[village] = {
          jal_jeevan_mission: avgPriorities.jal_jeevan_mission / count,
          dajgua: avgPriorities.dajgua / count,
          mgnrega: avgPriorities.mgnrega / count,
          pm_kisan: avgPriorities.pm_kisan / count,
          pmay: avgPriorities.pmay / count
        };
      });

      console.log(`📊 Loaded DSS data for ${Object.keys(this.dssData).length} villages`);
      return this.dssData;
    } catch (error) {
      console.error('Error loading DSS data:', error);
      return {};
    }
  }

  /**
   * Get predictions for a specific claim
   */
  static async getPredictionsForClaim(claimId) {
    try {
      console.log(`🔮 Getting simplified DSS predictions for claim ID: ${claimId}`);

      // Load data if not already loaded
      const [villageStats, dssData] = await Promise.all([
        this.loadVillageStats(),
        this.loadDSSData()
      ]);

      // Get claim details
      const claimResult = await db.query('SELECT * FROM claims WHERE id = $1', [claimId]);
      if (!claimResult.rows.length) {
        console.log(`Claim ${claimId} not found`);
        return null;
      }

      const claim = claimResult.rows[0];
      const villageLower = claim.village?.toLowerCase();

      // Get village stats and predictions
      const stats = villageStats[villageLower] || null;
      const priorities = dssData[villageLower] || this.getDefaultPriorities(claim);

      // Create recommendations
      const recommendations = this.createRecommendations(priorities, claim);

      return {
        claimId: claimId,
        claimantName: claim.claimant_name,
        village: claim.village,
        location: {
          state: claim.state,
          district: claim.district,
          village: claim.village
        },
        demographics: {
          category: claim.category,
          annual_income: claim.annual_income,
          land_use: claim.land_use,
          age: claim.age,
          gender: claim.gender
        },
        recommendedSchemes: recommendations.schemes,
        priorities: priorities,
        villageStatistics: stats,
        overallScore: recommendations.overallScore,
        totalSchemes: recommendations.schemes.length,
        topPriority: recommendations.schemes[0]?.name || 'No high-priority schemes',
        status: stats ? 'success' : 'default',
        message: stats ? 'Based on village data' : 'Using default predictions',
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error in getPredictionsForClaim:', error);
      return null;
    }
  }

  /**
   * Get default priorities if village not in data
   */
  static getDefaultPriorities(claim) {
    // Create reasonable defaults based on claim attributes
    const priorities = {
      jal_jeevan_mission: 0.5,
      dajgua: 0.5,
      mgnrega: 0.5,
      pm_kisan: 0.3,
      pmay: 0.3
    };

    // Adjust based on claim details
    if (claim.category === 'ST') {
      priorities.dajgua += 0.2;
      priorities.pmay += 0.2;
    }

    if (claim.land_use === 'Agriculture') {
      priorities.pm_kisan += 0.3;
      priorities.mgnrega += 0.1;
    }

    if (claim.annual_income && claim.annual_income < 100000) {
      priorities.mgnrega += 0.2;
      priorities.pmay += 0.1;
    }

    // Normalize to 0-1 range
    Object.keys(priorities).forEach(key => {
      priorities[key] = Math.min(1, priorities[key]);
    });

    return priorities;
  }

  /**
   * Create scheme recommendations from priorities
   */
  static createRecommendations(priorities, claim) {
    const schemes = [
      {
        id: 'jal_jeevan_mission',
        name: 'Jal Jeevan Mission',
        description: 'Provides functional tap water connection to every rural household',
        priority: priorities.jal_jeevan_mission,
        type: 'Water & Sanitation',
        benefits: ['Clean drinking water', 'Reduced water-borne diseases', 'Time savings'],
        icon: 'water'
      },
      {
        id: 'dajgua',
        name: 'DAJGUA (Land Rights)',
        description: 'Secures land tenure and ownership rights for forest dwellers',
        priority: priorities.dajgua,
        type: 'Land Rights',
        benefits: ['Legal land ownership', 'Access to credit', 'Protection from eviction'],
        icon: 'shield'
      },
      {
        id: 'mgnrega',
        name: 'MGNREGA',
        description: 'Guarantees 100 days of employment per year for rural households',
        priority: priorities.mgnrega,
        type: 'Employment',
        benefits: ['Guaranteed wages', 'Local employment', 'Asset creation'],
        icon: 'briefcase'
      },
      {
        id: 'pm_kisan',
        name: 'PM-KISAN',
        description: 'Direct income support of ₹6,000 per year to farmer families',
        priority: priorities.pm_kisan,
        type: 'Agriculture',
        benefits: ['Direct cash transfer', 'Support for farming inputs', 'Financial stability'],
        icon: 'sprout',
        eligible: claim.land_use === 'Agriculture' && claim.tax_payer !== 'Yes'
      },
      {
        id: 'pmay',
        name: 'PM Awas Yojana',
        description: 'Provides assistance for construction of pucca houses',
        priority: priorities.pmay,
        type: 'Housing',
        benefits: ['Housing assistance', 'Improved living conditions', 'Asset creation'],
        icon: 'home',
        eligible: claim.category === 'ST' && (!claim.annual_income || claim.annual_income < 250000)
      }
    ];

    // Filter and sort schemes
    const recommendedSchemes = schemes
      .filter(scheme => scheme.priority > 0.3 && scheme.eligible !== false)
      .sort((a, b) => b.priority - a.priority);

    // Calculate overall score
    const overallScore = recommendedSchemes.length > 0
      ? recommendedSchemes.reduce((sum, s) => sum + s.priority, 0) / recommendedSchemes.length
      : 0;

    return {
      schemes: recommendedSchemes,
      overallScore
    };
  }
}

module.exports = SimpleDSSPredictionService;