import roleService from '../service/roleService.js';

const createRole = async (req, res) => {
    try {
        const newRole = await roleService.createRole(req.body);
        return res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: newRole
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

const getAllRoles = async (req, res) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        if (!page || page <= 0) page = 1;
        if (!limit || limit <= 0) limit = 10;

        const allRoles = await roleService.getAllRoles({ page, limit });
        return res.status(200).json({
            success: true,
            message: 'Roles retrieved successfully',
            data: allRoles,
            meta: allRoles.meta
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

const getRoleById = async (req, res) => {
    try {
        const roleId = await roleService.getRoleById(req.params.id);
        if (!roleId) {
            return res.status(404).json({
                success: false,
                message: 'Role not found',
                errorCode: 'ROLE_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Get role successfully',
            data: roleId
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

const updateRole = async (req, res) => {
    try {
        const updateRole = await roleService.updateRole(req.params.id, req.body);
        if (!updateRole) {
            return res.status(404).json({
                success: false,
                message: 'Role not found',
                errorCode: 'ROLE_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            data: updateRole
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

const deleteRole = async (req, res) => {
    try {
        const deleteRole = await roleService.deleteRole(req.params.id);
        if (!deleteRole) {
            return res.status(404).json({
                success: false,
                message: 'Role not found',
                errorCode: 'ROLE_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Role deleted successfully',
            data: deleteRole
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

const deleteAllRole = async (req, res) => {
    try {
        await roleService.deleteAllRole();
        return res.status(200).json({
            success: true,
            message: 'All roles deleted successfully',
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
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    deleteAllRole
};