import React, { useState } from 'react';
import './Camera.scss';

const Camera = (props) => {
    // State để quản lý Modal Connect
    const [showModal, setShowModal] = useState(false);

    // State để quản lý Fullscreen Camera (Lưu đường dẫn ảnh hoặc ID camera)
    const [fullscreenImage, setFullscreenImage] = useState(null);

    // --- Handlers cho Modal Connect ---
    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    // --- Handlers cho Fullscreen ---
    const handleOpenFullscreen = (imgSrc) => {
        setFullscreenImage(imgSrc);
    };

    const handleCloseFullscreen = () => {
        setFullscreenImage(null);
    };

    // Helper render camera slot
    const renderCameraSlot = (hasCamera, label) => {
        // Link ảnh mẫu (sau này bạn thay bằng stream thực tế)
        const imgSrc = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000";

        if (hasCamera) {
            return (
                <div className="col">
                    <div className="camera-feed connected">
                        <div className="ratio ratio-16x9">
                            {/* Placeholder Image */}
                            <img
                                src={imgSrc}
                                alt="Camera Feed"
                                className="camera-image"
                            />

                            {/* Nút Phóng to Fullscreen */}
                            <button
                                className="btn-fullscreen-trigger"
                                onClick={() => handleOpenFullscreen(imgSrc)}
                                title="View Fullscreen"
                            >
                                {/* <span className="material-symbols-outlined">fullscreen</span> */}
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="col">
                    <div className="camera-feed empty" onClick={handleShowModal}>
                        <div className="ratio ratio-16x9">
                            <button className="add-camera-btn">
                                <span className="material-symbols-outlined">+</span>
                                <span className="text-add">Add Camera</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="camera-container">
            <div className="container">
                {/* --- SECTIONS (GRID 2x2) --- */}
                {/* Section: Main Gate */}
                <div className="camera-section">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h2 className="section-title mb-0">Main Gate</h2>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {renderCameraSlot(true, "Gate Cam 01")}
                        {renderCameraSlot(true, "Gate Cam 02")}
                        {renderCameraSlot(false)}
                        {renderCameraSlot(false)}
                    </div>
                </div>

                {/* Section: Warehouse Section */}
                <div className="camera-section">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h2 className="section-title mb-0">Warehouse Section</h2>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {renderCameraSlot(true, "Warehouse A")}
                        {renderCameraSlot(true, "Warehouse B")}
                        {renderCameraSlot(false)}
                        {renderCameraSlot(false)}
                    </div>
                </div>

                {/* Section: Livestock Pens */}
                <div className="camera-section">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h2 className="section-title mb-0">Livestock Pens</h2>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {renderCameraSlot(true, "Pen Zone 1")}
                        {renderCameraSlot(false)}
                        {renderCameraSlot(false)}
                        {renderCameraSlot(false)}
                    </div>
                </div>
            </div>

            {/* --- MODAL CONNECT CAMERA --- */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block custom-modal" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Connect a New Camera</h5>
                                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">IP Address</label>
                                            <input type="text" className="form-control" placeholder="e.g., 192.168.1.100" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Username</label>
                                            <input type="text" className="form-control" placeholder="Enter camera's username" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Password</label>
                                            <input type="password" className="form-control" placeholder="Enter camera's password" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Port</label>
                                            <input type="text" className="form-control" placeholder="e.g., 554" />
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-cancel" onClick={handleCloseModal}>Cancel</button>
                                    <button type="button" className="btn btn-save" onClick={handleCloseModal}>Connect</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* --- FULLSCREEN OVERLAY --- */}
            {fullscreenImage && (
                <div className="fullscreen-overlay fade-in">
                    {/* Nút đóng fullscreen */}
                    <button className="btn-close-fullscreen" onClick={handleCloseFullscreen}>
                        <span className="material-symbols-outlined">X</span>
                    </button>

                    {/* Ảnh/Video phóng to */}
                    <div className="fullscreen-content">
                        <img src={fullscreenImage} alt="Fullscreen View" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Camera;