import cameraModelService from '../service/cameraModelService.js';

const createCamera_Model = async (req, res) => {
    try {
        const newCamera_Model = await cameraModelService.createCamera_Model(req.body);
        return res.status(201).json({
            success: true,
            message: 'Camera_Model created successfully',
            data: newCamera_Model
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

const getAllCamera_Models = async (req, res) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        if (!page || page <= 0) page = 1;
        if (!limit || limit <= 0) limit = 10;

        const allCamera_Models = await cameraModelService.getAllCamera_Models({ page, limit });
        return res.status(200).json({
            success: true,
            message: 'Camera_Models retrieved successfully',
            data: allCamera_Models,
            meta: allCamera_Models.meta
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

const getCamera_ModelById = async (req, res) => {
    try {
        const camera_modelId = await cameraModelService.getCamera_ModelById(req.params.id);
        if (!camera_modelId) {
            return res.status(404).json({
                success: false,
                message: 'Camera_Model not found',
                errorCode: 'CAMERA_MODEL_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Get camera_model successfully',
            data: camera_modelId
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

const updateCamera_Model = async (req, res) => {
    try {
        const updateCamera_Model = await cameraModelService.updateCamera_Model(req.params.id, req.body);
        if (!updateCamera_Model) {
            return res.status(404).json({
                success: false,
                message: 'Camera_Model not found',
                errorCode: 'CAMERA_MODEL_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Camera_Model updated successfully',
            data: updateCamera_Model
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const deleteCamera_Model = async (req, res) => {
    try {
        const deleteCamera_Model = await cameraModelService.deleteCamera_Model(req.params.id);
        if (!deleteCamera_Model) {
            return res.status(404).json({
                success: false,
                message: 'Camera_Model not found',
                errorCode: 'CAMERA_MODEL_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Camera_Model deleted successfully',
            data: deleteCamera_Model
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const deleteAllCamera_Model = async (req, res) => {
    try {
        await cameraModelService.deleteAllCamera_Model();
        return res.status(200).json({
            success: true,
            message: 'All camera_models deleted successfully',
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

module.exports = {
    createCamera_Model,
    getAllCamera_Models,
    getCamera_ModelById,
    updateCamera_Model,
    deleteCamera_Model,
    deleteAllCamera_Model
};