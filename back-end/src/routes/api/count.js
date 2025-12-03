import express from 'express';
import countController from '../../controller/countController.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Counts
 *   description: Quản lý thông số cảm biến
 */
// Tạo thông số cảm biến
/**
 * @swagger
 * /counts:
 *   post:
 *     operationId: createCount
 *     summary: Tạo mới count
 *     tags: [Counts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/Count'
 *     responses:
 *       201:
 *         description: Tạo count thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Count'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', upload.none(), countController.createCount);

// Lấy tất cả thông số cảm biến với phân trang
/**
 * @swagger
 * /counts:
 *   get:
 *     operationId: getAllCounts
 *     summary: Lấy danh sách counts
 *     tags: [Counts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lấy danh sách count thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Count'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', countController.getAllCounts);

// Lấy thông số cảm biến theo ID
/**
 * @swagger
 * /counts/{id}:
 *   get:
 *     operationId: getCountById
 *     summary: Lấy chi tiết count
 *     tags: [Counts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Lấy chi tiết count thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Count'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', countController.getCountById);

// Cập nhật thông số cảm biến theo ID
/**
 * @swagger
 * /counts/{id}:
 *   put:
 *     operationId: updateCount
 *     summary: Cập nhật count
 *     tags: [Counts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/Count'
 *     responses:
 *       200:
 *         description: Cập nhật Count thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Count'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', upload.none(), countController.updateCount);

// Xóa thông số cảm biến theo ID
/**
 * @swagger
 * /counts/{id}:
 *   delete:
 *     operationId: deleteCountById
 *     summary: Xóa count
 *     tags: [Counts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Xóa count thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', countController.deleteCount);

// Xóa tất cả thông số cảm biến
/** 
 * @swagger
 * /counts:
 *   delete:
 *     operationId: deleteAllCount
 *     summary: Xóa tất cả count
 *     tags: [Counts]
 *     security:
 *       - bearerAuth: []
 *   responses:
 *    204:
 *     description: Xóa thành công
 *    500:
 *     description: Lỗi máy chủ nội bộ
 */
router.delete('/', countController.deleteAllCount);

export default router;