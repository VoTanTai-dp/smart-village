import streamService from '../service/streamService';
import cameraService from '../service/cameraService.js';
import config from '../config/stream.config';

// Kiểm tra tình trạng backend
const healthCheck = async (req, res) => {
    return res.json({ status: 'Backend API OK' });
};

// Start stream cho 1 camera cụ thể
const startStream = async (req, res) => {
    try {
        const { id } = req.params; // cameraId truyền qua URL

        const camera = await cameraService.getCameraCredentials(id);
        if (!camera) {
            return res.status(404).json({
                success: false,
                message: 'Camera not found',
                errorCode: 'CAMERA_NOT_FOUND',
            });
        }

        const username = camera.username;
        const password = camera.password; // đã được giải mã trong getCameraCredentials
        const ip = camera.ip;
        const port = camera.port || 554;

        if (!username || !password || !ip || !port) {
            return res.status(400).json({
                success: false,
                message: 'Missing camera connection information',
                errorCode: 'MISSING_CAMERA_INFO',
            });
        }

        const rtspUrl = `rtsp://${username}:${encodeURIComponent(
            password
        )}@${ip}:${port}/cam/realmonitor?channel=1&subtype=0`;

        console.log(`>>> Received RTSP URL (Camera ${id}): ${rtspUrl}`);

        // Start stream bằng FFmpeg (multi-camera)
        await streamService.startStreaming(id, rtspUrl);

        return res.json({
            success: true,
            message: '>>> Stream started',
            rtspUrl,
            wsUrl: `ws://localhost:${config.wsPort}`,
        });
    } catch (err) {
        console.error('>>> Start stream error:', err);
        return res.status(500).json({
            success: false,
            message: 'Start stream failed',
            error: err.message,
        });
    }
};

const stopStream = async (req, res) => {
    try {
        const { id } = req.params;
        await streamService.stopStreaming(id);
        return res.json({
            success: true,
            message: `>>> Stopped streaming camera ${id}`,
        });
    } catch (err) {
        console.error('>>> Stop stream error:', err);
        return res.status(500).json({
            success: false,
            message: 'Stop stream failed',
            error: err.message,
        });
    }
};

const stopAllStreams = async (req, res) => {
    try {
        await streamService.stopAllStreams();
        return res.json({
            success: true,
            message: 'Stopped streaming',
        });
    } catch (err) {
        console.error('>>> Stop all streams error:', err);
        return res.status(500).json({
            success: false,
            message: 'Stop all streams failed',
            error: err.message,
        });
    }
};

// Lấy danh sách camera đang stream (cameraId)
const getStreamingCameras = (req, res) => {
    try {
        const activeIds = streamService.getActiveCameraIds();
        return res.json({
            success: true,
            data: activeIds,
        });
    } catch (err) {
        console.error('>>> Get streaming cameras error:', err);
        return res.status(500).json({
            success: false,
            message: 'Get streaming cameras failed',
            error: err.message,
        });
    }
};

module.exports = {
    healthCheck,
    startStream,
    stopStream,
    stopAllStreams,
    getStreamingCameras,
};
