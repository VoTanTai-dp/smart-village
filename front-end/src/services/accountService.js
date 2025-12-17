import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1';

const getUserByEmail = async (email) => {
  return axios.get(`${API_BASE}/users/by-email`, { params: { email } });
};

const updateUserInfo = async (id, payload) => {
  return axios.put(`${API_BASE}/users/${id}/info`, payload);
};

const changePassword = async (id, oldPassword, newPassword) => {
  return axios.post(`${API_BASE}/users/${id}/change-password`, { oldPassword, newPassword });
};

const getUserByLogin = async (valueLogin) => {
  return axios.get(`${API_BASE}/users/by-login`, { params: { valueLogin } });
};

const uploadAvatar = async (id, file) => {
  const form = new FormData();
  form.append('avatar', file);
  return axios.post(`${API_BASE}/users/${id}/avatar`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export { getUserByEmail, getUserByLogin, updateUserInfo, changePassword, uploadAvatar };
