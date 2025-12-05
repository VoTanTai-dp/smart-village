import axios from "axios";

const registerNewUser = (email, phone, username, password) => {
    return axios.post('http://localhost:8080/api/v1/users', {
        email, phone, username, password
    }
    );
}

export {
    registerNewUser
};