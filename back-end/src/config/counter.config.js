// back-end/src/config/counter.config.js
const counterConfig = {
    wsPort: process.env.COUNTER_WS_PORT ? Number(process.env.COUNTER_WS_PORT) : 9997,
};

export default counterConfig;
