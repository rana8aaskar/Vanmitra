const FRAModel = require('../models/fraModel');
const ModelClient = require('../utils/modelClient');
const PipelineProcessor = require('../utils/pipelineProcessor');
const dssSyncService = require('../dss-sync-service');
const DSSEngineService = require('../services/dssEngineService');
const SimpleDSSService = require('../services/simpleDSSService');
const DSSMLPredictionService = require('../services/dssMLPredictionService');
const SimpleDSSPredictionService = require('../services/simpleDSSPredictionService');
const fs = require('fs').promises;
const path = require('path');

class FRAController {
  // Process document and preview extracted data (without saving to DB)
  static async processDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { file } = req;
      const userId = req.user ? req.user.id : null;

      // Process file with pipeline
      const pipelineResult = await PipelineProcessor.processImage(file.path);

      if (!pipelineResult.success) {
        // Fallback to ModelClient if pipeline fails
        const modelResult = await ModelClient.processFile(file.path);
        return res.status(200).json({
          message: 'Document processed',
          extractedData: modelResult.extracted_data,
          success: modelResult.success,
          method: 'fallback'
        });
      }

      // For preview mode, we don't have a claim ID yet, so we can't get DSS recommendations
      // DSS recommendations will be generated when the document is saved
      let dssRecommendations = null;
      console.log('📋 Document processed for preview - DSS recommendations will be available after saving');

