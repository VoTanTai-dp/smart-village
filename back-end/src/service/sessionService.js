import db from '../models';

const createSession = async (payload) => {
    const session = await db.Session.create(payload);
    return session;
};

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
};

const getSessionById = async (id) => {
    return db.Session.findByPk(id);
};

const updateSession = async (id, payload) => {
    const session = await db.Session.findByPk(id);
    if (!session) return null;
    await session.update(payload);
    return session;
};

const deleteSessionById = async (id) => {
    const session = await db.Session.findByPk(id);
    if (!session) return null;
    await session.destroy();
    return session;
};

const deleteAllSessions = async () => {
    await db.Session.destroy({ where: {}, truncate: true });
};

// Session đang mở của 1 camera (endDate = null)
const getActiveSessionForCamera = async (cameraId) => {
    return db.Session.findOne({
        where: { cameraId, endDate: null },
        order: [['startDate', 'DESC']],
    });
};

// Tạo session mới cho camera
const createSessionForCamera = async (cameraId) => {
    const now = new Date().toISOString();
    const session = await db.Session.create({
        cameraId,
        startDate: now,
        endDate: null,
    });
    return session;
};

// Set endDate cho session
const endSessionById = async (id) => {
    const session = await db.Session.findByPk(id);
    if (!session) return null;
    session.endDate = new Date().toISOString();
    await session.save();
    return session;
};

// Kết thúc session đang mở của 1 camera
const endActiveSessionForCamera = async (cameraId) => {
    const active = await getActiveSessionForCamera(cameraId);
    if (!active) return null;
    return endSessionById(active.id);
};

module.exports = {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSessionById,
    deleteAllSessions,
    getActiveSessionForCamera,
    createSessionForCamera,
    endSessionById,
    endActiveSessionForCamera,
};
