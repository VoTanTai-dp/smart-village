import db from '../models';
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (password) => {
    let hashPassword = bcrypt.hashSync(password, salt);
    return hashPassword;
}

const createCamera = async (payload) => {
    let hassPass = hashUserPassword(payload.password);
    payload.password = hassPass;

    const camera = await db.Camera.create({ payload });
    return camera;
};

const getAllCameras = async ({ page, limit }) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await db.Camera.findAndCountAll({
        offset,
        limit,
        order: [['id', 'ASC']],
    });
    return {
        data: rows,
        meta: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        },
    };
}

const getCameraById = async (id) => {
    return await Camera.findByPk(id);
};

const updateCamera = async (id, payload) => {
    const camera = await db.Camera.findByPk(id);
    if (!camera) return null;
    await camera.update(payload);
    return camera;
}

const deleteCamera = async (id) => {
    const camera = await db.Camera.findByPk(id);
    if (!camera) return null;
    await camera.destroy();
    return camera;
};

const deleteAllCameras = async () => {
    await db.Camera.destroy({ where: {}, truncate: true });
}

module.exports = {
    createCamera,
    getAllCameras,
    getCameraById,
    updateCamera,
    deleteCamera,
    deleteAllCameras,
};