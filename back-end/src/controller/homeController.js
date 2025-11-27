import userService from '../service/userService.js';

const handleHelloWorld = (req, res) => {
    return res.render('home.ejs');
}

const handleUserPage = async (req, res) => {
    let userList = await userService.getUserList();

    return res.render('user.ejs', { userList });
}

const handleCreateNewUser = (req, res) => {
    // Logic to handle user creation goes here
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;

    userService.createNewUser(email, username, password);

    return res.redirect('/user');
}

const handleDeleteUser = async (req, res) => {
    let userId = req.params.id;
    await userService.deleteUser(userId);
    return res.redirect('/user');
}

const getUpdateUserPage = async (req, res) => {
    let id = req.params.id;
    let user = await userService.getUserById(id);
    let userData = {};
    userData = user;
    // if (user && user.length > 0) {
    //     userData = user[0];
    // }
    return res.render('user-update.ejs', { userData });
}

const handleUpdateUser = async (req, res) => {
    let id = req.body.id;
    let email = req.body.email;
    let username = req.body.username;

    // Logic to update the user in the database goes here
    await userService.updateUserInfor(id, email, username);

    return res.redirect('/user');
}

module.exports = {
    handleHelloWorld,
    handleUserPage,
    handleCreateNewUser,
    handleDeleteUser,
    getUpdateUserPage,
    handleUpdateUser
};