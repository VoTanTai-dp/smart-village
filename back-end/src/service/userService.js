import db from '../models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import Bluebird from 'bluebird';
import { raw } from 'body-parser';
import { Op } from 'sequelize';

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
    // Nếu có password thì hash, còn không thì bỏ qua
    if (payload.password) {
        let hashPass = hashUserPassword(payload.password);
        payload.password = hashPass;
    } else {
        delete payload.password;
    }
    await user.update(payload);
    return user;
};

// Cập nhật thông tin không đổi mật khẩu
const updateUserInfo = async (id, payload) => {
    const user = await db.User.findByPk(id);
    if (!user) return null;
    const { email, username, phone, sex } = payload;
    await user.update({ email, username, phone, sex });
    return user;
};

const getUserByEmail = async (email) => {
    return db.User.findOne({ where: { email }, include: [{ model: db.Group, attributes: ['description'] }] });
};

const changePassword = async (id, oldPassword, newPassword) => {
    const user = await db.User.findByPk(id);
    if (!user) return { ok: false, reason: 'USER_NOT_FOUND' };
    const ok = checkPassword(oldPassword, user.password);
    if (!ok) return { ok: false, reason: 'INVALID_OLD_PASSWORD' };
    const hash = hashUserPassword(newPassword);
    user.password = hash;
    await user.save();
    return { ok: true };
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

const checkPassword = (inputPassword, hashPass) => {
    return bcrypt.compareSync(inputPassword, hashPass); //true or false
}

const getUserByLogin = async (valueLogin) => {
    return db.User.findOne({
        where: {
            [Op.or]: [
                { email: valueLogin },
                { phone: valueLogin }
            ]
        },
        include: [{ model: db.Group, attributes: ['description'] }]
    });
};

const handleUserLogin = async (payload) => {
    try {
        let user = await db.User.findOne({
            where: {
                [Op.or]: [
                    { email: payload.valueLogin },
                    { phone: payload.valueLogin }
                ]
            },
            include: [{ model: db.Group, attributes: ['id', 'groupname', 'description'] }]
        })

        if (user) {
            let isCorrectPassword = checkPassword(payload.password, user.password);

            if (isCorrectPassword === true) {
                const secret = process.env.JWT_SECRET || 'smartvillage_secret';
                const payloadJWT = {
                    id: user.id,
                    email: user.email,
                    groupId: user.groupId,
                };
                const token = jwt.sign(payloadJWT, secret, { expiresIn: '7d' });
                return {
                    EM: 'Login successfully',
                    EC: '0',
                    DT: {
                        token,
                        user: {
                            id: user.id,
                            email: user.email,
                            username: user.username,
                            phone: user.phone,
                            groupId: user.groupId,
                            group: user.Group ? { id: user.Group.id, groupname: user.Group.groupname } : null,
                            avatar: user.avatar,
                        }
                    }
                }
            }
        }

        console.log('>>> Not found email/phone number', payload.valueLogin, 'password', payload.password);

        return {
            EM: 'Your email/phone number or password is incorrect',
            EC: '1',
            DT: ''
        }

    } catch (error) {
        console.log(error);
        return {
            EM: 'Error from server',
            EC: '-1',
            DT: ''
        }
    }
}

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    updateUserInfo,
    getUserByEmail,
    changePassword,
    deleteUser,
    deleteAllUsers,
    checkPassword,
    handleUserLogin,
    getUserByLogin
};
