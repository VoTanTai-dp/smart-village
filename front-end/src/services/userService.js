import axios from "axios";

const registerNewUser = (email, phone, username, password) => {
    return axios.post('http://localhost:8080/api/v1/users', {
        email, phone, username, password
    }
    );
}

const loginUser = (valueLogin, password) => {
    return axios.post('http://localhost:8080/api/v1/users/login', {
        valueLogin, password
    }
    );
}

export {
    registerNewUser,
    loginUser
};