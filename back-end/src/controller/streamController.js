import streamService from '../service/streamService';
import cameraService from '../service/cameraService.js';
import sessionService from '../service/sessionService.js';
import sensorService from '../service/sensorService.js';
import config from '../config/stream.config';

const healthCheck = async (req, res) => {
    return res.json({ status: 'Backend API OK' });
};

// Start stream + tạo session + sensor job
const startStream = async (req, res) => {
    try {
        const { id } = req.params;
        const cameraId = Number(id);

        const camera = await cameraService.getCameraCredentials(cameraId);
        if (!camera) {
            return res.status(404).json({
                success: false,
                message: 'Camera not found',
                errorCode: 'CAMERA_NOT_FOUND',
            });
        }

        const username = camera.username;
        const password = camera.password;
        const ip = camera.ip;
        const port = camera.port || 554;

        if (!username || !password || !ip || !port) {
            return res.status(400).json({
                success: false,
                message: 'Missing camera connection information',
                errorCode: 'MISSING_CAMERA_INFO',
            });
        }

        const candidateUrls = [
            `rtsp://${username}:${encodeURIComponent(password)}@${ip}:${port}/ch01/0`,
            `rtsp://${username}:${encodeURIComponent(password)}@${ip}:${port}/cam/realmonitor?channel=1&subtype=0`,
        ];

        console.log(`>>> Received candidate RTSP URLs (Camera ${cameraId}):`, candidateUrls);

        const startResult = await streamService.startStreaming(cameraId, candidateUrls);
        const rtspUrl = startResult?.url || candidateUrls[0];

        // Session: ưu tiên session đang mở, nếu chưa có thì tạo mới
        let session =
            await sessionService.getActiveSessionForCamera(cameraId);
        if (!session) {
            session = await sessionService.createSessionForCamera(cameraId);
            console.log(
                `>>> Created new session ${session.id} for camera ${cameraId}`
            );
        } else {
            console.log(
                `>>> Reuse active session ${session.id} for camera ${cameraId}`
            );
        }

        // Sensor job real-time
        if (session && session.id) {
            // camera là instance Sequelize; dùng .get({plain:true}) hoặc dùng trực tiếp
            await sensorService.startSensorJobForCamera({
                sessionId: session.id,
                camera,
            });
            // Counter job real-time
            try {
                const counterService = require('../service/counterService');
                const cameraService = require('../service/cameraService');
                const creds = await cameraService.getCameraCredentials(camera.id);
                await counterService.startCounterJobForCamera({
                    sessionId: session.id,
                    camera: creds || camera,
                });
            } catch (e) {
                console.error('>>> Start counter job error:', e);
            }
        }

        return res.json({
            success: true,
            message: '>>> Stream started',
            rtspUrl,
            wsUrl: `ws://localhost:${config.wsPort}`, // video WS
            sensorWsUrl: `ws://localhost:${process.env.SENSOR_WS_PORT || 9998}`, // sensor WS
            counterWsUrl: `ws://localhost:${process.env.COUNTER_WS_PORT || 9997}`, // counter WS
            sessionId: session?.id || null,
        });
    } catch (err) {
        console.error('>>> Start stream error:', err);
        return res.status(500).json({
            success: false,
            message: 'Start stream failed',
            error: err.message,
        });
    }
};

const stopStream = async (req, res) => {
    try {
        const { id } = req.params;
        const cameraId = Number(id);

        // Kết thúc session đang mở và stop sensor job
        const activeSession =
            await sessionService.getActiveSessionForCamera(cameraId);
        if (activeSession) {
            const ended =
                await sessionService.endSessionById(activeSession.id);
            sensorService.stopSensorJobBySessionId(activeSession.id);
            try {
                const counterService = require('../service/counterService');
                counterService.stopCounterJobBySessionId(activeSession.id);
            } catch (e) {
                console.error('>>> Stop counter job error:', e.message);
            }

            console.log(
                `>>> End session ${ended.id} for camera ${cameraId} at ${ended.endDate}`
            );
        }

        await streamService.stopStreaming(cameraId);

        return res.json({
            success: true,
            message: `>>> Stopped streaming camera ${cameraId}`,
        });
    } catch (err) {
        console.error('>>> Stop stream error:', err);
        return res.status(500).json({
            success: false,
            message: 'Stop stream failed',
            error: err.message,
        });
    }
};

const stopAllStreams = async (req, res) => {
    try {
        const activeIds = streamService.getActiveCameraIds();

        if (Array.isArray(activeIds) && activeIds.length > 0) {
            for (const cameraId of activeIds) {
                const activeSession =
                    await sessionService.getActiveSessionForCamera(
                        cameraId
                    );
                if (activeSession) {
                    const ended =
                        await sessionService.endSessionById(
                            activeSession.id
                        );
                    sensorService.stopSensorJobBySessionId(
                        activeSession.id
                    );
                    counterService.stopCountingBySessionId(
                        activeSession.id
                    );
                    console.log(
                        `>>> End session ${ended.id} for camera ${cameraId} when stopAll`
                    );
                }
            }
        }

        await streamService.stopAllStreams();

        return res.json({
            success: true,
            message: 'Stopped streaming',
        });
    } catch (err) {
        console.error('>>> Stop all streams error:', err);
        return res.status(500).json({
            success: false,
            message: 'Stop all streams failed',
            error: err.message,
        });
    }
};

