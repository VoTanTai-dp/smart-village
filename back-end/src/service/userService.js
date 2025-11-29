import db from '../models';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import Bluebird from 'bluebird';
import { raw } from 'body-parser';

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (password) => {
    let hashPassword = bcrypt.hashSync(password, salt);
    return hashPassword;
}

// const createNewUser = async (email, username, password) => {
//     let hashPass = hashUserPassword(password);

//     try {
//         await db.User.create({
//             email: email,
//             username: username,
//             password: hashPass
//         })
//     } catch (error) {
//         console.log(error);
//     }
// }

const createUser = async (payload) => {
    let hashPass = hashUserPassword(payload.password);
    payload.password = hashPass;
    const user = await db.User.create(payload);
    return user;
};

const getAllUsers = async ({ page, limit }) => {
    const offset = (page - 1) * limit;

    const { rows, count } = await db.User.findAndCountAll({
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

const getUserById = async (id) => {
    return db.User.findByPk(id);
};

const updateUser = async (id, payload) => {
    const user = await db.User.findByPk(id);
    if (!user) return null;
    if (payload.password) {
        let hashPass = hashUserPassword(payload.password);
        payload.password = hashPass;
    }
    await user.update(payload);
    return user;
};

const deleteUser = async (id) => {
    const user = await db.User.findByPk(id);
    if (!user) return false;
    await user.destroy();
    return true;
};

const deleteAllUsers = async () => {
    await db.User.destroy({ where: {}, truncate: true });
}

// const getUserList = async () => {
//     let users = [];
//     users = await db.User.findAll();
//     return users;
// }

// const deleteUser = async (userId) => {
//     await db.User.destroy({
//         where: { id: userId }
//     });
// }

// const getUserById = async (id) => {
//     let user = {};
//     user = await db.User.findOne({
//         where: { id: id }
//     });
//     return user.get({ plain: true });
// }

// const updateUserInfor = async (id, email, username) => {
//     await db.User.update(
//         { email: email, username: username },
//         { where: { id: id } }
//     );
// }

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    deleteAllUsers,
    // createNewUser,
    // getUserList,
    // updateUserInfor
};
