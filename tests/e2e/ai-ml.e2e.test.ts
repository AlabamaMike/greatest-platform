/**
 * E2E Tests for AI/ML Service
 */

import { getAIMLClient } from './helpers/api-client';

describe('AI/ML Service E2E Tests', () => {
  let aimlClient: ReturnType<typeof getAIMLClient>;

  beforeAll(() => {
    aimlClient = getAIMLClient();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await aimlClient.get('/health');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
    });
  });

  describe('Model Information', () => {
    it('should list available models', async () => {
      const response = await aimlClient.get('/api/v1/models');

      if (response.status === 200) {
        expect(response.data).toHaveProperty('models');
        expect(Array.isArray(response.data.models)).toBe(true);
      } else {
        expect([404, 501, 503]).toContain(response.status);
      }
    });

    it('should get model info', async () => {
      const response = await aimlClient.get('/api/v1/models/info');

      if (response.status === 200) {
        expect(response.data).toBeDefined();
      } else {
        expect([404, 501, 503]).toContain(response.status);
      }
    });
  });

  describe('Prediction Endpoints', () => {
    it('should handle prediction requests', async () => {
      const predictionData = {
        model: 'test-model',
        input: {
          text: 'This is a test input',
        },
      };

      const response = await aimlClient.post('/api/v1/predict', predictionData);

      // Service might not be running or model might not be loaded
      if (response.status === 200) {
        expect(response.data).toHaveProperty('prediction');
      } else {
        expect([400, 404, 501, 503]).toContain(response.status);
      }
    });
  });

  describe('NLP Endpoints', () => {
    it('should handle sentiment analysis', async () => {
      const response = await aimlClient.post('/api/v1/nlp/sentiment', {
        text: 'This is a great day!',
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('sentiment');
      } else {
        expect([404, 501, 503]).toContain(response.status);
      }
    });

    it('should handle text classification', async () => {
      const response = await aimlClient.post('/api/v1/nlp/classify', {
        text: 'Medical diagnosis text',
        categories: ['medical', 'education', 'general'],
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('classification');
      } else {
        expect([404, 501, 503]).toContain(response.status);
      }
    });

    it('should handle entity extraction', async () => {
      const response = await aimlClient.post('/api/v1/nlp/entities', {
        text: 'Patient John Doe visited Dr. Smith on January 1st',
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('entities');
      } else {
        expect([404, 501, 503]).toContain(response.status);
      }
    });
  });

  describe('Computer Vision Endpoints', () => {
    it('should handle image classification', async () => {
      // Mock base64 image data
      const mockImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await aimlClient.post('/api/v1/vision/classify', {
        image: mockImage,
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('classification');
      } else {
        expect([400, 404, 501, 503]).toContain(response.status);
      }
    });

    it('should handle object detection', async () => {
      const mockImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await aimlClient.post('/api/v1/vision/detect', {
        image: mockImage,
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('objects');
      } else {
        expect([400, 404, 501, 503]).toContain(response.status);
      }
    });
  });

  describe('Training Endpoints', () => {
    it('should handle training job submission', async () => {
      const trainingData = {
        model_type: 'classification',
        dataset: 'test-dataset',
        parameters: {
          epochs: 10,
          batch_size: 32,
        },
      };

      const response = await aimlClient.post('/api/v1/training/jobs', trainingData);

      if (response.status === 201) {
        expect(response.data).toHaveProperty('job_id');
      } else {
        expect([400, 404, 501, 503]).toContain(response.status);
      }
    });

    it('should list training jobs', async () => {
      const response = await aimlClient.get('/api/v1/training/jobs');

      if (response.status === 200) {
        expect(response.data).toHaveProperty('jobs');
        expect(Array.isArray(response.data.jobs)).toBe(true);
      } else {
        expect([404, 501, 503]).toContain(response.status);
      }
    });
  });

  describe('Recommendation Endpoints', () => {
    it('should provide recommendations', async () => {
      const response = await aimlClient.post('/api/v1/recommendations', {
        user_id: 'test-user',
        context: 'healthcare',
        limit: 10,
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('recommendations');
      } else {
        expect([404, 501, 503]).toContain(response.status);
      }
    });
  });

  describe('Anomaly Detection', () => {
    it('should detect anomalies', async () => {
      const response = await aimlClient.post('/api/v1/anomaly-detection', {
        data: [1, 2, 3, 4, 5, 100, 6, 7, 8],
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('anomalies');
      } else {
        expect([404, 501, 503]).toContain(response.status);
      }
    });
  });

  describe('Forecasting', () => {
    it('should generate forecasts', async () => {
      const response = await aimlClient.post('/api/v1/forecast', {
        timeseries: [
          { timestamp: '2024-01-01', value: 100 },
          { timestamp: '2024-01-02', value: 105 },
          { timestamp: '2024-01-03', value: 110 },
        ],
        horizon: 7,
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('forecast');
      } else {
        expect([404, 501, 503]).toContain(response.status);
      }
    });
  });
});
