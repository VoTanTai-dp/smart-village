import WebSocket from 'ws';
import { spawn } from 'child_process';
import config from '../config/stream.config';

// WebSocket server duy nhất cho toàn hệ thống
let wss = null;
// Map lưu process FFmpeg theo cameraId
// key: cameraId, value: child_process instance
const streamProcesses = new Map();

function initWebSocketServer() {
    if (!wss) {
        wss = new WebSocket.Server({ port: config.wsPort }, () => {
            console.log(
                `>>> MJPEG WebSocket server running at ws://localhost:${config.wsPort}`
            );
        });

        wss.on('connection', (ws) => {
            console.log('>>> Stream WebSocket client connected');
        });

        wss.on('close', () => {
            console.log('>>> MJPEG WebSocket server closed');
        });
    }
}

// Start streaming cho 1 camera (nhiều camera = nhiều FFmpeg)
function startStreaming(cameraId, rtspUrl) {
    return new Promise((resolve, reject) => {
        try {
            if (!wss) {
                console.log('>>> WebSocket server not started, init again...');
                initWebSocketServer();
            }

            // Nếu camera này đã có stream thì bỏ qua
            if (streamProcesses.has(cameraId)) {
                console.log(`>>> Stream for camera ${cameraId} already running`);
                return resolve();
            }

            console.log(`>>> Starting new stream for camera ${cameraId}: ${rtspUrl}`);

            const ffmpegProcess = spawn('ffmpeg', [
                '-rtsp_transport',
                'tcp',
                '-i',
                rtspUrl,
                '-f',
                'image2pipe',
                '-vcodec',
                'mjpeg',
                '-pix_fmt',
                'yuvj420p',
                '-q:v',
                config.jpegQuality,
                '-vf',
                `scale=${config.videoScale}`,
                '-fflags',
                'nobuffer',
                '-analyzeduration',
                '0',
                '-probesize',
                '32',
                '-',
            ]);

            // Lưu process lại
            streamProcesses.set(cameraId, ffmpegProcess);

            let buffer = Buffer.alloc(0);
            let frameCount = 0;

            ffmpegProcess.stdout.on('data', (data) => {
                buffer = Buffer.concat([buffer, data]);

                let marker;
                while ((marker = buffer.indexOf(Buffer.from([0xff, 0xd9]))) !== -1) {
                    const frameBuffer = buffer.slice(0, marker + 2);
                    buffer = buffer.slice(marker + 2);

                    const base64Image = frameBuffer.toString('base64');

                    frameCount += 1;
                    if (frameCount % 30 === 0) {
                        console.log(
                            `>>> [${cameraId}] Send frame #${frameCount}, size=${frameBuffer.length}`
                        );
                    }

                    // Gửi kèm cameraId để frontend biết vẽ vào canvas nào
                    const message = JSON.stringify({
                        type: 'frame',
                        cameraId,
                        data: base64Image,
                    });

                    if (wss) {
                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(message);
                            }
                        });
                    }
                }
            });

            ffmpegProcess.stderr.on('data', (data) => {
                console.log(`FFmpeg log [${cameraId}]: ${data.toString()}`);
            });

            ffmpegProcess.on('close', (code, signal) => {
                console.log(
                    `FFmpeg for camera ${cameraId} exited with code ${code} (signal: ${signal})`
                );
                streamProcesses.delete(cameraId);
            });

            resolve();
        } catch (err) {
            console.error('>>> startStreaming error:', err);
            reject(err);
        }
    });
}

// Dừng stream 1 camera
function stopStreaming(cameraId) {
    return new Promise((resolve) => {
        const ffmpegProcess = streamProcesses.get(cameraId);
        if (ffmpegProcess) {
            ffmpegProcess.kill('SIGINT');
            streamProcesses.delete(cameraId);
            console.log(`>>> Stopped FFmpeg stream for camera ${cameraId}`);
        }
        resolve();
    });
}

// Dừng toàn bộ camera đang stream
function stopAllStreams() {
    const ids = Array.from(streamProcesses.keys());
    return Promise.all(ids.map((id) => stopStreaming(id)));
}

// Lấy danh sách cameraId đang được FFmpeg stream
function getActiveCameraIds() {
    return Array.from(streamProcesses.keys());
}

module.exports = {
    initWebSocketServer,
    startStreaming,
    stopStreaming,
    stopAllStreams,
    getActiveCameraIds,
};
