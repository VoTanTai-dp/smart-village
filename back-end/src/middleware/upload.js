import multer from 'multer';
import path from 'path';

// Cấu hình multer để lưu trữ file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/uploads/'); // Thư mục lưu trữ file
    },
    filename: function (req, file, cb) {
        // Đặt tên file = thời gian hiện tại + đuôi file gốc (tránh trùng tên)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Kiểm tra định dạng file (chỉ cho phép ảnh) - Tùy chọn
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

export default upload;