const getStreamingCameras = (req, res) => {
    try {
        const activeIds = streamService.getActiveCameraIds();
        return res.json({
            success: true,
            data: activeIds,
        });
    } catch (err) {
        console.error('>>> Get streaming cameras error:', err);
        return res.status(500).json({
            success: false,
            message: 'Get streaming cameras failed',
            error: err.message,
        });
    }
};

// Connect stream bằng credentials (ưu tiên tái sử dụng camera cũ nếu đã tồn tại)
const connectStreamByCredentials = async (req, res) => {
    try {
        let { ip, username, password, port, address, haTemperatureEntityId, haHumidityEntityId, userId } = req.body || {};

        // Chuẩn hóa input: trim và chuyển chuỗi rỗng thành null
        const normalize = (v) => {
            if (v === undefined || v === null) return null;
            if (typeof v === 'string') {
                const t = v.trim();
                return t.length ? t : null;
            }
            return v;
        };
        ip = normalize(ip);
        username = normalize(username);
        password = normalize(password);
        port = normalize(port);
        address = normalize(address);
        haTemperatureEntityId = normalize(haTemperatureEntityId);
        haHumidityEntityId = normalize(haHumidityEntityId);
        userId = normalize(userId);

        if (!ip || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields (ip, username, password)',
                errorCode: 'MISSING_CAMERA_INFO',
            });
        }

        // B1: Tìm camera theo ip+username+password (bỏ qua các trường tùy chọn)
        let cameraRow = await cameraService.findByCredentials({ ip, username, password });

        if (cameraRow) {
            // Nếu có camera cũ -> cập nhật các trường tùy chọn nếu truyền vào
            const updatePayload = {};
            if (port !== null) updatePayload.port = String(port);
            if (address !== null) updatePayload.address = address;
            if (haTemperatureEntityId !== null) updatePayload.haTemperatureEntityId = haTemperatureEntityId;
            if (haHumidityEntityId !== null) updatePayload.haHumidityEntityId = haHumidityEntityId;
            if (userId !== null) updatePayload.userId = userId;
            if (Object.keys(updatePayload).length > 0) {
                cameraRow = await cameraService.updateCamera(cameraRow.id, updatePayload) || cameraRow;
            }
        } else {
            // Không có -> tạo mới
            cameraRow = await cameraService.createCamera({
                userId: userId ?? null,
                ip,
                username,
                password, // createCamera sẽ mã hóa pass
                port: port !== null ? String(port) : null,
                address,
                haTemperatureEntityId,
                haHumidityEntityId,
            });
        }

        const cameraId = Number(cameraRow.id);

        // Lấy credentials đã giải mã để build RTSP
        const camera = await cameraService.getCameraCredentials(cameraId);
        if (!camera) {
            return res.status(404).json({
                success: false,
                message: 'Camera not found after create/find',
                errorCode: 'CAMERA_NOT_FOUND',
            });
        }

        const user = camera.username;
        const pass = camera.password;
        const camIp = camera.ip;
        const camPort = camera.port || 554;

        const candidateUrls = [
            `rtsp://${user}:${encodeURIComponent(pass)}@${camIp}:${camPort}/ch01/0`,
            `rtsp://${user}:${encodeURIComponent(pass)}@${camIp}:${camPort}/cam/realmonitor?channel=1&subtype=0`,
        ];

        const startResult = await streamService.startStreaming(cameraId, candidateUrls);
        const rtspUrl = startResult?.url || candidateUrls[0];

        // Session: ưu tiên session đang mở, nếu chưa có thì tạo
        let session = await sessionService.getActiveSessionForCamera(cameraId);
        if (!session) {
            session = await sessionService.createSessionForCamera(cameraId);
            console.log(`>>> Created new session ${session.id} for camera ${cameraId}`);
        } else {
            console.log(`>>> Reuse active session ${session.id} for camera ${cameraId}`);
        }

        // Sensor job real-time and Counter job
        if (session && session.id) {
            await sensorService.startSensorJobForCamera({
                sessionId: session.id,
                camera,
            });
            // Counter job real-time as well for credential-connect path
            try {
                const counterService = require('../service/counterService');
                const cameraService = require('../service/cameraService');
                const creds = await cameraService.getCameraCredentials(camera.id);
                await counterService.startCounterJobForCamera({
                    sessionId: session.id,
                    camera: creds || camera,
                });
            } catch (e) {
                console.error('>>> Start counter job (connect path) error:', e);
            }
        }

        return res.json({
            success: true,
            message: '>>> Stream connected',
            cameraId,
            rtspUrl,
            wsUrl: `ws://localhost:${config.wsPort}`,
            sensorWsUrl: `ws://localhost:${process.env.SENSOR_WS_PORT || 9998}`,
            counterWsUrl: `ws://localhost:${process.env.COUNTER_WS_PORT || 9997}`,
            sessionId: session?.id || null,
        });
    } catch (err) {
        console.error('>>> Connect stream by credentials error:', err);
        return res.status(500).json({
            success: false,
            message: 'Connect stream failed',
            error: err.message,
        });
    }
};

module.exports = {
    healthCheck,
    startStream,
    stopStream,
    stopAllStreams,
    getStreamingCameras,
    connectStreamByCredentials,
};
