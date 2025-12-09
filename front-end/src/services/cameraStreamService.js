import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1';

const getCameras = async () => {
    const res = await axios.get(`${API_BASE}/cameras`);
    return res.data?.data?.data || res.data?.data || [];
};

const createCamera = async ({ ip, username, password, port, address }) => {
    const res = await axios.post(`${API_BASE}/cameras`, {
        ip,
        username,
        password,
        port,
        address,
    });
    return res.data?.data;
};

const startCameraStream = async (cameraId) => {
    const res = await axios.post(`${API_BASE}/cameras/${cameraId}/stream/start`);
    return res.data;
};

// Dùng cho "stop tất cả" khi unmount
const stopCameraStream = async () => {
    const res = await axios.post(`${API_BASE}/cameras/stream/stop-all`);
    return res.data;
};

// Stop stream 1 camera
const stopSingleCameraStream = async (cameraId) => {
    const res = await axios.post(
        `${API_BASE}/cameras/${cameraId}/stream/stop`
    );
    return res.data;
};

// Xóa camera khỏi database
const deleteCamera = async (cameraId) => {
    const res = await axios.delete(`${API_BASE}/cameras/${cameraId}`);
    return res.data;
};

export {
    getCameras,
    createCamera,
    startCameraStream,
    stopCameraStream,
    stopSingleCameraStream,
    deleteCamera,
};
