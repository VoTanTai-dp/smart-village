import db from '../models';

const createRole = async (payload) => {
    const role = await db.Role.create(payload);
    return role;
};

const getAllRoles = async ({ page, limit }) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await db.Role.findAndCountAll({
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

const getRoleById = async (id) => {
    return db.Role.findByPk(id);
}

const updateRole = async (id, payload) => {
    const role = await db.Role.findByPk(id);
    if (!role) return null;
    await role.update(payload);
    return role;
};

const deleteRole = async (id) => {
    const role = await db.Role.findByPk(id);
    if (!role) return null;
    await role.destroy();
    return role;
};

const deleteAllRole = async () => {
    await db.Role.destroy({ where: {}, truncate: true });
}

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    deleteAllRole
};