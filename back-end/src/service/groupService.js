import db from '../models';

const createGroup = async (payload) => {
    const group = await db.Group.create(payload);
    return group;
};

const getAllGroups = async ({ page, limit }) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await db.Group.findAndCountAll({
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

const getGroupById = async (id) => {
    return db.Group.findByPk(id);
}

const updateGroup = async (id, payload) => {
    const group = await db.Group.findByPk(id);
    if (!group) return null;
    await group.update(payload);
    return group;
};

const deleteGroup = async (id) => {
    const group = await db.Group.findByPk(id);
    if (!group) return null;
    await group.destroy();
    return group;
};

const deleteAllGroup = async () => {
    await db.Group.destroy({ where: {}, truncate: true });
}

// const assignRoleToGroup = async (groupId, roleId) => {
//     const group = await db.Group.findByPk(groupId);
//     const role = await db.Role.findByPk(roleId);
//     if (!group || !role) return null;
//     await group.addRole(role);
//     return group;;
// }

module.exports = {
    createGroup,
    getAllGroups,
    getGroupById,
    updateGroup,
    deleteGroup,
    deleteAllGroup,
    // assignRoleToGroup,
};