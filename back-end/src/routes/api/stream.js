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

// Counter health - list active counter jobs and WS client count
router.get('/cameras/stream/counter-health', async (req, res) => {
  try {
    const sensorService = require('../../service/sensorService');
    const counterService = require('../../service/counterService');
    const jobs = counterService.listActiveCounterJobs();
    const wsClients = sensorService.getClientCount();
    return res.json({ success: true, wsClients, jobs });
  } catch (e) {
    console.error('>>> Counter health endpoint error:', e);
    return res.status(500).json({ success: false, message: e?.message || 'Internal error' });
  }
});

// Mock endpoint to broadcast counter messages for testing UI without Dahua events
router.post('/cameras/:id/stream/mock-count', express.json(), async (req, res) => {
  try {
    const sensorService = require('../../service/sensorService');
    const { people = 0, vehicle = 0, sessionId = null } = req.body || {};
    const cameraId = Number(req.params.id);

    if (!cameraId) return res.status(400).json({ success: false, message: 'Invalid camera id' });

    const payload = {
      type: 'count',
      cameraId,
      sessionId,
      people: Number(people),
      vehicle: Number(vehicle),
      atTime: new Date().toISOString(),
    };
    sensorService.broadcastGeneric(payload);
    return res.json({ success: true, message: 'Broadcasted mock count', payload });
  } catch (e) {
    console.error('>>> Mock count endpoint error:', e);
    return res.status(500).json({ success: false, message: e?.message || 'Internal error' });
  }
});

module.exports = router;
