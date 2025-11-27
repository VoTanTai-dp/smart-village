import userService from '../service/userService.js';

const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        return res.status(201).json(user);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).json(users);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(user);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(user);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const ok = await userService.deleteUser(req.params.id);
        if (!ok) return res.status(404).json({ message: 'User not found' });
        return res.status(204).send();
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteAllUsers = async (req, res) => {
    try {
        await userService.deleteAllUsers();
        return res.status(204).send();
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export default {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    deleteAllUsers
};
