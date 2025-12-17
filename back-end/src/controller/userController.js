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

const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Missing email', errorCode: 'MISSING_EMAIL' });
        }
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_NOT_FOUND' });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Internal server error', errorCode: e.code || 'INTERNAL_SERVER_ERROR' });
    }
};

const updateUserInfo = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await userService.updateUserInfo(id, req.body);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_NOT_FOUND' });
        }
        return res.status(200).json({ success: true, message: 'User info updated', data: user });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Internal server error', errorCode: e.code || 'INTERNAL_SERVER_ERROR' });
    }
};

const changePassword = async (req, res) => {
    try {
        const id = req.params.id;
        const { oldPassword, newPassword } = req.body || {};
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Missing oldPassword/newPassword', errorCode: 'MISSING_PARAMS' });
        }
        const result = await userService.changePassword(id, oldPassword, newPassword);
        if (!result.ok) {
            if (result.reason === 'USER_NOT_FOUND') {
                return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_NOT_FOUND' });
            }
            if (result.reason === 'INVALID_OLD_PASSWORD') {
                return res.status(400).json({ success: false, message: 'Old password is incorrect', errorCode: 'INVALID_OLD_PASSWORD' });
            }
            return res.status(400).json({ success: false, message: 'Change password failed' });
        }
        return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Internal server error', errorCode: e.code || 'INTERNAL_SERVER_ERROR' });
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

const handleLogin = async (req, res) => {
    try {

        let data = await userService.handleUserLogin(req.body);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (error) {
        console.log(error);
        return {
            EM: 'Error from server',
            EC: '-1',
            DT: ''
        }
    }
};

const getUserByLogin = async (req, res) => {
    try {
        const { valueLogin } = req.query;
        if (!valueLogin) {
            return res.status(400).json({ success: false, message: 'Missing valueLogin', errorCode: 'MISSING_PARAM' });
        }
        const user = await userService.getUserByLogin(valueLogin);
        if (!user) return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_NOT_FOUND' });
        return res.status(200).json({ success: true, data: user });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Internal server error', errorCode: e.code || 'INTERNAL_SERVER_ERROR' });
    }
};

const updateAvatar = async (req, res) => {
    try {
        const id = req.params.id;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Missing file', errorCode: 'MISSING_FILE' });
        }
        // Build public path based on viewEngine static: src/public
        const relPath = `/uploads/${req.file.filename}`;
        const user = await userService.updateUser(id, { avatar: relPath });
        if (!user) return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_NOT_FOUND' });
        return res.status(200).json({ success: true, message: 'Avatar updated', data: { avatar: relPath } });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Internal server error', errorCode: e.code || 'INTERNAL_SERVER_ERROR' });
    }
};

export default {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    updateUserInfo,
    getUserByEmail,
    getUserByLogin,
    changePassword,
    deleteUser,
    deleteAllUsers,
    handleLogin,
    updateAvatar
};
