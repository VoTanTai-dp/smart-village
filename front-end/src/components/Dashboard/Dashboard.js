import React, { useState } from 'react';
import './Dashboard.scss';

const Dashboard = (props) => {
    // 1. Cấu hình phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3; // Số lượng camera hiển thị trên 1 trang

    // 2. Tạo dữ liệu giả lập nhiều hơn (12 Camera)
    const generateMockData = () => {
        const data = [];
        for (let i = 1; i <= 12; i++) {
            const idNumber = i.toString().padStart(3, '0');
            data.push({
                id: `CAM-${idNumber}`,
                ip: `192.168.1.${100 + i}`,
                port: '554',
                address: i <= 4 ? `Main Farm Building, Zone ${i}` :
                    i <= 8 ? `West Field, Sector ${i - 4}` :
                        `Storage Barn, Unit ${i - 8}`,
                latestRecord: {
                    temp: `${(20 + Math.random() * 10).toFixed(1)}°C`, // Random từ 20-30 độ
                    humidity: `${Math.floor(50 + Math.random() * 30)}%`,
                    people: `${(20 * 10)}`,
                    vehicle: `${(20 * 10)}`,
                    timestamp: new Date().toLocaleString()
                },
                history: [
                    { time: '14:30', temp: '24.5°C', humidity: '62%', people: '10', vehicle: '5' },
                    { time: '14:15', temp: '24.7°C', humidity: '61%', people: '9', vehicle: '4' },
                    { time: '14:00', temp: '24.9°C', humidity: '60%', people: '8', vehicle: '3' },
                ]
            });
        }
        return data;
    };

    // Sử dụng useState để giữ dữ liệu (giả lập việc fetch API)
    const [camerasData] = useState(generateMockData());

    // 3. Logic tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCameras = camerasData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(camerasData.length / itemsPerPage);

    // 4. Hàm xử lý chuyển trang
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="container">

                {/* Sub Navigation & Pagination Controls */}
                <div className="sub-nav d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">

                    <div className="nav-links">
                        <a href="#all" className="active">All Areas</a>
                        <a href="#main">Main Farm</a>
                        <a href="#west">West Field</a>
                        <a href="#storage">Storage</a>
                    </div>

                    {/* Controls Phân trang */}
                    <div className="pagination-controls d-flex align-items-center gap-3">
                        <span className="page-info text-white-50 small">
                            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, camerasData.length)} of {camerasData.length}
                        </span>

                        <div className="nav-buttons d-flex gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={currentPage === 1 ? 'disabled' : ''}
                                title="Previous Page"
                            >
                                <i className="bi bi-arrow-left" style={{ fontSize: "1rem" }}></i>
                            </button>

                            <span className="current-page-badge">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? 'disabled' : ''}
                                title="Next Page"
                            >
                                <i className="bi bi-arrow-right" style={{ fontSize: "1rem" }}></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content List - Render currentCameras thay vì camerasData */}
                <div className="d-flex flex-column">
                    {currentCameras.map((cam, index) => (
                        <div className="sensor-card fade-in" key={cam.id}>
                            {/* Card Header */}
                            <div className="card-header-custom">
                                <h3 className="camera-name">Camera {cam.id}</h3>
                                <div className="row camera-info gy-2">
                                    <div className="col-6 col-md-3">
                                        <strong>IP:</strong> {cam.ip}
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <strong>Port:</strong> {cam.port}
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <strong>Address:</strong> {cam.address}
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="row g-4">
                                {/* Left Column: Latest Record */}
                                <div className="col-md-4">
                                    <h4 className="section-title">Latest Sensor Record</h4>
                                    <div className="latest-record-box">
                                        <div className="record-item">
                                            <span className="label">Temperature</span>
                                            <span className="value">{cam.latestRecord.temp}</span>
                                        </div>
                                        <div className="record-item">
                                            <span className="label">Humidity</span>
                                            <span className="value">{cam.latestRecord.humidity}</span>
                                        </div>
                                        <div className="record-item">
                                            <span className="label">People</span>
                                            <span className="value">{cam.latestRecord.people}</span>
                                        </div>
                                        <div className="record-item">
                                            <span className="label">Vehicle</span>
                                            <span className="value">{cam.latestRecord.vehicle}</span>
                                        </div>
                                        <div className="timestamp">
                                            Timestamp: {cam.latestRecord.timestamp}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Historical Data Table */}
                                <div className="col-md-8">
                                    <h4 className="section-title">Historical Data</h4>
                                    <div className="table-responsive">
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
                                                {cam.history.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td>{row.time}</td>
                                                        <td>{row.temp}</td>
                                                        <td>{row.humidity}</td>
                                                        <td>{row.people}</td>
                                                        <td>{row.vehicle}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State nếu không có data */}
                    {currentCameras.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            No cameras found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard;