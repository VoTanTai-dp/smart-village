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

        const rtspUrl = `rtsp://${username}:${encodeURIComponent(
            password
        )}@${ip}:${port}/cam/realmonitor?channel=1&subtype=0`;

        console.log(`>>> Received RTSP URL (Camera ${cameraId}): ${rtspUrl}`);

        // Start video stream
        await streamService.startStreaming(cameraId, rtspUrl);

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
        }

        return res.json({
            success: true,
            message: '>>> Stream started',
            rtspUrl,
            wsUrl: `ws://localhost:${config.wsPort}`, // video WS
            sensorWsUrl: `ws://localhost:${process.env.SENSOR_WS_PORT || 9998}`, // sensor WS
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

module.exports = {
    healthCheck,
    startStream,
    stopStream,
    stopAllStreams,
    getStreamingCameras,
};
