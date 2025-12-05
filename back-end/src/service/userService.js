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

const checkUserEmailExists = async (email) => {
    let user = await db.User.findOne({
        where: { email: email }
    });
    if (user) {
        return true;
    }
    return false;
}

const checkPhoneExists = async (phone) => {
    let user = await db.User.findOne({
        where: { phone: phone }
    });
    if (user) {
        return true;
    }
    return false;
}

const createUser = async (payload) => {
    try {
        //checkemail/phone number exists
        let isEmailExists = await checkUserEmailExists(payload.email);
        if (isEmailExists === true) {
            return {
                EM: 'Email already exists',
                EC: '1',
                DT: ''
            }
        }
        let isPhoneExists = await checkPhoneExists(payload.phone);
        if (isPhoneExists === true) {
            return {
                EM: 'Phone number already exists',
                EC: '1',
                DT: ''
            }
        }

        // hash password
        let hashPass = hashUserPassword(payload.password);

        // create user
        await db.User.create({
            email: payload.email,
            username: payload.username,
            phone: payload.phone,
            password: hashPass
        });

        return {
            EM: 'Create user successfully',
            EC: '0',
            DT: ''
        };
    } catch (error) {
        console.log(error);
        return {
            EM: 'Error from server',
            EC: '-1',
            DT: ''
        }
    }

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
    let hashPass = hashUserPassword(payload.password);
    payload.password = hashPass;
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
