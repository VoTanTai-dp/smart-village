import WebSocket from 'ws';
import JSON5 from 'json5';
import counterConfig from '../config/counter.config';
import db from '../models';

let wss = null;

// sessionId -> job state
// job = { cameraId, username, password, ip, shouldReconnect, wsServerReady, human, vehicle, abort: Function }
const activeJobs = new Map();

function initCounterWebSocketServer() {
    if (wss) return;
    wss = new WebSocket.Server({ port: counterConfig.wsPort }, () => {
        console.log(`>>> Counter WebSocket server running at ws://localhost:${counterConfig.wsPort}`);
    });
    wss.on('connection', () => console.log('>>> Counter WebSocket client connected'));
    wss.on('close', () => console.log('>>> Counter WebSocket server closed'));
}

function broadcastCountUpdate(payload) {
    if (!wss) return;
    const message = JSON.stringify({ type: 'count', ...payload });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(message);
    });
}

async function logCount(sessionId, human, vehicle) {
    try {
        await db.Count.create({ sessionId, countPeople: human, countVehicle: vehicle });
    } catch (e) {
        console.error('[counterService] DB logCount error:', e.message);
    }
}

async function startCountingForCamera({ sessionId, camera }) {
    if (!sessionId || !camera) return;
    if (activeJobs.has(sessionId)) return; // already running

    initCounterWebSocketServer();

    const username = camera.username;
    const password = camera.password;
    const ip = camera.ip;
    if (!username || !password || !ip) {
        console.warn('[counterService] Missing camera credentials, skip start');
        return;
    }

    const job = {
        cameraId: camera.id,
        username,
        password,
        ip,
        shouldReconnect: true,
        human: 0,
        vehicle: 0,
        abort: null,
    };

    const { default: DigestFetch } = await import('digest-fetch');

    const connectEventStream = () => {
        if (!job.shouldReconnect) return;
        const client = new DigestFetch(job.username, job.password);
        const urlPath = `/cgi-bin/eventManager.cgi?action=attach&codes=[CrossLineDetection]`;

        let aborted = false;
        job.abort = () => { aborted = true; };

        client
            .fetch(`http://${job.ip}${urlPath}`)
            .then((res) => {
                const reader = res.body.getReader();
                const decoder = new TextDecoder();

                const read = () => {
                    reader
                        .read()
                        .then(async ({ done, value }) => {
                            if (done) {
                                if (job.shouldReconnect && !aborted) setTimeout(connectEventStream, 3000);
                                return;
                            }
                            const str = decoder.decode(value);
                            const lines = str.split('--myboundary');
                            for (const line of lines) {
                                if (
                                    line.includes('Code=CrossLineDetection') &&
                                    line.includes('data=') &&
                                    line.includes('action=Start')
                                ) {
                                    const match = line.match(/data=({[\s\S]*})/);
                                    if (match) {
                                        const dataStr = match[1];
                                        try {
                                            const dataObj = JSON5.parse(dataStr);
                                            if (dataObj.Object?.ObjectType === 'Human') job.human++;
                                            if (dataObj.Object?.ObjectType === 'Vehicle') job.vehicle++;

                                            // broadcast
                                            broadcastCountUpdate({
                                                cameraId: job.cameraId,
                                                sessionId,
                                                human: job.human,
                                                vehicle: job.vehicle,
                                                atTime: new Date().toISOString(),
                                            });

                                            // log DB
                                            await logCount(sessionId, job.human, job.vehicle);
                                        } catch (err) {
                                            console.error('[counterService] JSON parse error:', err.message);
                                        }
                                    }
                                }
                            }
                            read();
                        })
                        .catch((err) => {
                            console.error('[counterService] Read stream error:', err.message);
                            if (job.shouldReconnect && !aborted) setTimeout(connectEventStream, 3000);
                        });
                };
                read();
            })
            .catch((err) => {
                console.error('[counterService] Fetch event stream failed:', err.message);
                if (job.shouldReconnect && !aborted) setTimeout(connectEventStream, 3000);
            });
    };

    job.shouldReconnect = true;
    connectEventStream();
    activeJobs.set(sessionId, job);
}

function stopCountingBySessionId(sessionId) {
    const job = activeJobs.get(sessionId);
    if (!job) return;
    job.shouldReconnect = false;
    try { job.abort && job.abort(); } catch {}
    activeJobs.delete(sessionId);
    console.log(`[counterService] Stopped counting for session ${sessionId}, camera ${job.cameraId}`);
}

function stopAllCounting() {
    for (const [sessionId, job] of activeJobs.entries()) {
        job.shouldReconnect = false;
        try { job.abort && job.abort(); } catch {}
        console.log(`[counterService] Stopped counting for session ${sessionId}, camera ${job.cameraId}`);
    }
    activeJobs.clear();
}

module.exports = {
    initCounterWebSocketServer,
    startCountingForCamera,
    stopCountingBySessionId,
    stopAllCounting,
};