      // Return extracted data for preview
      res.status(200).json({
        message: 'Document processed successfully',
        extractedData: pipelineResult.data,
        rawCsv: pipelineResult.rawCsv,
        dssRecommendations: dssRecommendations,
        success: true,
        method: 'pipeline'
      });
    } catch (error) {
      // Clean up file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      next(error);
    }
  }

  // Save processed document to database
  static async saveDocument(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const documentData = req.body;

      // Add user_id and status
      documentData.user_id = userId;
      documentData.status = documentData.status || 'pending';

      // Save to database (will either create new or update existing)
      const fraDocument = await FRAModel.createDocument(documentData);

      // Determine the message based on operation
      let message = 'Document saved successfully';
      let statusCode = 201;

      if (fraDocument.operation === 'update') {
        message = `Existing claim updated successfully (ID: ${fraDocument.id}). ${fraDocument.changed_fields ? fraDocument.changed_fields.length : 0} fields modified.`;
        statusCode = 200;
        console.log(`✅ Updated existing claim ${fraDocument.id} with changes:`, fraDocument.changed_fields);
      } else if (fraDocument.operation === 'no_change') {
        message = `Existing claim found (ID: ${fraDocument.id}). No changes detected.`;
        statusCode = 200;
        console.log(`ℹ️ No changes for existing claim ${fraDocument.id}`);
      } else {
        message = `New claim created successfully (ID: ${fraDocument.id})`;
        console.log(`✅ Created new claim ${fraDocument.id}`);
      }

      // Skip the Python-based DSS pipeline since we're using simplified predictions
      // The SimpleDSSPredictionService works without Python
      /*
      if (fraDocument && fraDocument.id) {
        console.log('🔄 Running DSS pipeline after document save...');
        DSSEngineService.runFullPipeline()
          .then(() => console.log('✅ DSS pipeline completed after document save'))
          .catch(err => console.error('⚠️ DSS pipeline failed:', err));
      }
      */

      // Generate DSS recommendations for the saved document using ML predictions
      let dssRecommendations = null;
      if (fraDocument.id) {
        try {
          console.log('🔄 Generating ML-based DSS predictions for claim ID:', fraDocument.id);

          // Try to use ML prediction service first, fallback to simplified service
          dssRecommendations = await DSSMLPredictionService.getPredictionsForClaim(fraDocument.id);

          if (!dssRecommendations) {
            console.log('⚠️ ML predictions failed, using simplified service...');
            dssRecommendations = await SimpleDSSPredictionService.getPredictionsForClaim(fraDocument.id);
          }

          if (!dssRecommendations) {
            // Fallback to existing recommendation services
            console.log('⚠️ ML predictions unavailable, trying fallback services...');
            dssRecommendations = await DSSEngineService.getRecommendationsForClaim(fraDocument.id);

            if (!dssRecommendations) {
              console.log('🔄 Generating simple DSS recommendations...');
              dssRecommendations = await SimpleDSSService.generateRecommendationsForClaim(fraDocument.id);
            }
          }

          console.log('DSS recommendations generated:', dssRecommendations ? 'Yes' : 'No');
          if (dssRecommendations?.recommendedSchemes) {
            console.log(`✅ Recommended ${dssRecommendations.recommendedSchemes.length} schemes for claim ${fraDocument.id}`);
          }
        } catch (dssError) {
          console.error('Error getting DSS recommendations:', dssError);
        }
      }

      // Clean up operation metadata before sending response
      const documentResponse = { ...fraDocument };
      delete documentResponse.operation;
      delete documentResponse.changed_fields;

      res.status(statusCode).json({
        message: message,
        document: documentResponse,
        dssRecommendations: dssRecommendations,
        operation: fraDocument.operation,
        changedFields: fraDocument.changed_fields
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload and process FRA document (old method - kept for compatibility)
  static async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { file } = req;
      const userId = req.user ? req.user.id : null;

      // Process file with pipeline
      console.log('Attempting to process file with pipeline:', file.path);
      const pipelineResult = await PipelineProcessor.processImage(file.path);
      console.log('Pipeline result:', pipelineResult);

      let documentData;
      if (pipelineResult.success) {
        console.log('Using pipeline data:', pipelineResult.data);
        documentData = {
          ...pipelineResult.data,
          user_id: userId,
          document_path: file.path
        };
      } else {
        // Fallback to ModelClient
        console.log('Pipeline failed, falling back to ModelClient');
        const modelResult = await ModelClient.processFile(file.path);
        console.log('ModelClient result:', modelResult);
        documentData = {
          ...modelResult.extracted_data,
          status: modelResult.success ? 'pending' : 'processing_error',
          user_id: userId,
          document_path: file.path
        };
      }

      // Save to database
      const fraDocument = await FRAModel.createDocument(documentData);

      // Save upload record
      const uploadRecord = await FRAModel.createUpload({
        file_path: file.path,
        original_filename: file.originalname,
        processed_data: pipelineResult.success ? pipelineResult.rawCsv : null,
        uploaded_by: userId,
        fra_document_id: fraDocument.id
      });

      res.status(201).json({
        message: 'Document uploaded and processed successfully',
        document: fraDocument,
        upload: uploadRecord,
        processing: {
          success: pipelineResult.success || false,
          method: pipelineResult.success ? 'pipeline' : 'fallback'
        }
      });
    } catch (error) {
      // Clean up file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      next(error);
    }
  }

  // Get all FRA documents with filters
  static async getDocuments(req, res, next) {
    try {
      const {
        state,
        district,
        claim_status,
        limit = 50,
        offset = 0
      } = req.query;

      const filters = {};
      if (state) filters.state = state;
      if (district) filters.district = district;
      if (claim_status) filters.claim_status = claim_status;
      if (req.user && req.user.role !== 'admin') {
        filters.uploaded_by = req.user.id;
      }

      const documents = await FRAModel.getDocuments(filters, parseInt(limit), parseInt(offset));

      res.json({
        documents,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: documents.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single FRA document
  static async getDocumentById(req, res, next) {
    try {
      const { id } = req.params;
      const document = await FRAModel.getDocumentById(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check authorization
      if (req.user && req.user.role !== 'admin' && document.uploaded_by !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ document });
    } catch (error) {
      next(error);
    }
  }

  // Update FRA document
  static async updateDocument(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if document exists
      const existingDoc = await FRAModel.getDocumentById(id);
      if (!existingDoc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check authorization
      if (req.user.role !== 'admin' && existingDoc.uploaded_by !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update document
      const updatedDocument = await FRAModel.updateDocument(id, updateData);

      res.json({
        message: 'Document updated successfully',
        document: updatedDocument
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete FRA document
  static async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;

      // Check if document exists
      const existingDoc = await FRAModel.getDocumentById(id);
      if (!existingDoc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check authorization (admin only)
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Delete document
      await FRAModel.deleteDocument(id);

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Get statistics
  static async getStatistics(req, res, next) {
    try {
      const stats = await FRAModel.getStatistics();
      res.json({ statistics: stats });
    } catch (error) {
      next(error);
    }
  }

  // Reprocess document
  static async reprocessDocument(req, res, next) {
    try {
      const { id } = req.params;

      // Get document and associated upload
      const document = await FRAModel.getDocumentById(id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Check authorization
      if (req.user.role !== 'admin' && document.uploaded_by !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get upload record to find file path
      const uploadQuery = await db.query(
        'SELECT file_path FROM uploads WHERE fra_document_id = $1',
        [id]
      );

      if (!uploadQuery.rows[0]) {
        return res.status(404).json({ error: 'Original file not found' });
      }

      const filePath = uploadQuery.rows[0].file_path;

      // Reprocess with model
      const modelResult = await ModelClient.processFile(filePath);

      // Update document with new data
      const updateData = {
        ...modelResult.extracted_data,
        claim_status: modelResult.success ? 'pending' : 'processing_error',
        processed_json: modelResult
      };

      const updatedDocument = await FRAModel.updateDocument(id, updateData);

      res.json({
        message: 'Document reprocessed successfully',
        document: updatedDocument,
        processing: {
          success: modelResult.success,
          error: modelResult.error
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FRAController;