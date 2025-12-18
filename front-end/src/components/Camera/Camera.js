import React, { useEffect, useRef, useState } from 'react';
import './Camera.scss';
import {
    getCameras,
    createCamera,
    startCameraStream,
    stopSingleCameraStream,
    deleteCamera,
    getStreamingCameraIds,
    connectCameraByCredentials,
} from '../../services/cameraStreamService';
import { toast } from 'react-toastify';

// WebSocket global duy nhất
let streamWs = null;

// Gom camera theo địa chỉ (address)
const groupCamerasByAddress = (cameraList) => {
    const groups = {};

    cameraList.forEach((cam) => {
        const raw = (cam.address || '').trim();
        const key = raw || 'Unknown Area';

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(cam);
    });

    return groups; // { 'Main Gate': [cam1, cam2], 'Warehouse': [cam3], ... }
};

const Camera = () => {
    const [inputIP, setInputIP] = useState('');
    const [inputUsername, setInputUsername] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [inputPort, setInputPort] = useState('');
    const [inputAddress, setInputAddress] = useState('');
    const [inputHaTempEntityId, setInputHaTempEntityId] = useState('');
    const [inputHaHumEntityId, setInputHaHumEntityId] = useState('');

    const [cameras, setCameras] = useState([]);
    const camerasRef = useRef([]);

    // Danh sách camera đang stream (multi-camera)
    const [streamingCameraIds, setStreamingCameraIds] = useState([]);
    const streamingIdsRef = useRef([]);
    const discoveredIdsRef = useRef(new Set());

    const defaultObjValidInput = {
        isValidIP: true,
        isValidUsername: true,
        isValidPassword: true,
        isValidPort: true,
        isValidAddress: true,
    };

    const [objValidInput, setObjValidInput] = useState(defaultObjValidInput);

    const [showModal, setShowModal] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [fullscreenCameraId, setFullscreenCameraId] = useState(null);

    // Map: cameraId -> canvas element
    const canvasRefs = useRef({});
    // Canvas riêng cho fullscreen
    const fullscreenCanvasRef = useRef(null);
    const fullscreenCameraIdRef = useRef(null);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleOpenFullscreen = (cameraId) => {
        setFullscreen(true);
        setFullscreenCameraId(cameraId);
        fullscreenCameraIdRef.current = cameraId;
    };

    const handleCloseFullscreen = () => {
        setFullscreen(false);
        setFullscreenCameraId(null);
        fullscreenCameraIdRef.current = null;
    };

    const validateInput = () => {
        let valid = true;
        const newValid = { ...defaultObjValidInput };

        if (!inputIP) {
            newValid.isValidIP = false;
            toast.error('Please enter camera IP address');
            valid = false;
        } else if (!inputUsername) {
            newValid.isValidUsername = false;
            toast.error('Please enter username');
            valid = false;
        } else if (!inputPassword) {
            newValid.isValidPassword = false;
            toast.error('Please enter password');
            valid = false;
        } else if (!inputPort) {
            newValid.isValidPort = false;
            toast.error('Please enter port');
            valid = false;
        } else if (!inputAddress) {
            newValid.isValidAddress = false;
            toast.error('Please enter address');
            valid = false;
        }

        setObjValidInput(newValid);
        return valid;
    };

    // Helpers lưu trạng thái ẩn camera ở localStorage
    const getHiddenCameraIds = () => {
        try {
            const raw = localStorage.getItem('hiddenCameras');
            const arr = raw ? JSON.parse(raw) : [];
            if (Array.isArray(arr)) return arr.map((x) => Number(x));
            return [];
        } catch {
            return [];
        }
    };
    const setHiddenCameraIds = (ids) => {
        try {
            localStorage.setItem('hiddenCameras', JSON.stringify(ids));
        } catch {
            // ignore
        }
    };

    const loadCameras = async (activeIds = []) => {
        try {
            const list = await getCameras();
            const hidden = new Set(getHiddenCameraIds());
            // Luôn hiển thị camera đang stream, ngay cả khi nằm trong hidden
            const filtered = list.filter((c) => {
                const id = Number(c.id);
                if (activeIds.includes(id)) return true;
                return !hidden.has(id);
            });

            filtered.sort((a, b) => {
                const aa = (a.address || '').toLowerCase();
                const bb = (b.address || '').toLowerCase();
                if (aa < bb) return -1;
                if (aa > bb) return 1;
                return a.id - b.id;
            });
            setCameras(filtered);
            camerasRef.current = filtered;

            if (filtered.length === 0) {
                setShowModal(true);
            }
        } catch (error) {
            console.error('loadCameras error:', error);
            toast.error('Failed to load cameras');
        }
    };

    // Khởi tạo WebSocket stream (một lần duy nhất)
    const initStreamWebSocket = () => {
        if (streamWs) return; // đã connect rồi

        const wsUrl = 'ws://localhost:9999';
        const ws = new WebSocket(wsUrl);
        streamWs = ws;

        ws.onopen = () => {
            console.log(`Connected to stream WebSocket: ${wsUrl}`);
        };

        ws.onerror = (err) => {
            console.error('Stream WebSocket error:', err);
            toast.error('Stream WebSocket error');
        };

        ws.onclose = () => {
            console.log('Stream WebSocket closed');
            streamWs = null;
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type !== 'frame') return;

                // Ép cameraId về number để đồng bộ với camera.id & fullscreenCameraIdRef
                const camId = Number(message.cameraId);
                const { data } = message;

                // Nếu lần đầu thấy camId này trong stream, cập nhật state ngay để hiển thị
                if (!streamingIdsRef.current.includes(camId)) {
                    streamingIdsRef.current = [...streamingIdsRef.current, camId];
                    setStreamingCameraIds((prev) => (prev.includes(camId) ? prev : [...prev, camId]));
                }

                // Đảm bảo camera xuất hiện trong danh sách nếu đang bị ẩn hoặc chưa load
                const existsInList = Array.isArray(camerasRef.current) && camerasRef.current.some(c => Number(c.id) === camId);
                if (!existsInList && !discoveredIdsRef.current.has(camId)) {
                    discoveredIdsRef.current.add(camId);
                    // Gọi loadCameras với camId để ép camera này hiển thị ngay
                    loadCameras([camId]);
                }

                // Canvas ô tile
                const canvasEl = canvasRefs.current[camId];

                // Canvas fullscreen (nếu đang fullscreen đúng camera đó)
                const fullscreenEl =
                    fullscreenCameraIdRef.current === camId
                        ? fullscreenCanvasRef.current
                        : null;

                if (!canvasEl && !fullscreenEl) return;

                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    if (canvasEl) {
                        const ctx = canvasEl.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(
                                img,
                                0,
                                0,
                                canvasEl.width,
                                canvasEl.height
                            );
                        }
                    }

                    if (fullscreenEl) {
                        const ctxFull = fullscreenEl.getContext('2d');
                        if (ctxFull) {
                            const rect = fullscreenEl.getBoundingClientRect();
                            if (
                                fullscreenEl.width !== rect.width ||
                                fullscreenEl.height !== rect.height
                            ) {
                                fullscreenEl.width = rect.width;
                                fullscreenEl.height = rect.height;
                            }

                            ctxFull.drawImage(
                                img,
                                0,
                                0,
                                fullscreenEl.width,
                                fullscreenEl.height
                            );
                        }
                    }
                };
                img.src = 'data:image/jpeg;base64,' + data;
            } catch (e) {
                console.error('Parse stream message error:', e);
            }
        };
    };

    // Start stream cho 1 camera (FFmpeg backend + đảm bảo WS đã connect)
    const startStreamForCamera = async (cameraId) => {
        try {
            await startCameraStream(cameraId);
            setStreamingCameraIds((prev) =>
                prev.includes(cameraId) ? prev : [...prev, cameraId]
            );
            streamingIdsRef.current = [...new Set([...streamingIdsRef.current, cameraId])];
            // Bỏ khỏi hidden để hiển thị trở lại nếu đã từng ẩn
            const hidden = new Set(getHiddenCameraIds());
            hidden.delete(Number(cameraId));
            setHiddenCameraIds(Array.from(hidden));
            await loadCameras([cameraId]);
            initStreamWebSocket();
        } catch (error) {
            console.error('startStreamForCamera error:', error);
            toast.error('Cannot start stream for this camera');
        }
    };

    // Disconnect: chỉ ngắt kết nối stream, KHÔNG xóa camera khỏi DB
    const handleDisconnectCamera = async (cameraId) => {
        try {
            // Nếu đang stream thì stop
            if (streamingCameraIds.includes(cameraId)) {
                await stopSingleCameraStream(cameraId);
            }

            // Cập nhật state streaming
            setStreamingCameraIds((prev) => prev.filter((id) => id !== cameraId));

            // Loại bỏ camera khỏi giao diện (KHÔNG xóa DB)
            setCameras((prev) => prev.filter((cam) => cam.id !== cameraId));
            // Ghi nhận id camera đã ẩn vào localStorage để ẩn cả sau khi reload
            const hidden = new Set(getHiddenCameraIds());
            hidden.add(Number(cameraId));
            setHiddenCameraIds(Array.from(hidden));

            // Clear canvas của camera
            const canvasEl = canvasRefs.current[cameraId];
            if (canvasEl) {
                const ctx = canvasEl.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
                }
            }
            delete canvasRefs.current[cameraId];

            // Nếu đang fullscreen camera này thì đóng fullscreen
            if (fullscreenCameraIdRef.current === cameraId) {
                handleCloseFullscreen();
            }

            toast.success('Camera disconnected');
        } catch (error) {
            console.error('handleDisconnectCamera error:', error);
            toast.error('Failed to disconnect camera');
        }
    };

    // Dọn dẹp WebSocket + ref khi unmount (không tắt FFmpeg trên backend)
    const cleanupStreams = () => {
        if (streamWs) {
            streamWs.close();
            streamWs = null;
        }
        fullscreenCameraIdRef.current = null;
        canvasRefs.current = {};
    };

    const handleConnectCamera = async () => {
        setObjValidInput(defaultObjValidInput);
        if (!validateInput()) return;

        // Ẩn modal ngay lập tức để UX mượt hơn
        setShowModal(false);

        try {
            // Gọi endpoint connect theo credentials để tạo/tìm camera và start stream ngay
            const res = await connectCameraByCredentials({
                ip: inputIP,
                username: inputUsername,
                password: inputPassword,
                port: inputPort,
                address: inputAddress,
                haTemperatureEntityId: inputHaTempEntityId || undefined,
                haHumidityEntityId: inputHaHumEntityId || undefined,
            });

            // Dọn input
            setInputIP('');
            setInputUsername('');
            setInputPassword('');
            setInputPort('');
            setInputAddress('');
            setInputHaTempEntityId('');
            setInputHaHumEntityId('');

            if (res?.success && res?.cameraId) {
                const camId = Number(res.cameraId);
                // Đánh dấu đang stream để render ô và nhận frame
                setStreamingCameraIds((prev) => (prev.includes(camId) ? prev : [...prev, camId]));
                streamingIdsRef.current = [...new Set([...streamingIdsRef.current, camId])];

                // Gỡ khỏi hidden nếu có
                const hidden = new Set(getHiddenCameraIds());
                hidden.delete(camId);
                setHiddenCameraIds(Array.from(hidden));

                // Load danh sách đảm bảo camera hiển thị
                await loadCameras([camId]);

                // Đảm bảo WS đã connect để nhận frame ngay
                initStreamWebSocket();

                toast.success('Camera connected and streaming');
            } else {
                toast.error(res?.message || 'Connect failed');
            }
        } catch (error) {
            console.error('handleConnectCamera error:', error);
            toast.error('Error from server or connection refused');
        }
    };

    const handleClickCameraTile = async (camera) => {
        if (!camera) {
            handleShowModal();
            return;
        }

        // Chưa stream → start stream
        if (!streamingCameraIds.includes(camera.id)) {
            await startStreamForCamera(camera.id);
            return;
        }

        // Đang stream → mở fullscreen
        handleOpenFullscreen(camera.id);
    };

    useEffect(() => {
        const initPage = async () => {
            try {
                const activeIds = await getStreamingCameraIds();
                const activeNums = Array.isArray(activeIds)
                    ? activeIds.map((id) => Number(id))
                    : [];
                setStreamingCameraIds(activeNums);
                await loadCameras(activeNums);
            } catch (error) {
                console.error('getStreamingCameraIds error:', error);
                await loadCameras([]);
            }
            initStreamWebSocket();
        };

        initPage();

        return () => {
            cleanupStreams();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderCameraSlot = (camera, index) => {
        if (camera) {
            const isStreaming = streamingCameraIds.includes(camera.id);

            return (
                <div className="col" key={camera.id}>
                    <div
                        className={`camera-feed ${isStreaming ? 'connected' : ''}`}
                        onClick={() => handleClickCameraTile(camera)}
                    >
                        <div className="ratio ratio-16x9 position-relative">
                            <canvas
                                ref={(el) => {
                                    if (el) {
                                        canvasRefs.current[camera.id] = el;
                                    } else {
                                        delete canvasRefs.current[camera.id];
                                    }
                                }}
                                width={1280}
                                height={720}
                                className="camera-canvas"
                            />
                            {!isStreaming && (
                                <div className="camera-placeholder">
                                    <span>{camera.address || camera.ip}</span>
                                </div>
                            )}

                            {/* Nút fullscreen / start stream */}
                            <button
                                className="btn-fullscreen-trigger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isStreaming) {
                                        handleOpenFullscreen(camera.id);
                                    } else {
                                        startStreamForCamera(camera.id);
                                    }
                                }}
                                title="View Fullscreen"
                            />

                            {/* Nút disconnect: stop stream + delete */}
                            <button
                                className="btn-disconnect"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDisconnectCamera(camera.id);
                                }}
                                title="Disconnect camera"
                            >
                                <i className="bi bi-power" />
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Ô trống (chưa có camera)
        return (
            <div className="col" key={`empty-${index}`}>
                <div className="camera-feed empty" onClick={handleShowModal}>
                    <div className="ratio ratio-16x9">
                        <button className="add-camera-btn">
                            <i
                                className="bi bi-plus-lg"
                                style={{ fontSize: '2rem' }}
                            ></i>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Nhóm camera theo address
    const groupedCameras = groupCamerasByAddress(cameras);
    const addressList = Object.keys(groupedCameras).sort();

    return (
        <div className="camera-container">
            <div className="container">
                {addressList.map((address) => {
                    const cams = groupedCameras[address];

                    const slots = [];
                    const SLOT_COUNT = 4; // 2x2

                    for (let i = 0; i < SLOT_COUNT; i += 1) {
                        const cam = cams[i] || null;
                        slots.push(renderCameraSlot(cam, i));
                    }

                    return (
                        <div className="camera-section" key={address}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h2 className="section-title mb-0">{address}</h2>
                            </div>
                            <div className="row row-cols-1 row-cols-md-2 g-4">
                                {slots}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal connect camera */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div
                        className="modal fade show d-block custom-modal"
                        tabIndex="-1"
                        role="dialog"
                    >
                        <div
                            className="modal-dialog modal-dialog-centered"
                            role="document"
                        >
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Connect a New Camera
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={handleCloseModal}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                IP Address
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control custom-input ${objValidInput.isValidIP
                                                    ? ''
                                                    : 'is-invalid'
                                                    }`}
                                                placeholder="e.g., 192.168.1.100"
                                                value={inputIP}
                                                onChange={(e) =>
                                                    setInputIP(e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control custom-input ${objValidInput.isValidUsername
                                                    ? ''
                                                    : 'is-invalid'
                                                    }`}
                                                placeholder="Enter camera's username"
                                                value={inputUsername}
                                                onChange={(e) =>
                                                    setInputUsername(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                className={`form-control custom-input ${objValidInput
                                                    .isValidPassword
                                                    ? ''
                                                    : 'is-invalid'
                                                    }`}
                                                placeholder="Enter camera's password"
                                                value={inputPassword}
                                                onChange={(e) =>
                                                    setInputPassword(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Port
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control custom-input ${objValidInput.isValidPort
                                                    ? ''
                                                    : 'is-invalid'
                                                    }`}
                                                placeholder="e.g., 554"
                                                value={inputPort}
                                                onChange={(e) =>
                                                    setInputPort(e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">HA Temperature Entity ID</label>
                                            <input
                                                type="text"
                                                className="form-control custom-input"
                                                placeholder="sensor.sonoff_100170f83e_temperature"
                                                value={inputHaTempEntityId}
                                                onChange={(e) => setInputHaTempEntityId(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">HA Humidity Entity ID</label>
                                            <input
                                                type="text"
                                                className="form-control custom-input"
                                                placeholder="sensor.sonoff_100170f83e_humidity"
                                                value={inputHaHumEntityId}
                                                onChange={(e) => setInputHaHumEntityId(e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control custom-input ${objValidInput.isValidAddress
                                                    ? ''
                                                    : 'is-invalid'
                                                    }`}
                                                placeholder="e.g., Main Gate"
                                                value={inputAddress}
                                                onChange={(e) =>
                                                    setInputAddress(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleConnectCamera();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-cancel"
                                        onClick={handleCloseModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-save"
                                        onClick={handleConnectCamera}
                                    >
                                        Connect
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Fullscreen overlay */}
            {fullscreen && (
                <div className="fullscreen-overlay fade-in">
                    <button
                        className="btn-close-fullscreen"
                        onClick={handleCloseFullscreen}
                    >
                        <i
                            className="bi bi-x-lg"
                            style={{ fontSize: '2rem' }}
                        ></i>
                    </button>
                    <div className="fullscreen-content">
                        <canvas
                            ref={fullscreenCanvasRef}
                            className="camera-canvas-fullscreen"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Camera;
