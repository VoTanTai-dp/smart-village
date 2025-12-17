// back-end/src/config/sensor.config.js
const sensorConfig = {
    wsPort: process.env.SENSOR_WS_PORT
        ? Number(process.env.SENSOR_WS_PORT)
        : 9998,
};

export default sensorConfig;
