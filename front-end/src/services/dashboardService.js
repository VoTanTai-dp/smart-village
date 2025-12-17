import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1';

const getSensorDashboard = async () => {
    const res = await axios.get(`${API_BASE}/dashboard/sensors`);
    return res.data?.data || [];
};

export { getSensorDashboard };
