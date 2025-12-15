import express from 'express';
import haController from '../../controller/haController.js';

const router = express.Router();

// Lấy state 1 entity
router.get('/state', haController.getState);

// Gọi service Home Assistant
router.post('/service', express.json(), haController.callService);

// Lấy nhiệt độ/độ ẩm
router.get('/sensors', haController.getSensors);

// Lấy cấu hình entity IDs từ backend .env
router.get('/config', haController.getConfig);

export default router;
