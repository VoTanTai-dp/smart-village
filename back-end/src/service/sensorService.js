import axios from 'axios';
import WebSocket from 'ws';
import dataService from './dataService.js';
import sensorConfig from '../config/sensor.config';
import db from '../models';

const HA_HOST = process.env.HA_HOST || 'http://localhost:8123';
const HA_TOKEN = process.env.HA_TOKEN;
const HA_DEVICE_TEMP = process.env.HA_DEVICE_TEMP || null;
const HA_DEVICE_HUM = process.env.HA_DEVICE_HUM || null;
// Không dùng mặc định: chỉ lấy dữ liệu khi camera có cấu hình entityId riêng (hoặc fallback .env)
const SENSOR_POLL_INTERVAL_MS = Number(
    process.env.SENSOR_POLL_INTERVAL_MS || 5000
);

// WebSocket server cho sensor
let wss = null;

// Map: sessionId -> job info
// job = { timerId, isRunning, cameraId, tempEntity, humEntity }
const activeJobs = new Map();

const getHaHeaders = () => {
    if (!HA_TOKEN) {
        console.error('[sensorService] Missing HA_TOKEN in .env');
        return null;
    }
    return {
        Authorization: `Bearer ${HA_TOKEN}`,
    };
};

const initSensorWebSocketServer = () => {
    if (wss) return;

    wss = new WebSocket.Server({ port: sensorConfig.wsPort }, () => {
        console.log(
            `>>> Sensor WebSocket server running at ws://localhost:${sensorConfig.wsPort}`
        );
    });

    wss.on('connection', (ws) => {
        console.log('>>> Sensor WebSocket client connected');
    });

    wss.on('close', () => {
        console.log('>>> Sensor WebSocket server closed');
    });
};

const broadcastSensorUpdate = (payload) => {
    if (!wss) return;
    const message = JSON.stringify({
        type: 'sensor',
        ...payload,
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

const fetchHomeAssistantStates = async (tempEntity, humEntity) => {
    const headers = getHaHeaders();
    if (!headers) return null;

    try {
        const [tempRes, humRes] = await Promise.all([
            axios.get(`${HA_HOST}/api/states/${tempEntity}`, { headers }),
            axios.get(`${HA_HOST}/api/states/${humEntity}`, { headers }),
        ]);

        const temperature = parseFloat(tempRes.data?.state);
        const humidity = parseFloat(humRes.data?.state);

        if (Number.isNaN(temperature) || Number.isNaN(humidity)) {
            console.warn(
                '[sensorService] Invalid sensor values:',
                tempRes.data?.state,
                humRes.data?.state
            );
            return null;
        }

        return { temperature, humidity };
    } catch (error) {
        console.error(
            '[sensorService] Error fetching HA states:',
            error.message
        );
        return null;
    }
};

/**
 * Start job đo nhiệt độ/độ ẩm cho 1 session + camera
 * - sessionId: id của Session
 * - camera: bản ghi Camera (để lấy entityId riêng nếu có)
 */
const startSensorJobForCamera = ({ sessionId, camera }) => {
    if (!sessionId || !camera) return;

    if (activeJobs.has(sessionId)) {
        // đã chạy rồi
        return;
    }

    initSensorWebSocketServer();

    // Ưu tiên entity theo camera; nếu thiếu thì fallback về .env (HA_DEVICE_TEMP/HA_DEVICE_HUM)
    const tempEntity = camera.haTemperatureEntityId || HA_DEVICE_TEMP;
    const humEntity = camera.haHumidityEntityId || HA_DEVICE_HUM;

    if (!tempEntity || !humEntity) {
        console.log(
            `[sensorService] Skip sensor job for camera ${camera.id} because entityId not set and no fallback in .env`
        );
        return; // KHÔNG tạo job nếu thiếu entity cả camera lẫn .env
    }

    console.log(
        `[sensorService] Start sensor job for session ${sessionId}, camera ${camera.id}, entities: ${tempEntity} / ${humEntity}`
    );

    const job = {
        timerId: null,
        isRunning: false,
        cameraId: camera.id,
        tempEntity,
        humEntity,
    };

    job.timerId = setInterval(async () => {
        if (job.isRunning) return;
        job.isRunning = true;

        try {
            const result = await fetchHomeAssistantStates(
                job.tempEntity,
                job.humEntity
            );
            if (!result) return;

            const { temperature, humidity } = result;
            const atTime = new Date().toISOString();

            // Ghi DB
            const dataRow = await dataService.createData({
                sessionId,
                temperature,
                humidity,
                atTime,
            });

            // Broadcast real-time
            broadcastSensorUpdate({
                cameraId: job.cameraId,
                sessionId,
                dataId: dataRow.id,
                temperature,
                humidity,
                atTime,
            });
        } catch (error) {
            console.error(
                `[sensorService] Error polling session ${sessionId}:`,
                error.message
            );
        } finally {
            job.isRunning = false;
        }
    }, SENSOR_POLL_INTERVAL_MS);

    activeJobs.set(sessionId, job);
};

const stopSensorJobBySessionId = (sessionId) => {
    const job = activeJobs.get(sessionId);
    if (job && job.timerId) {
        clearInterval(job.timerId);
        console.log(
            `[sensorService] Stop sensor job for session ${sessionId}, camera ${job.cameraId}`
        );
    }
    activeJobs.delete(sessionId);
};

const stopAllSensorJobs = () => {
    for (const [sessionId, job] of activeJobs.entries()) {
        if (job.timerId) clearInterval(job.timerId);
        console.log(
            `[sensorService] Stop sensor job for session ${sessionId}, camera ${job.cameraId}`
        );
    }
    activeJobs.clear();
};

module.exports = {
    initSensorWebSocketServer,
    startSensorJobForCamera,
    stopSensorJobBySessionId,
    stopAllSensorJobs,
};
