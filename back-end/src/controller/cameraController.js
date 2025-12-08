import cameraService from '../service/cameraService.js';
const { proxy } = require('rtsp-relay')(require('express')());

const createCamera = async (req, res) => {
    try {
        const camera = await cameraService.createCamera(req.body);
        return res.status(201).json({
            success: true,
            message: 'Camera created successfully',
            data: camera
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const getAllCameras = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const cameras = await cameraService.getAllCameras({ page: parseInt(page), limit: parseInt(limit) });
        return res.status(200).json({
            success: true,
            message: 'Cameras retrieved successfully',
            data: cameras,
            meta: cameras.meta
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
}

const getCameraById = async (req, res) => {
    try {
        const camera = await cameraService.getCameraById(req.params.id);
        if (!camera) {
            return res.status(404).json({
                success: false,
                message: 'Camera not found',
                errorCode: 'CAMERA_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Camera retrieved successfully',
            data: camera
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const updateCamera = async (req, res) => {
    try {
        const camera = await cameraService.updateCamera(req.params.id, req.body);
        if (!camera) {
            return res.status(404).json({
                success: false,
                message: 'Camera not found',
                errorCode: 'CAMERA_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Camera updated successfully',
            data: camera
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const deleteCamera = async (req, res) => {
    try {
        const camera = await cameraService.deleteCamera(req.params.id);
        if (!camera) {
            return res.status(404).json({
                success: false,
                message: 'Camera not found',
                errorCode: 'CAMERA_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Camera deleted successfully',
            data: camera
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const deleteAllCameras = async (req, res) => {
    try {
        await cameraService.deleteAllCameras();
        return res.status(200).json({
            success: true,
            message: 'All cameras deleted successfully',
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

// --- CHỨC NĂNG STREAM VIDEO ---
const streamCamera = async (ws, req) => {
    try {
        const cameraId = req.params.id;

        // 1. Lấy thông tin camera kèm mật khẩu đã giải mã
        const camera = await cameraService.getCameraCredentials(cameraId);

        if (!camera) {
            console.log(`>>> [Stream] Camera ${cameraId} not found`);
            ws.close();
            return;
        }

        // 2. Encode URL RTSP chuẩn Dahua
        // encodeURIComponent quan trọng để xử lý ký tự đặc biệt trong user/pass
        const user = encodeURIComponent(camera.username);
        const pass = encodeURIComponent(camera.password);
        const ip = camera.ip;
        const port = camera.port || 554;

        // URL RTSP Dahua (Sub stream để nhẹ web: subtype=1)
        const rtspUrl = `rtsp://${user}:${pass}@${ip}:${port}/cam/realmonitor?channel=1&subtype=1`;

        console.log(`>>> Streaming Camera ID ${cameraId}: ${rtspUrl}`);

        // 3. Proxy qua FFmpeg
        proxy({
            url: rtspUrl,
            verbose: true, // Bật true để debug nếu lỗi
            transport: 'tcp', // Dahua chạy ổn định hơn với TCP
            additionalFlags: ['-q', '1'] // Tùy chỉnh chất lượng video
        })(ws);

    } catch (e) {
        console.error(">>> Stream Error:", e);
        ws.close();
    }
};

module.exports = {
    createCamera,
    getAllCameras,
    getCameraById,
    updateCamera,
    deleteCamera,
    deleteAllCameras,
    streamCamera
};