import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award, TrendingUp, Droplets, Building2, Users,
  Home, IndianRupee, AlertCircle, ChevronRight,
  Shield, Briefcase, Sprout, WaterIcon
} from 'lucide-react';
import api from '../services/api';

const schemeDetails = {
  'Jal Jeevan Mission': {
    icon: Droplets,
    color: 'blue',
    description: 'Water connection to every household',
    benefits: ['Tap water connection', 'Clean drinking water', 'Improved sanitation']
  },
  'DAJGUA': {
    icon: Building2,
    color: 'purple',
    description: 'Development of tribal areas',
    benefits: ['Infrastructure development', 'Basic amenities', 'Community development']
  },
  'MGNREGA': {
    icon: Users,
    color: 'green',
    description: 'Rural employment guarantee',
    benefits: ['100 days employment', 'Minimum wages', 'Skill development']
  },
  'PM-KISAN': {
    icon: IndianRupee,
    color: 'orange',
    description: 'Direct income support to farmers',
    benefits: ['₹6000 annual support', 'Direct bank transfer', 'Agricultural support']
  },
  'PMAY': {
    icon: Home,
    color: 'red',
    description: 'Housing for all',
    benefits: ['Pucca house construction', 'Financial assistance', 'Basic amenities']
  }
};

export default function DSSRecommendations({ claimId, claimData, dssRecommendations }) {
  const [recommendations, setRecommendations] = useState(dssRecommendations || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedScheme, setExpandedScheme] = useState(null);

  useEffect(() => {
    // If recommendations are passed as props, use them
    if (dssRecommendations) {
      setRecommendations(dssRecommendations);
    } else if (claimId) {
      fetchRecommendations();
    }
  }, [claimId, dssRecommendations]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/dss/recommendations?claim_id=${claimId}`);
      if (response.data && response.data.length > 0) {
        setRecommendations(response.data[0]);
      } else {
        // If no recommendations, try to trigger analysis
        const analyzeResponse = await api.post('/api/dss/analyze', {
          claim_id: claimId,
          state: claimData?.state,
          district: claimData?.district,
          village: claimData?.village
        });
        if (analyzeResponse.data) {
          setRecommendations(analyzeResponse.data);
        }
      }
    } catch (err) {
      console.error('Error fetching DSS recommendations:', err);
      setError('Unable to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      </div>
    );
  }

  // Handle both old and new recommendation formats
  const schemes = recommendations?.recommendedSchemes || recommendations?.recommended_schemes || [];

  if (!recommendations || schemes.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-gray-600 text-center">No scheme recommendations available</p>
      </div>
    );
  }

  // Get icon based on scheme icon property or name
  const getSchemeIcon = (scheme) => {
    if (scheme.icon) {
      switch(scheme.icon) {
        case 'water': return Droplets;
        case 'shield': return Shield;
        case 'briefcase': return Briefcase;
        case 'sprout': return Sprout;
        case 'home': return Home;
        default: return TrendingUp;
      }
    }
    return schemeDetails[scheme.name || scheme.scheme]?.icon || TrendingUp;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Government Scheme Recommendations
          {recommendations.totalSchemes && (
            <span className="text-sm font-normal text-gray-500">
              ({recommendations.totalSchemes} schemes recommended)
            </span>
          )}
        </h3>
        {recommendations.overallScore && (
          <p className="text-xs text-gray-600 mt-1">
            Overall Priority Score: {(recommendations.overallScore * 100).toFixed(0)}%
          </p>
        )}
      </div>

      <div className="p-4 space-y-3">
        {schemes.map((scheme, idx) => {
          const schemeName = scheme.name || scheme.scheme;
          const details = schemeDetails[schemeName] || {};
          const Icon = getSchemeIcon(scheme);
          const isExpanded = expandedScheme === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`border rounded-lg overflow-hidden transition-all ${
                isExpanded ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="p-3 cursor-pointer"
                onClick={() => setExpandedScheme(isExpanded ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{schemeName}</h4>
                      <p className="text-xs text-gray-600">
                        {scheme.description || details.description || scheme.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Priority</p>
                      <div className="flex items-center gap-2">
                        <div className="relative w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                            style={{ width: `${(scheme.priority * 100).toFixed(0)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-blue-700">
                          {(scheme.priority * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>

                {isExpanded && (scheme.benefits || details.benefits) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-blue-200"
                  >
                    <p className="text-xs font-semibold text-gray-700 mb-2">Key Benefits:</p>
                    <ul className="space-y-1">
                      {(scheme.benefits || details.benefits).map((benefit, bIdx) => (
                        <li key={bIdx} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-blue-500 mt-0.5">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    {scheme.eligibility && (
                      <div className="mt-2 pt-2 border-t border-blue-100">
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Eligibility: </span>
                          {scheme.eligibility}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}

        {(recommendations.topPriority || recommendations.top_scheme) && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Top Recommendation:</span>
              </div>
              <span className="text-sm font-bold text-blue-900">
                {recommendations.topPriority || recommendations.top_scheme}
              </span>
            </div>
            {recommendations.village && (
              <p className="text-xs text-gray-600 mt-1">
                Based on data from {recommendations.village} village
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}