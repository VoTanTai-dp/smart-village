import React, { useEffect, useRef, useState } from 'react';
import './Camera.scss';
import {
    getCameras,
    createCamera,
    startCameraStream,
    stopCameraStream,
    stopSingleCameraStream,
    deleteCamera,
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

    const [cameras, setCameras] = useState([]);

    // Danh sách camera đang stream (multi-camera)
    const [streamingCameraIds, setStreamingCameraIds] = useState([]);

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

    const loadCameras = async () => {
        try {
            const list = await getCameras();
            list.sort((a, b) => {
                const aa = (a.address || '').toLowerCase();
                const bb = (b.address || '').toLowerCase();
                if (aa < bb) return -1;
                if (aa > bb) return 1;
                return a.id - b.id;
            });
            setCameras(list);

            // Nếu không có camera nào trong database -> auto mở modal tạo kết nối
            if (list.length === 0) {
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
            initStreamWebSocket();
        } catch (error) {
            console.error('startStreamForCamera error:', error);
            toast.error('Cannot start stream for this camera');
        }
    };

    // Disconnect: stop stream + xóa camera khỏi DB
    const handleDisconnectCamera = async (cameraId) => {
        try {
            // nếu đang stream thì stop trước
            if (streamingCameraIds.includes(cameraId)) {
                await stopSingleCameraStream(cameraId);
            }

            // xóa khỏi database
            await deleteCamera(cameraId);

            // cập nhật state streaming
            setStreamingCameraIds((prev) =>
                prev.filter((id) => id !== cameraId)
            );

            // cập nhật danh sách cameras
            setCameras((prev) => prev.filter((cam) => cam.id !== cameraId));

            // clear canvas
            const canvasEl = canvasRefs.current[cameraId];
            if (canvasEl) {
                const ctx = canvasEl.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
                }
            }
            delete canvasRefs.current[cameraId];

            // nếu đang fullscreen camera này thì đóng fullscreen
            if (fullscreenCameraIdRef.current === cameraId) {
                handleCloseFullscreen();
            }

            toast.success('Camera disconnected and removed');
        } catch (error) {
            console.error('handleDisconnectCamera error:', error);
            toast.error('Failed to disconnect camera');
        }
    };

    // Stop toàn bộ stream (dùng khi unmount page)
    const stopAllStreams = async () => {
        try {
            await stopCameraStream(); // gọi /cameras/stream/stop-all
        } catch (error) {
            console.error('stopAllStreams API error:', error);
        }

        if (streamWs) {
            streamWs.close();
            streamWs = null;
        }
        setStreamingCameraIds([]);
        setFullscreen(false);
        setFullscreenCameraId(null);
        fullscreenCameraIdRef.current = null;
        canvasRefs.current = {};
    };

    const handleConnectCamera = async () => {
        setObjValidInput(defaultObjValidInput);
        if (!validateInput()) return;

        try {
            const camera = await createCamera({
                ip: inputIP,
                username: inputUsername,
                password: inputPassword,
                port: inputPort,
                address: inputAddress,
            });

            toast.success('Camera created successfully');

            setInputIP('');
            setInputUsername('');
            setInputPassword('');
            setInputPort('');
            setInputAddress('');
            setShowModal(false);

            await loadCameras();

            if (camera && camera.id) {
                await startStreamForCamera(camera.id);
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
        loadCameras();

        return () => {
            // Khi rời page Camera → dừng tất cả stream + đóng WS
            stopAllStreams();
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
                                                className={`form-control custom-input ${objValidInput.isValidPassword
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
                                                onKeyDown={
                                                    (e) => {
                                                        if (e.key === 'Enter') {
                                                            handleConnectCamera();
                                                        }
                                                    }
                                                }
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
