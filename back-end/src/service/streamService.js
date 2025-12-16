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
// Hỗ trợ truyền vào 1 URL hoặc mảng URL (sẽ thử lần lượt cho đến khi thành công)
function startStreaming(cameraId, rtspInput) {
    const rtspUrls = Array.isArray(rtspInput) ? rtspInput : [rtspInput];

    return new Promise(async (resolve, reject) => {
        try {
            if (!wss) {
                console.log('>>> WebSocket server not started, init again...');
                initWebSocketServer();
            }

            // Nếu camera này đã có stream thì bỏ qua
            if (streamProcesses.has(cameraId)) {
                console.log(`>>> Stream for camera ${cameraId} already running`);
                return resolve({ url: null, note: 'already_running' });
            }

            // Thử lần lượt các URL
            for (let i = 0; i < rtspUrls.length; i++) {
                const rtspUrl = rtspUrls[i];
                console.log(`>>> Trying RTSP for camera ${cameraId} [${i + 1}/${rtspUrls.length}]: ${rtspUrl}`);

                const attempt = await new Promise((attemptResolve) => {
                    let buffer = Buffer.alloc(0);
                    let frameCount = 0;
                    let firstFrame = false;
                    let closed = false;

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

                    // Nếu chưa thành công, chưa lưu vào map. Chỉ khi nhận frame đầu tiên mới set.

                    const cleanup = () => {
                        if (!closed) {
                            closed = true;
                            try { ffmpegProcess.kill('SIGINT'); } catch (_) {}
                        }
                    };

                    // Timeout nếu không nhận frame trong ~7s
                    const timeout = setTimeout(() => {
                        if (!firstFrame) {
                            console.warn(`>>> Timeout waiting first frame for camera ${cameraId} with url: ${rtspUrl}`);
                            cleanup();
                            attemptResolve({ success: false });
                        }
                    }, 7000);

                    ffmpegProcess.stdout.on('data', (data) => {
                        buffer = Buffer.concat([buffer, data]);

                        let marker;
                        while ((marker = buffer.indexOf(Buffer.from([0xff, 0xd9]))) !== -1) {
                            const frameBuffer = buffer.slice(0, marker + 2);
                            buffer = buffer.slice(marker + 2);

                            const base64Image = frameBuffer.toString('base64');

                            frameCount += 1;
                            if (!firstFrame) {
                                firstFrame = true;
                                clearTimeout(timeout);
                                // Đánh dấu tiến trình này là chính thức
                                streamProcesses.set(cameraId, ffmpegProcess);
                                console.log(`>>> RTSP connected for camera ${cameraId} using: ${rtspUrl}`);
                                // Không cleanup, giữ tiến trình chạy
                                attemptResolve({ success: true, url: rtspUrl });
                            }

                            if (frameCount % 30 === 0) {
                                console.log(`>>> [${cameraId}] Send frame #${frameCount}, size=${frameBuffer.length}`);
                            }

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
                        const log = data.toString();
                        console.log(`FFmpeg log [${cameraId}]: ${log}`);
                        // Có thể bắt 1 số lỗi phổ biến để fail sớm
                        if (!firstFrame && /Connection (refused|failed)|401 Unauthorized|404 Not Found|Invalid data/i.test(log)) {
                            clearTimeout(timeout);
                            cleanup();
                            attemptResolve({ success: false });
                        }
                    });

                    ffmpegProcess.on('close', (code, signal) => {
                        console.log(`FFmpeg for camera ${cameraId} exited with code ${code} (signal: ${signal})`);
                        // Nếu đã thành công (firstFrame) thì sự kiện close nghĩa là stream dừng => xóa khỏi map.
                        if (streamProcesses.get(cameraId) === ffmpegProcess) {
                            streamProcesses.delete(cameraId);
                        }
                        if (!firstFrame) {
                            clearTimeout(timeout);
                            attemptResolve({ success: false });
                        }
                    });
                });

                if (attempt.success) {
                    return resolve({ url: attempt.url });
                }

                // nếu thất bại -> thử url tiếp theo
                console.log(`>>> RTSP attempt failed for camera ${cameraId} with url: ${rtspUrl}. Trying next if available...`);
            }

            // nếu không URL nào thành công
            return reject(new Error('All RTSP URL attempts failed'));
        } catch (err) {
            console.error('>>> startStreaming error:', err);
            reject(err);
        }
    });
}

// Thử start 1 URL và coi là thành công khi nhận được frame đầu tiên
function attemptStart(cameraId, rtspUrl, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
        try {
            if (!wss) initWebSocketServer();
            if (streamProcesses.has(cameraId)) {
                return resolve({ ok: true, url: rtspUrl, reused: true });
            }

            console.log(`>>> Attempt start stream for camera ${cameraId}: ${rtspUrl}`);

            const ffmpegProcess = spawn('ffmpeg', [
                '-rtsp_transport', 'tcp',
                '-i', rtspUrl,
                '-f', 'image2pipe',
                '-vcodec', 'mjpeg',
                '-pix_fmt', 'yuvj420p',
                '-q:v', config.jpegQuality,
                '-vf', `scale=${config.videoScale}`,
                '-fflags', 'nobuffer',
                '-analyzeduration', '0',
                '-probesize', '32',
                '-',
            ]);

            let buffer = Buffer.alloc(0);
            let resolved = false;
            const cleanup = (success) => {
                if (resolved) return;
                resolved = true;
                clearTimeout(timer);
                if (!success) {
                    try { ffmpegProcess.kill('SIGINT'); } catch {}
                } else {
                    // Lưu vào map và tiếp tục forward frame
                    streamProcesses.set(cameraId, ffmpegProcess);
                }
            };

            const timer = setTimeout(() => {
                console.warn(`>>> Timeout waiting first frame for camera ${cameraId}`);
                cleanup(false);
                reject(new Error('Timeout waiting first frame'));
            }, timeoutMs);

            ffmpegProcess.stdout.on('data', (data) => {
                buffer = Buffer.concat([buffer, data]);
                let marker;
                while ((marker = buffer.indexOf(Buffer.from([0xff, 0xd9]))) !== -1) {
                    const frameBuffer = buffer.slice(0, marker + 2);
                    buffer = buffer.slice(marker + 2);

                    const base64Image = frameBuffer.toString('base64');

                    // Thành công ở frame đầu tiên
                    if (!resolved) {
                        console.log(`>>> First frame received for camera ${cameraId}. URL OK.`);
                        cleanup(true);
                    }

                    const message = JSON.stringify({
                        type: 'frame',
                        cameraId,
                        data: base64Image,
                    });

                    if (wss) {
                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) client.send(message);
                        });
                    }
                }
            });

            ffmpegProcess.stderr.on('data', (data) => {
                const text = data.toString();
                console.log(`FFmpeg log [${cameraId}]: ${text}`);
                if (/Connection refused|404 Not Found|Input\/output error|could not|Connection timed out/i.test(text)) {
                    if (!resolved) {
                        cleanup(false);
                        reject(new Error('FFmpeg connection error'));
                    }
                }
            });

            ffmpegProcess.on('close', (code, signal) => {
                if (!resolved) {
                    console.log(`FFmpeg closed before success for camera ${cameraId} (code=${code}, signal=${signal})`);
                    cleanup(false);
                    reject(new Error('FFmpeg exited before receiving frame'));
                } else {
                    console.log(`FFmpeg for camera ${cameraId} exited with code ${code} (signal: ${signal})`);
                    streamProcesses.delete(cameraId);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

async function startStreamingWithFallback(cameraId, { username, password, ip, port }) {
    const safePass = encodeURIComponent(password ?? '');
    const p = port || 554;
    const candidates = [
        `rtsp://${username}:${safePass}@${ip}:${p}/cam/realmonitor?channel=1&subtype=0`,
        `rtsp://${username}:${safePass}@${ip}:${p}/ch01/0`,
    ];

    let lastErr = null;
    for (const url of candidates) {
        try {
            const r = await attemptStart(cameraId, url);
            return { ok: true, rtspUrl: url, reused: r?.reused };
        } catch (e) {
            lastErr = e;
            console.warn(`>>> Failed with URL ${url}, trying next...`);
        }
    }
    throw lastErr || new Error('All RTSP URL attempts failed');
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
    startStreamingWithFallback,
    stopStreaming,
    stopAllStreams,
    getActiveCameraIds,
};
