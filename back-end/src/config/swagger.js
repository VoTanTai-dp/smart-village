import { format } from 'mysql2';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Smart Village API',
        version: '1.0.0',
        description:
            'API cho hệ thống Nông thôn thông minh: quản lý user, phân quyền, camera, session, dữ liệu cảm biến, đếm người/xe, model AI, mapping camera-model.',
    },
    servers: [
        {
            url: 'http://localhost:8080/api',
            description: 'Local development',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của user'
                    },
                    groupId: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của nhóm user'
                    },
                    email: {
                        type: 'string',
                        example: 'guest@example.com',
                        description: 'Địa chỉ email của user'
                    },
                    username: {
                        type: 'string',
                        description: 'Tên đăng nhập của user',
                    },
                    password: {
                        type: 'string',
                        description: 'Mật khẩu của user'
                    },
                    phone: {
                        type: 'string',
                        example: '0912345678',
                        description: 'Số điện thoại của user'
                    },
                    sex: {
                        type: 'string',
                        example: 'male',
                        description: 'Giới tính của user'
                    },
                    createdAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time',
                        description: 'Thời gian tạo user'
                    },
                    updatedAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time',
                        description: 'Thời gian cập nhật user'
                    },
                },
            },
            Group: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của nhóm'
                    },
                    groupname: {
                        type: 'string',
                        description: 'Tên nhóm người dùng'
                    },
                    description: {
                        type: 'string',
                        example: 'Nhóm quản trị hệ thống',
                        description: 'Mô tả về nhóm người dùng'
                    },
                    createdAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                },
            },
            Role: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của quyền'
                    },
                    url: {
                        type: 'string',
                        example: '/users',
                        description: 'Đường dẫn API mà quyền này áp dụng'
                    },
                    description: {
                        type: 'string',
                        example: 'Quyền quản lý user',
                        description: 'Mô tả về quyền'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        readOnly: true
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        readOnly: true
                    },
                },
            },
            Group_Role: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của Group_Role'
                    },
                    groupId: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của nhóm người dùng'
                    },
                    roleID: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của quyền'
                    },
                    createdAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                },
            },
            Camera: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của camera'
                    },
                    userId: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của user sở hữu camera'
                    },
                    ip: {
                        type: 'string',
                        example: '192.168.1.10',
                        description: 'Địa chỉ IP của camera'
                    },
                    password: {
                        type: 'string',
                        description: 'Mật khẩu truy cập camera'
                    },
                    port: {
                        type: 'string',
                        example: '554',
                        description: 'Cổng kết nối của camera'
                    },
                    address: {
                        type: 'string',
                        description: 'Địa chỉ vật lý của camera'
                    },
                    createdAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                },
            },
            Session: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của session'
                    },
                    cameraId: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của camera'
                    },
                    startDate: {
                        type: 'string',
                        description: 'Thời gian bắt đầu session',
                        example: '01-01-2025 10:00:00'
                    },
                    endDate: {
                        type: 'string',
                        description: 'Thời gian kết thúc session',
                        example: '01-01-2025 12:00:00'
                    },
                    createdAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                },
            },
            Data: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của dữ liệu cảm biến'
                    },
                    sessionId: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của session'
                    },
                    temperature: {
                        type: 'number',
                        description: 'Nhiệt độ đo được',
                        example: 28.5
                    },
                    humidity: {
                        type: 'number',
                        description: 'Độ ẩm đo được',
                        example: 70.2
                    },
                    atTime: {
                        type: 'string',
                        example: '01-01-2025 10:30:00',
                        description: 'Thời gian ghi nhận dữ liệu cảm biến'
                    },
                    createdAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                },
            },
            Count: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của bản ghi đếm'
                    },
                    sessionId: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của session'
                    },
                    countPeople: {
                        type: 'integer',
                        description: 'Số lượng người đếm được',
                    },
                    countVehicle: {
                        type: 'integer',
                        description: 'Số lượng xe đếm được',
                    },
                    createdAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                },
            },
            ModelAI: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của mô hình AI'
                    },
                    modelname: {
                        type: 'string',
                        description: 'Tên mô hình AI',
                        example: 'Fire-Detection-v1'
                    },
                    description: {
                        type: 'string',
                        description: 'Mô tả về mô hình AI',
                        example: 'Mô hình phát hiện cháy'
                    },
                    createdAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                },
            },
            Camera_Model: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của Camera_Model'
                    },
                    cameraId: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của camera'
                    },
                    modelAIId: {
                        type: 'integer',
                        readOnly: true,
                        description: 'Mã định danh của mô hình AI'
                    },
                    createdAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        readOnly: true,
                        format: 'date-time'
                    },
                },
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/api/*.js'], // JSDoc trong các route API
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
