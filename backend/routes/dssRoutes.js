const express = require('express');
const router = express.Router();
const dssSyncService = require('../dss-sync-service');
const DSSEngineService = require('../services/dssEngineService');
const DSSRecommendationEngine = require('../services/dssRecommendationEngine');
const DSSMLPredictionService = require('../services/dssMLPredictionService');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get DSS recommendations for a specific claim or all claims
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const filters = {
      claim_id: req.query.claim_id,
      state: req.query.state,
      district: req.query.district,
      village: req.query.village
    };

    const recommendations = await dssSyncService.getRecommendations(filters);

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Get DSS statistics
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    // Get all recommendations and calculate statistics
    const allRecommendations = await dssSyncService.getRecommendations();

    const statistics = {
      total_claims: allRecommendations.length,
      by_state: {},
      by_scheme: {
        jal_jeevan_mission: 0,
        dajgua: 0,
        mgnrega: 0,
        pm_kisan: 0,
        pmay: 0
      },
      high_priority_claims: 0
    };

    // Calculate statistics
    allRecommendations.forEach(record => {
      // State statistics
      if (!statistics.by_state[record.state]) {
        statistics.by_state[record.state] = 0;
      }
      statistics.by_state[record.state]++;

      // Scheme eligibility
      if (record.jal_jeevan_mission_priority > 0.5) statistics.by_scheme.jal_jeevan_mission++;
      if (record.dajgua_priority > 0.5) statistics.by_scheme.dajgua++;
      if (record.mgnrega_priority > 0.5) statistics.by_scheme.mgnrega++;
      if (record.pm_kisan_priority > 0.5) statistics.by_scheme.pm_kisan++;
      if (record.pmay_priority > 0.5) statistics.by_scheme.pmay++;

      // High priority claims
      const maxPriority = Math.max(
        record.jal_jeevan_mission_priority,
        record.dajgua_priority,
        record.mgnrega_priority,
        record.pm_kisan_priority,
        record.pmay_priority
      );
      if (maxPriority > 0.7) statistics.high_priority_claims++;
    });

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

// Trigger DSS engine update (admin only)
router.post('/update', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can trigger DSS updates'
      });
    }

    // Send immediate response that process has started
    res.json({
      success: true,
      message: 'DSS pipeline started in background'
    });

    // Run full DSS pipeline in background
    DSSEngineService.runFullPipeline()
      .then(result => {
        console.log('DSS pipeline completed:', result);
      })
      .catch(error => {
        console.error('DSS pipeline failed:', error);
      });
  } catch (error) {
    console.error('Error triggering DSS update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger DSS update',
      error: error.message
    });
  }
});

// Get recommendation for a specific uploaded document
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { claim_id, state, district, village } = req.body;

    if (!claim_id) {
      return res.status(400).json({
        success: false,
        message: 'Claim ID is required'
      });
    }

    // Get recommendations for this specific claim
    const recommendations = await dssSyncService.getRecommendations({
      claim_id: claim_id
    });

    if (recommendations.length === 0) {
      // If no existing data, trigger DSS update
      console.log('No existing DSS data for claim, triggering update...');

      try {
        await dssSyncService.syncDSSData();

        // Try again after update
        const updatedRecommendations = await dssSyncService.getRecommendations({
          claim_id: claim_id
        });

        res.json({
          success: true,
          data: updatedRecommendations[0] || null,
          message: updatedRecommendations.length > 0 ?
            'Recommendations generated' :
            'No recommendations available for this claim'
        });
      } catch (engineError) {
        console.error('DSS engine error:', engineError);
        res.json({
          success: true,
          data: null,
          message: 'Unable to generate recommendations at this time'
        });
      }
    } else {
      res.json({
        success: true,
        data: recommendations[0],
        message: 'Recommendations retrieved'
      });
    }
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze document',
      error: error.message
    });
  }
});

