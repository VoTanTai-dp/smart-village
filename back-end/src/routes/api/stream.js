import express from 'express';
import streamController from '../../controller/streamController';

const router = express.Router();

// Health check backend
router.get('/stream/health', streamController.healthCheck);

// Start stream cho camera theo id
router.post('/cameras/:id/stream/start', streamController.startStream);

// Stop stream 1 camera theo id
router.post('/cameras/:id/stream/stop', streamController.stopStream);

// Stop toàn bộ stream
router.post('/cameras/stream/stop-all', streamController.stopAllStreams);

module.exports = router;