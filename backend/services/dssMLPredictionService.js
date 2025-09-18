const { spawn } = require('child_process');
const path = require('path');
const db = require('../db');

class DSSMLPredictionService {
  /**
   * Get ML-based DSS predictions for a specific claim ID
   * Uses the Python ML model to predict scheme priorities
   */
  static async getPredictionsForClaim(claimId) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`🤖 Getting ML predictions for claim ID: ${claimId}`);

        // First check if claim exists
        const claimResult = await db.query('SELECT * FROM claims WHERE id = $1', [claimId]);

        if (!claimResult.rows.length) {
          console.log(`Claim ${claimId} not found`);
          return resolve(null);
        }

        const claim = claimResult.rows[0];
        const village = claim.village;

        // Python script to run predictions
        const pythonScript = `
import sys
import pandas as pd
import numpy as np
import joblib
import json
import warnings
warnings.filterwarnings('ignore')

try:
    claim_id = ${claimId}
    village_name = "${village.replace(/"/g, '\\"')}"

    # Load village stats
    all_village_stats = pd.read_csv('dss_village_stats.csv')
    village_stats_df = all_village_stats[all_village_stats['Village'] == village_name]

    if village_stats_df.empty:
        # If village not found, use average values from all villages
        avg_stats = all_village_stats.mean(numeric_only=True)

        # Create a DataFrame with average values
        village_features_data = {
            'avg_distance_meters': [avg_stats.get('avg_distance_meters', 5000000)],
            'claimant_count': [int(avg_stats.get('claimant_count', 5))],
            'percent_agri': [avg_stats.get('percent_agri', 30)],
            'avg_annual_income': [avg_stats.get('avg_annual_income', 89574)],
            'percent_insecure_tenure': [avg_stats.get('percent_insecure_tenure', 70)]
        }
        village_features_df = pd.DataFrame(village_features_data)

        # Load the ML model and predict
        model = joblib.load('dss_model.joblib')
        predicted_scores = model.predict(village_features_df)

        result = {
            'claim_id': claim_id,
            'village': village_name,
            'predictions': {
                'jal_jeevan_mission': float(predicted_scores[0, 0]),
                'dajgua': float(predicted_scores[0, 1]),
                'mgnrega': float(predicted_scores[0, 2]),
                'pm_kisan': float(predicted_scores[0, 3]),
                'pmay': float(predicted_scores[0, 4])
            },
            'village_stats': village_features_data,
            'status': 'predicted',
            'message': 'Village not in training data, using ML model with average features'
        }
    else:
        # Load the ML model
        model = joblib.load('dss_model.joblib')

        # Prepare features
        features_order = [
            'avg_distance_meters',
            'claimant_count',
            'percent_agri',
            'avg_annual_income',
            'percent_insecure_tenure'
        ]
        village_features = village_stats_df[features_order]

        # Get predictions
        predicted_scores = model.predict(village_features)

        result = {
            'claim_id': claim_id,
            'village': village_name,
            'predictions': {
                'jal_jeevan_mission': float(predicted_scores[0, 0]),
                'dajgua': float(predicted_scores[0, 1]),
                'mgnrega': float(predicted_scores[0, 2]),
                'pm_kisan': float(predicted_scores[0, 3]),
                'pmay': float(predicted_scores[0, 4])
            },
            'village_stats': {
                'avg_distance_meters': float(village_stats_df['avg_distance_meters'].iloc[0]),
                'claimant_count': int(village_stats_df['claimant_count'].iloc[0]),
                'percent_agri': float(village_stats_df['percent_agri'].iloc[0]),
                'avg_annual_income': float(village_stats_df['avg_annual_income'].iloc[0]),
                'percent_insecure_tenure': float(village_stats_df['percent_insecure_tenure'].iloc[0])
            },
            'status': 'success',
            'message': 'ML model predictions based on village data'
        }

    print(json.dumps(result))

except Exception as e:
    error_result = {
        'claim_id': ${claimId},
        'status': 'error',
        'message': str(e)
    }
    print(json.dumps(error_result))
`;

        // Write Python script to temp file and execute
        const dssWorkDir = path.join(__dirname, '..', '..', 'DSS');

        // Use venv Python on Windows, regular python3 on Linux
        const isWindows = process.platform === 'win32';
        const pythonExecutable = isWindows
          ? path.join(__dirname, '..', '..', 'Faker', 'pipeline', 'venv', 'Scripts', 'python.exe')
          : 'python3';

        console.log(`Using Python: ${pythonExecutable}`);

        const pythonProcess = spawn(pythonExecutable, ['-c', pythonScript], {
          cwd: dssWorkDir,
          env: { ...process.env, PYTHONUNBUFFERED: '1' }
        });

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            console.error('Python script error:', stderr);
            resolve(null);
          } else {
            try {
              const result = JSON.parse(stdout.trim());

              // Transform predictions into scheme recommendations
              const recommendations = this.transformPredictionsToRecommendations(result, claim);

              resolve(recommendations);
            } catch (parseError) {
              console.error('Error parsing Python output:', parseError);
              console.error('Raw output:', stdout);
              resolve(null);
            }
          }
        });

        pythonProcess.on('error', (err) => {
          console.error('Failed to start Python process:', err);
          resolve(null);
        });

      } catch (error) {
        console.error('Error in getPredictionsForClaim:', error);
        resolve(null);
      }
    });
  }

  /**
   * Transform ML predictions into user-friendly scheme recommendations
   */
  static transformPredictionsToRecommendations(mlResult, claimData) {
    const schemes = [
      {
        id: 'jal_jeevan_mission',
        name: 'Jal Jeevan Mission',
        description: 'Provides functional tap water connection to every rural household',
        priority: mlResult.predictions.jal_jeevan_mission,
        type: 'Water & Sanitation',
        benefits: ['Clean drinking water', 'Reduced water-borne diseases', 'Time savings for women'],
        icon: 'water'
      },
      {
        id: 'dajgua',
        name: 'DAJGUA (Land Rights)',
        description: 'Secures land tenure and ownership rights for forest dwellers',
        priority: mlResult.predictions.dajgua,
        type: 'Land Rights',
        benefits: ['Legal land ownership', 'Access to credit', 'Protection from eviction'],
        icon: 'shield'
      },
      {
        id: 'mgnrega',
        name: 'MGNREGA',
        description: 'Guarantees 100 days of employment per year for rural households',
        priority: mlResult.predictions.mgnrega,
        type: 'Employment',
        benefits: ['Guaranteed wages', 'Local employment', 'Asset creation'],
        icon: 'briefcase'
      },
      {
        id: 'pm_kisan',
        name: 'PM-KISAN',
        description: 'Direct income support of ₹6,000 per year to farmer families',
        priority: mlResult.predictions.pm_kisan,
        type: 'Agriculture',
        benefits: ['Direct cash transfer', 'Support for farming inputs', 'Financial stability'],
        icon: 'sprout',
        eligible: claimData.land_use === 'Agriculture' && claimData.tax_payer === 'No'
      },
      {
        id: 'pmay',
        name: 'PM Awas Yojana',
        description: 'Provides assistance for construction of pucca houses',
        priority: mlResult.predictions.pmay,
        type: 'Housing',
        benefits: ['Housing assistance', 'Improved living conditions', 'Asset creation'],
        icon: 'home',
        eligible: claimData.category === 'ST' && claimData.annual_income < 250000
      }
    ];

    // Sort by priority and filter eligible schemes
    const recommendedSchemes = schemes
      .filter(scheme => scheme.priority > 0.3 && (scheme.eligible !== false))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5); // Top 5 schemes

    // Calculate overall recommendation score
    const overallScore = recommendedSchemes.reduce((sum, s) => sum + s.priority, 0) / recommendedSchemes.length;

    return {
      claimId: mlResult.claim_id,
      claimantName: claimData.claimant_name,
      village: mlResult.village,
      location: {
        state: claimData.state,
        district: claimData.district,
        village: claimData.village
      },
      demographics: {
        category: claimData.category,
        annual_income: claimData.annual_income,
        land_use: claimData.land_use,
        age: claimData.age,
        gender: claimData.gender
      },
      recommendedSchemes,
      priorities: mlResult.predictions,
      villageStatistics: mlResult.village_stats,
      overallScore,
      totalSchemes: recommendedSchemes.length,
      topPriority: recommendedSchemes[0]?.name || 'No high-priority schemes',
      status: mlResult.status,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Get batch predictions for multiple claims
   */
  static async getBatchPredictions(claimIds) {
    const predictions = [];

    for (const claimId of claimIds) {
      const prediction = await this.getPredictionsForClaim(claimId);
      if (prediction) {
        predictions.push(prediction);
      }
    }

    return predictions;
  }
}

module.exports = DSSMLPredictionService;