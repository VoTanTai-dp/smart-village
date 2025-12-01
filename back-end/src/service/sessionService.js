import db from '../models';

const createSession = async (payload) => {
    const session = await db.Session.create(payload);
    return session;
}

const getAllSessions = async ({ page, limit }) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await db.Session.findAndCountAll({
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

const getSessionById = async (id) => {
    return db.Session.findByPk(id);
}

const updateSession = async (id, payload) => {
    const session = await db.Session.findByPk(id);
    if (!session) return null;
    await session.update(payload);
    return session;
}

const deleteSessionById = async (id) => {
    const session = await db.Session.findByPk(id);
    if (!session) return null;
    await session.destroy();
    return session;
}

const deleteAllSessions = async () => {
    await db.Session.destroy({ where: {}, truncate: true });
}

module.exports = {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSessionById,
    deleteAllSessions,
};