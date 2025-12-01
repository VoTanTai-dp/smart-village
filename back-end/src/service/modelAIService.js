import db from '../models';

const createModelAI = async (payload) => {
    const modelAI = await db.ModelAI.create(payload);
    return modelAI;
};

const getAllModelAIs = async ({ page, limit }) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await db.ModelAI.findAndCountAll({
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

const getModelAIById = async (id) => {
    return db.ModelAI.findByPk(id);
}

const updateModelAI = async (id, payload) => {
    const modelAI = await db.ModelAI.findByPk(id);
    if (!modelAI) return null;
    await modelAI.update(payload);
    return modelAI;
};

const deleteModelAI = async (id) => {
    const modelAI = await db.ModelAI.findByPk(id);
    if (!modelAI) return null;
    await modelAI.destroy();
    return modelAI;
};

const deleteAllModelAI = async () => {
    await db.ModelAI.destroy({ where: {}, truncate: true });
}

module.exports = {
    createModelAI,
    getAllModelAIs,
    getModelAIById,
    updateModelAI,
    deleteModelAI,
    deleteAllModelAI
};