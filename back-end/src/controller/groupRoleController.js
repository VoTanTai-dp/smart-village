import groupRoleService from '../service/groupRoleService.js';

const createGroup_Role = async (req, res) => {
    try {
        const newGroup_Role = await groupRoleService.createGroup_Role(req.body);
        return res.status(201).json({
            success: true,
            message: 'Group_Role created successfully',
            data: newGroup_Role
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

const getAllGroup_Roles = async (req, res) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        if (!page || page <= 0) page = 1;
        if (!limit || limit <= 0) limit = 10;

        const allGroup_Roles = await groupRoleService.getAllGroup_Roles({ page, limit });
        return res.status(200).json({
            success: true,
            message: 'Group_Roles retrieved successfully',
            data: allGroup_Roles,
            meta: allGroup_Roles.meta
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

const getGroup_RoleById = async (req, res) => {
    try {
        const group_roleId = await groupRoleService.getGroup_RoleById(req.params.id);
        if (!group_roleId) {
            return res.status(404).json({
                success: false,
                message: 'Group_Role not found',
                errorCode: 'GROUP_ROLE_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Get group_role successfully',
            data: group_roleId
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

const updateGroup_Role = async (req, res) => {
    try {
        const updateGroup_Role = await groupRoleService.updateGroup_Role(req.params.id, req.body);
        if (!updateGroup_Role) {
            return res.status(404).json({
                success: false,
                message: 'Group_Role not found',
                errorCode: 'GROUP_ROLE_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Group_Role updated successfully',
            data: updateGroup_Role
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

const deleteGroup_Role = async (req, res) => {
    try {
        const deleteGroup_Role = await groupRoleService.deleteGroup_Role(req.params.id);
        if (!deleteGroup_Role) {
            return res.status(404).json({
                success: false,
                message: 'Group_Role not found',
                errorCode: 'GROUP_ROLE_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Group_Role deleted successfully',
            data: deleteGroup_Role
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

const deleteAllGroup_Role = async (req, res) => {
    try {
        await groupRoleService.deleteAllGroup_Role();
        return res.status(200).json({
            success: true,
            message: 'All group_roles deleted successfully',
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
    createGroup_Role,
    getAllGroup_Roles,
    getGroup_RoleById,
    updateGroup_Role,
    deleteGroup_Role,
    deleteAllGroup_Role
};