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
                                <i className="bi bi-plus-lg" style={{ fontSize: "2rem" }}></i>
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
                {/* <div className="camera-section">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h2 className="section-title mb-0">Warehouse Section</h2>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {renderCameraSlot(true, "Warehouse A")}
                        {renderCameraSlot(true, "Warehouse B")}
                        {renderCameraSlot(false)}
                        {renderCameraSlot(false)}
                    </div>
                </div> */}

                {/* Section: Livestock Pens */}
                {/* <div className="camera-section">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h2 className="section-title mb-0">Livestock Pens</h2>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {renderCameraSlot(true, "Pen Zone 1")}
                        {renderCameraSlot(false)}
                        {renderCameraSlot(false)}
                        {renderCameraSlot(false)}
                    </div>
                </div> */}
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
                                        <div className="mb-3">
                                            <label className="form-label">Address</label>
                                            <input type="text" className="form-control" placeholder="e.g., Main Gate" />
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
                        <i className="bi bi-x-lg" style={{ fontSize: "2rem" }}></i>
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

// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import JSMpeg from '@cycjimmy/jsmpeg-player';
// import './Camera.scss';

// const Camera = (props) => {
//     // 1. Khởi tạo cameras luôn là mảng rỗng [] để không bao giờ bị lỗi .map
//     const [cameras, setCameras] = useState([]);
//     const [showModal, setShowModal] = useState(false);
//     const [newCamera, setNewCamera] = useState({
//         ip: '', username: '', password: '', port: '554', address: ''
//     });
//     const [fullscreenId, setFullscreenId] = useState(null);

//     useEffect(() => {
//         fetchCameras();
//     }, []);

//     const fetchCameras = async () => {
//         try {
//             // Thay đổi URL này nếu port backend của bạn khác 8080
//             const res = await axios.get('http://localhost:8080/api/v1/cameras');

//             // Log dữ liệu để kiểm tra (Xem trong Console F12)
//             console.log("Dữ liệu từ API:", res.data);

//             // 2. Kiểm tra an toàn trước khi set state
//             // Nếu res.data.data là null hoặc undefined -> Fallback về []
//             const cameraList = (res.data && Array.isArray(res.data.data)) ? res.data.data : [];
//             setCameras(cameraList);

//         } catch (error) {
//             console.error("Lỗi lấy danh sách camera:", error);
//             setCameras([]); // Nếu lỗi mạng, vẫn đảm bảo là mảng rỗng
//         }
//     };

//     const handleShowModal = () => setShowModal(true);
//     const handleCloseModal = () => {
//         setShowModal(false);
//         setNewCamera({ ip: '', username: '', password: '', port: '554', address: '' });
//     };

//     const handleInputChange = (e) => {
//         setNewCamera({ ...newCamera, [e.target.name]: e.target.value });
//     };

//     const handleConnectCamera = async () => {
//         if (!newCamera.ip || !newCamera.username || !newCamera.password) {
//             alert("Vui lòng nhập đầy đủ thông tin!");
//             return;
//         }
//         try {
//             const res = await axios.post('http://localhost:8080/api/v1/cameras', newCamera);
//             if (res.data && res.data.success) {
//                 alert("Kết nối thành công!");
//                 handleCloseModal();
//                 fetchCameras();
//             }
//         } catch (error) {
//             console.error("Lỗi kết nối:", error);
//             alert("Kết nối thất bại. Kiểm tra lại thông tin!");
//         }
//     };

//     const handleDisconnectCamera = async (id) => {
//         if (window.confirm("Bạn có chắc muốn ngắt kết nối camera này không?")) {
//             try {
//                 const res = await axios.delete(`http://localhost:8080/api/v1/cameras/${id}`);
//                 if (res.data && res.data.success) {
//                     fetchCameras();
//                 }
//             } catch (error) {
//                 console.error("Lỗi xóa camera:", error);
//                 alert("Không thể ngắt kết nối!");
//             }
//         }
//     };

//     const handleOpenFullscreen = (id) => setFullscreenId(id);
//     const handleCloseFullscreen = () => setFullscreenId(null);

//     // Component Video Player
//     const CameraPlayer = ({ id, isFullscreen }) => {
//         const wrapperRef = useRef(null);
//         const playerRef = useRef(null);

//         useEffect(() => {
//             if (!wrapperRef.current) return;

//             // URL WebSocket
//             const wsUrl = `ws://localhost:8080/api/v1/cameras/stream/${id}`;
//             console.log("Connecting to WS:", wsUrl); // Log để debug

//             // Khởi tạo Player
//             playerRef.current = new JSMpeg.VideoElement(wrapperRef.current, wsUrl, {
//                 autoplay: true,
//                 loop: true,
//                 // Tắt audio để giảm tải nếu camera không có mic
//                 audio: false
//             });

//             return () => {
//                 if (playerRef.current) {
//                     playerRef.current.destroy();
//                 }
//             };
//         }, [id]);

//         return (
//             <div
//                 ref={wrapperRef}
//                 className={`camera-player-wrapper ${isFullscreen ? 'fullscreen-video' : ''}`}
//                 style={{ width: '100%', height: '100%' }}
//             ></div>
//         );
//     };

