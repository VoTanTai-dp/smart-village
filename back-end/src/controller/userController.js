import userService from '../service/userService.js';

const createUser = async (req, res) => {
    try {
        // console.log("Body data:", req.body); // Log để debug xem đã nhận được text chưa
        // console.log("File data:", req.file); // Log để xem file ảnh (nếu có)

        if (!req.body.email || !req.body.phone || !req.body.password || !req.body.username) {
            return res.status(200).json({
                EM: 'Missing required fields',
                EC: '1',
                DT: ''
            });
        }

        const newUser = await userService.createUser(req.body);
        return res.status(201).json({
            EM: newUser.EM,
            EC: newUser.EC,
            DT: ''
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            EM: 'Internal server error',
            EC: '-1',
            DT: ''
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);

        //Kiểm tra giá trị hợp lệ (tránh lỗi NaN)
        // Nếu không truyền hoặc truyền sai, dùng giá trị mặc định
        if (!page || page <= 0) page = 1;
        if (!limit || limit <= 0) limit = 10;

        const allUsers = await userService.getAllUsers({ page, limit });
        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: allUsers,
            meta: allUsers.meta
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

const getUserById = async (req, res) => {
    try {
        const userId = await userService.getUserById(req.params.id);
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                errorCode: 'USER_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Get user successfully',
            data: userId
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

const updateUser = async (req, res) => {
    try {
        const updateUser = await userService.updateUser(req.params.id, req.body);
        if (!updateUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                errorCode: 'USER_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updateUser
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

const deleteUser = async (req, res) => {
    try {
        const deleteUser = await userService.deleteUser(req.params.id);
        if (!deleteUser) return res.status(404).json({
            success: false,
            message: 'User not found',
            errorCode: 'USER_NOT_FOUND'
        });
        return res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: deleteUser
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

const deleteAllUsers = async (req, res) => {
    try {
        await userService.deleteAllUsers();
        return res.status(200).json({
            success: true,
            message: 'All users deleted successfully'
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

export default {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    deleteAllUsers
};
