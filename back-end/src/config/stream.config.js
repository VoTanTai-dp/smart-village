module.exports = {
    // cổng WebSocket để stream ảnh MJPEG
    wsPort: 9999,
    // độ phân giải video output (scale của ffmpeg)
    videoScale: '1280:720',
    // chất lượng JPEG (1 = tốt, 31 = xấu)
    jpegQuality: '5',
};
