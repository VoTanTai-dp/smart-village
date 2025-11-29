import groupService from '../service/groupService.js';

const createGroup = async (req, res) => {
    try {
        const newGroup = await groupService.createGroup(req.body);
        return res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: newGroup
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

const getAllGroups = async (req, res) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        if (!page || page <= 0) page = 1;
        if (!limit || limit <= 0) limit = 10;

        const allGroups = await groupService.getAllGroups({ page, limit });
        return res.status(200).json({
            success: true,
            message: 'Groups retrieved successfully',
            data: allGroups,
            meta: allGroups.meta
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

const getGroupById = async (req, res) => {
    try {
        const groupId = await groupService.getGroupById(req.params.id);
        if (!groupId) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
                errorCode: 'GROUP_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Get group successfully',
            data: groupId
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

const updateGroup = async (req, res) => {
    try {
        const updateGroup = await groupService.updateGroup(req.params.id, req.body);
        if (!updateGroup) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
                errorCode: 'GROUP_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Group updated successfully',
            data: updateGroup
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

const deleteGroup = async (req, res) => {
    try {
        const deleteGroup = await groupService.deleteGroup(req.params.id);
        if (!deleteGroup) {
            return res.status(404).json({
                success: false,
                message: 'Group not found',
                errorCode: 'GROUP_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Group deleted successfully',
            data: deleteGroup
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

const deleteAllGroup = async (req, res) => {
    try {
        await groupService.deleteAllGroup();
        return res.status(200).json({
            success: true,
            message: 'All groups deleted successfully',
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
    createGroup,
    getAllGroups,
    getGroupById,
    updateGroup,
    deleteGroup,
    deleteAllGroup
};