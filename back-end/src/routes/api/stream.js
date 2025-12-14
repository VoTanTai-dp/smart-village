import express from 'express';
import streamController from '../../controller/streamController';

const router = express.Router();

// Health check backend
router.get('/stream/health', streamController.healthCheck);

// Lấy danh sách camera đang stream
router.get('/cameras/stream/status', streamController.getStreamingCameras);

// Start stream cho camera theo id
router.post('/cameras/:id/stream/start', streamController.startStream);

// Stop stream 1 camera theo id
router.post('/cameras/:id/stream/stop', streamController.stopStream);

// Stop toàn bộ stream
router.post('/cameras/stream/stop-all', streamController.stopAllStreams);

// Connect stream bằng credentials (ip, username, password)
router.post('/cameras/stream/connect', express.json(), streamController.connectStreamByCredentials);

module.exports = router;