//     const renderCameraSlot = (camera) => {
//         return (
//             <div className="col" key={camera.id}>
//                 <div className="camera-feed connected">
//                     <div className="ratio ratio-16x9 position-relative">
//                         <CameraPlayer id={camera.id} />

//                         <div className="camera-info-overlay" style={{
//                             position: 'absolute', bottom: 0, left: 0,
//                             background: 'rgba(0,0,0,0.6)', color: '#fff',
//                             padding: '5px 10px', width: '100%', fontSize: '0.85rem',
//                             display: 'flex', justifyContent: 'space-between'
//                         }}>
//                             <span>{camera.address || camera.ip}</span>
//                         </div>

//                         <button
//                             className="btn-fullscreen-trigger"
//                             onClick={() => handleOpenFullscreen(camera.id)}
//                             title="View Fullscreen"
//                             style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
//                         >
//                             <i className="bi bi-arrows-fullscreen"></i>
//                         </button>

//                         <button
//                             className="btn-disconnect-trigger"
//                             onClick={() => handleDisconnectCamera(camera.id)}
//                             title="Disconnect"
//                             style={{
//                                 position: 'absolute', top: '10px', left: '10px', zIndex: 10,
//                                 background: 'rgba(255,0,0,0.7)', border: 'none', color: 'white',
//                                 borderRadius: '4px', padding: '2px 8px'
//                             }}
//                         >
//                             <i className="bi bi-trash"></i>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     const renderEmptySlot = () => {
//         return (
//             <div className="col">
//                 <div className="camera-feed empty" onClick={handleShowModal}>
//                     <div className="ratio ratio-16x9 d-flex justify-content-center align-items-center">
//                         <button className="add-camera-btn">
//                             {/* Đã sửa lỗi class -> className */}
//                             <i className="bi bi-plus-lg" style={{ fontSize: "2rem" }}></i>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="camera-container">
//             <div className="container">
//                 <div className="camera-section">
//                     <div className="d-flex align-items-center justify-content-between mb-3">
//                         <h2 className="section-title mb-0">Live Monitor</h2>
//                         <button className="btn btn-primary" onClick={handleShowModal}>+ Add Connection</button>
//                     </div>

//                     <div className="row row-cols-1 row-cols-md-2 g-4">
//                         {/* 3. Render danh sách an toàn */}
//                         {Array.isArray(cameras) && cameras.length > 0 ? (
//                             cameras.map(cam => renderCameraSlot(cam))
//                         ) : (
//                             <div className="col-12 text-center py-5 text-muted">
//                                 Chưa có camera nào được kết nối.
//                             </div>
//                         )}

//                         {renderEmptySlot()}
//                     </div>
//                 </div>
//             </div>

//             {showModal && (
//                 <>
//                     <div className="modal-backdrop fade show"></div>
//                     <div className="modal fade show d-block custom-modal" tabIndex="-1">
//                         <div className="modal-dialog modal-dialog-centered">
//                             <div className="modal-content">
//                                 <div className="modal-header">
//                                     <h5 className="modal-title">Connect a New Camera</h5>
//                                     <button type="button" className="btn-close" onClick={handleCloseModal}></button>
//                                 </div>
//                                 <div className="modal-body">
//                                     <form>
//                                         <div className="mb-3">
//                                             <label className="form-label">IP Address</label>
//                                             <input type="text" name="ip" className="form-control" placeholder="192.168.1.xxx" value={newCamera.ip} onChange={handleInputChange} />
//                                         </div>
//                                         <div className="mb-3">
//                                             <label className="form-label">Username</label>
//                                             <input type="text" name="username" className="form-control" value={newCamera.username} onChange={handleInputChange} />
//                                         </div>
//                                         <div className="mb-3">
//                                             <label className="form-label">Password</label>
//                                             <input type="password" name="password" className="form-control" value={newCamera.password} onChange={handleInputChange} />
//                                         </div>
//                                         <div className="mb-3">
//                                             <label className="form-label">Port</label>
//                                             <input type="text" name="port" className="form-control" placeholder="554" value={newCamera.port} onChange={handleInputChange} />
//                                         </div>
//                                         <div className="mb-3">
//                                             <label className="form-label">Location Name</label>
//                                             <input type="text" name="address" className="form-control" placeholder="Main Gate" value={newCamera.address} onChange={handleInputChange} />
//                                         </div>
//                                     </form>
//                                 </div>
//                                 <div className="modal-footer">
//                                     <button type="button" className="btn btn-cancel" onClick={handleCloseModal}>Cancel</button>
//                                     <button type="button" className="btn btn-save" onClick={handleConnectCamera}>Connect</button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}

//             {fullscreenId && (
//                 <div className="fullscreen-overlay fade-in">
//                     <button className="btn-close-fullscreen" onClick={handleCloseFullscreen}>
//                         <i className="bi bi-x-lg" style={{ fontSize: "2rem" }}></i>
//                     </button>
//                     <div className="fullscreen-content" style={{ width: '90%', height: '90%' }}>
//                         <CameraPlayer id={fullscreenId} isFullscreen={true} />
//                     </div>
//                 </div>
//             )}
//         </div>
//     )
// }

// export default Camera;