import db from '../models';
import CryptoJS from 'crypto-js';

// KHÓA BÍ MẬT (Nên để trong file .env)
const SECRET_KEY = process.env.SECRET_KEY;

// Hàm mã hóa (Dùng khi tạo/sửa camera)
const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
};

// Hàm giải mã (Dùng khi lấy pass để kết nối RTSP)
const decryptPassword = (encryptedPassword) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

const createCamera = async (payload) => {
    // Mã hóa mật khẩu trước khi lưu
    if (payload.password) {
        payload.password = encryptPassword(payload.password);
    }
    const camera = await db.Camera.create(payload);
    return camera;
};

const getAllCameras = async ({ page, limit }) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await db.Camera.findAndCountAll({
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
}

const getCameraById = async (id) => {
    return await db.Camera.findByPk(id);
};

// Hàm lấy thông tin kết nối (đã giải mã pass) cho Controller
const getCameraCredentials = async (id) => {
    const camera = await db.Camera.findByPk(id);
    if (!camera) return null;

    // Giải mã mật khẩu để sử dụng
    const rawPassword = decryptPassword(camera.password);

    // Trả về object clone với password đã giải mã
    return {
        ...camera.get({ plain: true }),
        password: rawPassword
    };
};

const updateCamera = async (id, payload) => {
    const camera = await db.Camera.findByPk(id);
    if (!camera) return null;

    // Nếu có đổi password thì mã hóa lại
    if (payload.password) {
        payload.password = encryptPassword(payload.password);
    }

    await camera.update(payload);
    return camera;
}

const deleteCamera = async (id) => {
    const camera = await db.Camera.findByPk(id);
    if (!camera) return null;
    await camera.destroy();
    return camera;
};

const deleteAllCameras = async () => {
    await db.Camera.destroy({ where: {}, truncate: true });
}

module.exports = {
    createCamera,
    getAllCameras,
    getCameraById,
    updateCamera,
    deleteCamera,
    deleteAllCameras,
    getCameraCredentials
};