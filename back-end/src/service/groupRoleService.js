import db from '../models';

const createGroup_Role = async (payload) => {
    const group_role = await db.Group_Role.create(payload);
    return group_role;
};

const getAllGroup_Roles = async ({ page, limit }) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await db.Group_Role.findAndCountAll({
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

const getGroup_RoleById = async (id) => {
    return db.Group_Role.findOne({
        where: {
            id: id
        }
    });
}

const updateGroup_Role = async (id, payload) => {
    const group_role = await db.Group_Role.findOne({
        where: {
            id: id
        }
    });
    if (!group_role) return null;
    await group_role.update(payload);
    return group_role;
};

const deleteGroup_Role = async (id) => {
    const group_role = await db.Group_Role.findOne({
        where: {
            id: id
        }
    });
    if (!group_role) return null;
    await group_role.destroy();
    return group_role;
};

const deleteAllGroup_Role = async () => {
    await db.Group_Role.destroy({ where: {}, truncate: true });
}

module.exports = {
    createGroup_Role,
    getAllGroup_Roles,
    getGroup_RoleById,
    updateGroup_Role,
    deleteGroup_Role,
    deleteAllGroup_Role
};