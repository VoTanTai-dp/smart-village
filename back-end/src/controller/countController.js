import countService from '../service/countService.js';

const createCount = async (req, res) => {
    try {
        const newCount = await countService.createCount(req.body);
        return res.status(201).json({
            success: true,
            message: 'Count created successfully',
            data: newCount
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

const getAllCounts = async (req, res) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        if (!page || page <= 0) page = 1;
        if (!limit || limit <= 0) limit = 10;

        const allCounts = await countService.getAllCounts({ page, limit });
        return res.status(200).json({
            success: true,
            message: 'Counts retrieved successfully',
            data: allCounts,
            meta: allCounts.meta
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

const getCountById = async (req, res) => {
    try {
        const countId = await countService.getCountById(req.params.id);
        if (!countId) {
            return res.status(404).json({
                success: false,
                message: 'Count not found',
                errorCode: 'COUNT_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Get count successfully',
            data: countId
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

const updateCount = async (req, res) => {
    try {
        const updateCount = await countService.updateCount(req.params.id, req.body);
        if (!updateCount) {
            return res.status(404).json({
                success: false,
                message: 'Count not found',
                errorCode: 'COUNT_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Count updated successfully',
            data: updateCount
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

const deleteCount = async (req, res) => {
    try {
        const deleteCount = await countService.deleteCount(req.params.id);
        if (!deleteCount) {
            return res.status(404).json({
                success: false,
                message: 'Count not found',
                errorCode: 'COUNT_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Count deleted successfully',
            data: deleteCount
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

const deleteAllCount = async (req, res) => {
    try {
        await countService.deleteAllCount();
        return res.status(200).json({
            success: true,
            message: 'All counts deleted successfully',
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
    createCount,
    getAllCounts,
    getCountById,
    updateCount,
    deleteCount,
    deleteAllCount
};