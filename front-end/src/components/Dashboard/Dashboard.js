import React, { useEffect, useState } from 'react';
import './Dashboard.scss';
import { getSensorDashboard } from '../../services/dashboardService';
import { toast } from 'react-toastify';

const SENSOR_WS_URL = 'ws://localhost:9998';

// Gom camera theo address (khu vực)
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

    return groups;
};

const Dashboard = () => {
    const [camerasData, setCamerasData] = useState([]);
    // address đang được chọn, 'ALL' nghĩa là tất cả
    const [activeAddress, setActiveAddress] = useState('ALL');

    const loadDashboardData = async () => {
        try {
            const data = await getSensorDashboard();
            data.sort((a, b) => {
                const aa = (a.address || '').toLowerCase();
                const bb = (b.address || '').toLowerCase();
                if (aa < bb) return -1;
                if (aa > bb) return 1;
                return a.cameraId - b.cameraId;
            });
            setCamerasData(data);
        } catch (error) {
            console.error('loadDashboardData error:', error);
            toast.error('Failed to load dashboard data');
        }
    };

    useEffect(() => {
        loadDashboardData();

        let ws = null;

        const initSensorWs = () => {
            ws = new WebSocket(SENSOR_WS_URL);

            ws.onopen = () => {
                console.log(`Connected to sensor WebSocket: ${SENSOR_WS_URL}`);
            };

            ws.onerror = (err) => {
                console.error('Sensor WebSocket error:', err);
                toast.error('Sensor WebSocket error');
            };

            ws.onclose = () => {
                console.log('Sensor WebSocket closed');
                ws = null;
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type !== 'sensor') return;

                    const {
                        cameraId,
                        sessionId,
                        temperature,
                        humidity,
                        atTime,
                    } = msg;

                    setCamerasData((prev) => {
                        const list = [...prev];
                        const idx = list.findIndex(
                            (c) => c.cameraId === cameraId
                        );
                        if (idx === -1) {
                            // camera chưa có trong dashboard -> thêm mới tối thiểu để hiển thị
                            const timestamp = atTime || null;
                            const newCam = {
                                cameraId,
                                ip: null,
                                port: null,
                                address: 'Unknown Area',
                                latestRecord: {
                                    temperature,
                                    humidity,
                                    people: null,
                                    vehicle: null,
                                    timestamp,
                                },
                                history: [
                                    {
                                        timestamp,
                                        temperature,
                                        humidity,
                                        people: null,
                                        vehicle: null,
                                        sessionId,
                                    },
                                ],
                            };
                            return [...prev, newCam];
                        }

                        const cam = { ...list[idx] };
                        const latest = cam.latestRecord || {};

                        const timestamp = atTime || latest.timestamp || null;

                        // cập nhật latest
                        cam.latestRecord = {
                            ...latest,
                            temperature,
                            humidity,
                            timestamp,
                        };

                        // thêm 1 dòng history mới ở đầu
                        const newRow = {
                            timestamp,
                            temperature,
                            humidity,
                            // people/vehicle giữ theo latest cũ (nếu có)
                            people:
                                latest.people !== undefined
                                    ? latest.people
                                    : null,
                            vehicle:
                                latest.vehicle !== undefined
                                    ? latest.vehicle
                                    : null,
                            sessionId,
                        };

                        cam.history = [newRow, ...(cam.history || [])];

                        list[idx] = cam;
                        return list;
                    });
                } catch (e) {
                    console.error('Parse sensor message error:', e);
                }
            };
        };

        initSensorWs();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    // --- NHÓM THEO ADDRESS VÀ LỌC THEO TAB ĐANG CHỌN ---
    const groupedCameras = groupCamerasByAddress(camerasData);
    const addressKeys = Object.keys(groupedCameras).sort((a, b) =>
        a.localeCompare(b)
    );

    const activeCameras =
        activeAddress === 'ALL'
            ? camerasData
            : groupedCameras[activeAddress] || [];

    const formatTemp = (value) =>
        value === null || value === undefined
            ? 'N/A'
            : `${Number(value).toFixed(1)}°C`;

    const formatHumidity = (value) =>
        value === null || value === undefined
            ? 'N/A'
            : `${Number(value).toFixed(1)}%`;

    const formatCount = (value) =>
        value === null || value === undefined ? 'N/A' : `${value}`;

    const formatTimestamp = (value) => value || 'N/A';

    return (
        <div className="dashboard-container">
            <div className="container">
                <div className="sub-nav d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div className="nav-links">
                        {/* Tab All */}
                        <a
                            href="#all"
                            className={activeAddress === 'ALL' ? 'active' : ''}
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveAddress('ALL');
                            }}
                        >
                            All Cameras
                        </a>

                        {/* Mỗi camera.address là 1 tab riêng */}
                        {addressKeys.map((addr) => (
                            <a
                                key={addr}
                                href={`#${addr}`}
                                className={
                                    activeAddress === addr ? 'active' : ''
                                }
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveAddress(addr);
                                }}
                            >
                                {addr}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="d-flex flex-column">
                    {/* Tiêu đề khu vực: chỉ hiển thị khi không ở tab All */}
                    {activeAddress !== 'ALL' && (
                        <h2 className="area-title mb-3">
                            Area: {activeAddress}
                        </h2>
                    )}

                    {activeCameras.map((cam) => {
                        const latest = cam.latestRecord || {};
                        const history = cam.history || [];

                        return (
                            <div
                                className="sensor-card fade-in"
                                key={cam.cameraId}
                            >
                                <div className="card-header-custom">
                                    <h3 className="camera-name">
                                        Camera CAM-
                                        {cam.cameraId
                                            .toString()
                                            .padStart(3, '0')}
                                    </h3>
                                    <div className="row camera-info gy-2">
                                        <div className="col-6 col-md-3">
                                            <strong>IP:</strong>{' '}
                                            {cam.ip || 'N/A'}
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <strong>Port:</strong>{' '}
                                            {cam.port || 'N/A'}
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <strong>Address:</strong>{' '}
                                            {cam.address || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-4">
                                    <div className="col-md-4">
                                        <h4 className="section-title">
                                            Latest Sensor Record
                                        </h4>
                                        <div className="latest-record-box">
                                            <div className="record-item">
                                                <span className="label">
                                                    Temperature
                                                </span>
                                                <span className="value">
                                                    {formatTemp(
                                                        latest.temperature
                                                    )}
                                                </span>
                                            </div>
                                            <div className="record-item">
                                                <span className="label">
                                                    Humidity
                                                </span>
                                                <span className="value">
                                                    {formatHumidity(
                                                        latest.humidity
                                                    )}
                                                </span>
                                            </div>
                                            <div className="record-item">
                                                <span className="label">
                                                    People
                                                </span>
                                                <span className="value">
                                                    {formatCount(
                                                        latest.people
                                                    )}
                                                </span>
                                            </div>
                                            <div className="record-item">
                                                <span className="label">
                                                    Vehicle
                                                </span>
                                                <span className="value">
                                                    {formatCount(
                                                        latest.vehicle
                                                    )}
                                                </span>
                                            </div>
                                            <div className="timestamp">
                                                Timestamp:{' '}
                                                {formatTimestamp(
                                                    latest.timestamp
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-8">
                                        <h4 className="section-title">
                                            Historical Data
                                        </h4>
                                        <div className="table-responsive historical-table-wrapper">
                                            <table className="table custom-table">
                                                <thead>
                                                    <tr>
                                                        <th>Timestamp</th>
                                                        <th>Temperature</th>
                                                        <th>Humidity</th>
                                                        <th>People</th>
                                                        <th>Vehicle</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {history.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5}>
                                                                No historical
                                                                data.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {history.map(
                                                        (row, idx) => (
                                                            <tr key={idx}>
                                                                <td>
                                                                    {formatTimestamp(
                                                                        row.timestamp
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {formatTemp(
                                                                        row.temperature
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {formatHumidity(
                                                                        row.humidity
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {formatCount(
                                                                        row.people
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {formatCount(
                                                                        row.vehicle
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {activeCameras.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            No cameras found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
