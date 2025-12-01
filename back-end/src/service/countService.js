import db from '../models';

const createCount = async (payload) => {
    const count = await db.Count.create(payload);
    return count;
};

const getAllCounts = async ({ page, limit }) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await db.Count.findAndCountAll({
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

const getCountById = async (id) => {
    return db.Count.findByPk(id);
}

const updateCount = async (id, payload) => {
    const count = await db.Count.findByPk(id);
    if (!count) return null;
    await count.update(payload);
    return count;
};

const deleteCount = async (id) => {
    const count = await db.Count.findByPk(id);
    if (!count) return null;
    await count.destroy();
    return count;
};

const deleteAllCount = async () => {
    await db.Count.destroy({ where: {}, truncate: true });
}

module.exports = {
    createCount,
    getAllCounts,
    getCountById,
    updateCount,
    deleteCount,
    deleteAllCount
};