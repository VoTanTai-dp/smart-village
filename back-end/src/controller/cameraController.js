import cameraService from '../services/cameraService.js';

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
};

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

export {
    createCamera,
    getAllCameras,
    getCameraById,
    updateCamera,
    deleteCamera,
    deleteAllCameras
};