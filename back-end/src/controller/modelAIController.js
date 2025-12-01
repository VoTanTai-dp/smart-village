import modelAIService from '../service/modelAIService.js';

const createModelAI = async (req, res) => {
    try {
        const newModelAI = await modelAIService.createModelAI(req.body);
        return res.status(201).json({
            success: true,
            message: 'ModelAI created successfully',
            data: newModelAI
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

const getAllModelAIs = async (req, res) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        if (!page || page <= 0) page = 1;
        if (!limit || limit <= 0) limit = 10;

        const allModelAIs = await modelAIService.getAllModelAIs({ page, limit });
        return res.status(200).json({
            success: true,
            message: 'ModelAIs retrieved successfully',
            data: allModelAIs,
            meta: allModelAIs.meta
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

const getModelAIById = async (req, res) => {
    try {
        const modelAIId = await modelAIService.getModelAIById(req.params.id);
        if (!modelAIId) {
            return res.status(404).json({
                success: false,
                message: 'ModelAI not found',
                errorCode: 'MODELAI_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Get modelAI successfully',
            data: modelAIId
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

const updateModelAI = async (req, res) => {
    try {
        const updateModelAI = await modelAIService.updateModelAI(req.params.id, req.body);
        if (!updateModelAI) {
            return res.status(404).json({
                success: false,
                message: 'ModelAI not found',
                errorCode: 'MODELAI_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'ModelAI updated successfully',
            data: updateModelAI
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

const deleteModelAI = async (req, res) => {
    try {
        const deleteModelAI = await modelAIService.deleteModelAI(req.params.id);
        if (!deleteModelAI) {
            return res.status(404).json({
                success: false,
                message: 'ModelAI not found',
                errorCode: 'MODELAI_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'ModelAI deleted successfully',
            data: deleteModelAI
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

const deleteAllModelAI = async (req, res) => {
    try {
        await modelAIService.deleteAllModelAI();
        return res.status(200).json({
            success: true,
            message: 'All modelAIs deleted successfully',
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
    createModelAI,
    getAllModelAIs,
    getModelAIById,
    updateModelAI,
    deleteModelAI,
    deleteAllModelAI
};