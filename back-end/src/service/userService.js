import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import Bluebird from 'bluebird';
import db from '../models';
import { raw } from 'body-parser';

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (password) => {
    let hashPassword = bcrypt.hashSync(password, salt);
    return hashPassword;
}

const createNewUser = async (email, username, password) => {
    let hashPass = hashUserPassword(password);

    try {
        await db.User.create({
            email: email,
            username: username,
            password: hashPass
        })
    } catch (error) {
        console.log(error);
    }
}

const getUserList = async () => {
    //Test relational db with ORM
    // let newUser = await db.User.findOne({
    //     where: { id: 1 },
    //     attributes: ["id", "email", "username"],
    //     include: { model: db.Group, attributes: ["id", "groupname"] },
    //     raw: true,
    //     nest: true
    // })
    // console.log('>>> Check new user: ', newUser);


    let users = [];
    users = await db.User.findAll();
    return users;

    // Create a connection to the database with Promise support using Bluebird
    // const connection = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'smartvillage', Promise: Bluebird });
    // try {
    //     const [rows, fields] = await connection.execute('SELECT * FROM users');
    //     return rows;
    // } catch (error) {
    //     console.log(error);
    // }
}

const deleteUser = async (userId) => {
    await db.User.destroy({
        where: { id: userId }
    });

    // Create a connection to the database with Promise support using Bluebird
    // const connection = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'smartvillage', Promise: Bluebird });
    // try {
    //     const [rows, fields] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    //     return rows;
    // } catch (error) {
    //     console.log(error);
    // }
}

const getUserById = async (id) => {
    let user = {};
    user = await db.User.findOne({
        where: { id: id }
    });
    return user.get({ plain: true });
    // const connection = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'smartvillage', Promise: Bluebird });
    // try {
    //     const [rows, fields] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
    //     return rows;
    // } catch (error) {
    //     console.log(error);
    // }
}

const updateUserInfor = async (id, email, username) => {
    await db.User.update(
        { email: email, username: username },
        { where: { id: id } }
    );
    // const connection = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'smartvillage', Promise: Bluebird });
    // try {
    //     const [rows, fields] = await connection.execute('UPDATE users SET email = ?, username = ?  WHERE id = ?', [email, username, id]);
    //     return rows;
    // } catch (error) {
    //     console.log(error);
    // }
}

module.exports = {
    createNewUser,
    getUserList,
    deleteUser,
    getUserById,
    updateUserInfor
};