// Get detailed recommendations for a specific claim with scheme priorities
router.get('/recommendations/:claimId', authMiddleware, async (req, res) => {
  try {
    const { claimId } = req.params;

    const recommendations = await DSSEngineService.getRecommendationsForClaim(claimId);

    if (!recommendations) {
      return res.status(404).json({
        success: false,
        message: 'No recommendations found for this claim'
      });
    }

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting claim recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Get top priority villages for a specific scheme
router.get('/priority-villages/:scheme', authMiddleware, async (req, res) => {
  try {
    const { scheme } = req.params;
    const { limit = 10 } = req.query;

    const villages = await DSSEngineService.getTopPriorityVillages(scheme, parseInt(limit));

    res.json({
      success: true,
      scheme: scheme,
      data: villages
    });
  } catch (error) {
    console.error('Error getting priority villages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get priority villages',
      error: error.message
    });
  }
});

// Generate DSS recommendations for a specific claim (fallback)
router.post('/generate/:claimId', authMiddleware, async (req, res) => {
  try {
    const { claimId } = req.params;
    const SimpleDSSService = require('../services/simpleDSSService');

    console.log(`Generating DSS recommendations for claim ${claimId}`);
    const recommendations = await SimpleDSSService.generateRecommendationsForClaim(parseInt(claimId));

    if (recommendations) {
      res.json({
        success: true,
        message: 'DSS recommendations generated successfully',
        data: recommendations
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Claim not found or unable to generate recommendations'
      });
    }
  } catch (error) {
    console.error('Error generating DSS recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate DSS recommendations',
      error: error.message
    });
  }
});

// Expert recommendation analysis for a specific claim
router.get('/expert-analysis/:claimId', authMiddleware, async (req, res) => {
  try {
    const { claimId } = req.params;

    console.log(`Generating expert DSS analysis for claim ${claimId}`);
    const analysis = await DSSRecommendationEngine.generateRecommendations(parseInt(claimId));

    if (analysis.error) {
      return res.status(404).json({
        success: false,
        message: analysis.error,
        claimId: claimId
      });
    }

    res.json({
      success: true,
      message: 'Expert DSS analysis completed',
      data: analysis
    });
  } catch (error) {
    console.error('Error generating expert analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate expert analysis',
      error: error.message
    });
  }
});

// Batch expert analysis for multiple claims
router.post('/expert-analysis-batch', authMiddleware, async (req, res) => {
  try {
    const { claimIds } = req.body;

    if (!Array.isArray(claimIds)) {
      return res.status(400).json({
        success: false,
        message: 'claimIds must be an array'
      });
    }

    console.log(`Generating batch expert analysis for ${claimIds.length} claims`);
    const batchResults = await DSSRecommendationEngine.generateBatchRecommendations(claimIds);

    res.json({
      success: true,
      message: `Batch analysis completed for ${claimIds.length} claims`,
      data: batchResults,
      summary: {
        total: claimIds.length,
        successful: batchResults.filter(r => !r.error).length,
        errors: batchResults.filter(r => r.error).length
      }
    });
  } catch (error) {
    console.error('Error generating batch analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate batch analysis',
      error: error.message
    });
  }
});

// Get ML-based predictions for a specific claim
router.get('/ml-predictions/:claimId', authMiddleware, async (req, res) => {
  try {
    const { claimId } = req.params;

    console.log(`🤖 Getting ML predictions for claim ${claimId}`);
    const predictions = await DSSMLPredictionService.getPredictionsForClaim(parseInt(claimId));

    if (!predictions) {
      return res.status(404).json({
        success: false,
        message: 'Unable to generate predictions for this claim'
      });
    }

    res.json({
      success: true,
      data: predictions,
      message: 'ML predictions generated successfully'
    });
  } catch (error) {
    console.error('Error getting ML predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ML predictions',
      error: error.message
    });
  }
});

// DSS recommendation statistics
router.get('/recommendation-stats', authMiddleware, async (req, res) => {
  try {
    const stats = await DSSRecommendationEngine.getRecommendationStatistics();

    res.json({
      success: true,
      data: {
        totalClaims: parseInt(stats.total_claims),
        averagePriorities: {
          jalJeevanMission: parseFloat(stats.avg_jjm_priority).toFixed(3),
          dajgua: parseFloat(stats.avg_dajgua_priority).toFixed(3),
          mgnrega: parseFloat(stats.avg_mgnrega_priority).toFixed(3)
        },
        eligibility: {
          pmKisan: parseInt(stats.pm_kisan_eligible),
          pmay: parseInt(stats.pmay_eligible)
        },
        highPriority: {
          jalJeevanMission: parseInt(stats.jjm_high_priority),
          dajgua: parseInt(stats.dajgua_high_priority),
          mgnrega: parseInt(stats.mgnrega_high_priority)
        }
      }
    });
  } catch (error) {
    console.error('Error getting recommendation statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendation statistics',
      error: error.message
    });
  }
});

// TEST ENDPOINT - ML predictions without auth (for testing only)
router.get('/test-ml-predictions/:claimId', async (req, res) => {
  try {
    const { claimId } = req.params;

    console.log(`🤖 TEST: Getting ML predictions for claim ${claimId}`);
    const predictions = await DSSMLPredictionService.getPredictionsForClaim(parseInt(claimId));

    if (!predictions) {
      return res.status(404).json({
        success: false,
        message: 'Unable to generate predictions for this claim',
        claimId: claimId
      });
    }

    res.json({
      success: true,
      data: predictions,
      message: 'ML predictions generated successfully (TEST ENDPOINT)'
    });
  } catch (error) {
    console.error('Error in test ML predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ML predictions',
      error: error.message
    });
  }
});

module.exports = router;