import db from '../models';
import CryptoJS from 'crypto-js';
const { Op } = require('sequelize');

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

// Tìm camera theo bộ (ip, username, password) đã mã hóa
const findByCredentials = async ({ ip, username, password }) => {
    if (!ip || !username || !password) return null;
    // Tìm theo ip + username trước, sau đó giải mã password trong DB so sánh
    const candidates = await db.Camera.findAll({
        where: { ip, username },
        order: [['id', 'ASC']],
    });
    for (const cam of candidates) {
        try {
            const raw = decryptPassword(cam.password);
            if (raw === password) {
                return cam;
            }
        } catch (e) {
            // ignore and continue
        }
    }
    return null;
};

// So khớp đầy đủ các cột: userId, ip, username, password, port, address, haTemperatureEntityId, haHumidityEntityId
// Nếu đã tồn tại -> chỉ cập nhật updatedAt (touch) và trả về; nếu chưa -> tạo mới
const findOrCreateFullMatch = async (payload) => {
    const {
        userId = null,
        ip,
        username,
        password,
        port = null,
        address = null,
        haTemperatureEntityId = null,
        haHumidityEntityId = null,
    } = payload || {};

    if (!ip || !username || !password) return null;

    // Tìm theo các cột không phải password trước
    const candidates = await db.Camera.findAll({
        where: {
            userId: userId ?? { [Op.is]: null },
            ip,
            username,
            port: port ?? { [Op.is]: null },
            address: address ?? { [Op.is]: null },
            haTemperatureEntityId: haTemperatureEntityId ?? { [Op.is]: null },
            haHumidityEntityId: haHumidityEntityId ?? { [Op.is]: null },
        },
        order: [['id', 'ASC']],
    });

    for (const cam of candidates) {
        const raw = decryptPassword(cam.password);
        if (raw === password) {
            // Chỉ cập nhật updatedAt (touch)
            await cam.update({ updatedAt: new Date() });
            return cam;
        }
    }

    // Không có camera trùng hoàn toàn -> tạo mới (mã hóa password ở createCamera)
    return await createCamera(payload);
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
    getCameraCredentials,
    findByCredentials,
    findOrCreateFullMatch,
};