import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1/database';

const authHeader = () => {
  try {
    const raw = sessionStorage.getItem('account');
    if (!raw) return {};
    const acc = JSON.parse(raw);
    if (!acc?.token) return {};
    return { Authorization: `Bearer ${acc.token}` };
  } catch { return {}; }
};

export const getTables = async () => {
  const res = await axios.get(`${API_BASE}/tables`, { headers: authHeader() });
  return res.data;
};

export const getTablePage = async (table, page = 1, limit = 10) => {
  const res = await axios.get(`${API_BASE}/${encodeURIComponent(table)}`, {
    params: { page, limit },
    headers: authHeader(),
  });
  return res.data;
};

export const createRow = async (table, payload) => {
  const headers = (payload instanceof FormData) ? { 'Content-Type': 'multipart/form-data' } : undefined;
  const res = await axios.post(`${API_BASE}/${encodeURIComponent(table)}`, payload, { headers: { ...(headers || {}), ...authHeader() } });
  return res.data;
};

export const updateRow = async (table, id, payload) => {
  const headers = (payload instanceof FormData) ? { 'Content-Type': 'multipart/form-data' } : undefined;
  const res = await axios.put(`${API_BASE}/${encodeURIComponent(table)}/${encodeURIComponent(id)}`, payload, { headers: { ...(headers || {}), ...authHeader() } });
  return res.data;
};

export const deleteRow = async (table, id) => {
  const res = await axios.delete(`${API_BASE}/${encodeURIComponent(table)}/${encodeURIComponent(id)}`, { headers: authHeader() });
  return res.data;
};
