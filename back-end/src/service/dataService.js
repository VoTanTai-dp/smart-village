import db from '../models'

const createData = async (payload) => {
    const data = await db.Data.create(payload)
    return data
}

const getAllData = async ({ page, limit }) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await db.Data.findAndCountAll({
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

const getDataById = async (id) => {
    return await db.Data.findByPk(id);
};

const updateData = async (id, payload) => {
    const data = await db.Data.findByPk(id);
    if (!data) return null;
    await data.update(payload);
    return data;
}

const deleteData = async (id) => {
    const data = await db.Data.findByPk(id);
    if (!data) return null;
    await data.destroy();
    return data;
};

const deleteAllData = async () => {
    await db.Data.destroy({ where: {}, truncate: true });
}

module.exports = {
    createData,
    getAllData,
    getDataById,
    updateData,
    deleteAllData,
    deleteData
}