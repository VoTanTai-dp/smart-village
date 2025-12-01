import db from '../models';

const createCamera_Model = async (payload) => {
    const camera_model = await db.Camera_Model.create(payload);
    return camera_model;
};

const getAllCamera_Models = async ({ page, limit }) => {
    const offset = (page - 1) * limit;
    const { rows, camera_model } = await db.Camera_Model.findAndCountAll({
        offset,
        limit,
        order: [['id', 'ASC']],
    });
    return {
        data: rows,
        meta: {
            page,
            limit,
            total: camera_model,
            totalPages: Math.ceil(camera_model / limit),
        },
    };
}

const getCamera_ModelById = async (id) => {
    return db.Camera_Model.findByPk(id);
}

const updateCamera_Model = async (id, payload) => {
    const camera_model = await db.Camera_Model.findByPk(id);
    if (!camera_model) return null;
    await camera_model.update(payload);
    return camera_model;
};

const deleteCamera_Model = async (id) => {
    const camera_model = await db.Camera_Model.findByPk(id);
    if (!camera_model) return null;
    await camera_model.destroy();
    return camera_model;
};

const deleteAllCamera_Model = async () => {
    await db.Camera_Model.destroy({ where: {}, truncate: true });
}

module.exports = {
    createCamera_Model,
    getAllCamera_Models,
    getCamera_ModelById,
    updateCamera_Model,
    deleteCamera_Model,
    deleteAllCamera_Model
};