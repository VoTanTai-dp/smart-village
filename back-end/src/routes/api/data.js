import express from 'express';
import dataController from '../../controller/dataController.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Data
 *   description: Quản lý dữ liệu
 */
// Tạo dữ liệu
/**
 * @swagger
 * /data:
 *   post:
 *     operationId: createData
 *     summary: Tạo mới data
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/Data'
 *     responses:
 *       201:
 *         description: Tạo data thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Data'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', upload.none(), dataController.createData);

// Lấy tất cả dữ liệu với phân trang
/**
 * @swagger
 * /data:
 *   get:
 *     operationId: getAllData
 *     summary: Lấy danh sách data
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lấy danh sách data thành công
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
 *                         $ref: '#/components/schemas/Data'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', dataController.getAllData);

// Lấy dữ liệu theo ID
/**
 * @swagger
 * /data/{id}:
 *   get:
 *     operationId: getDataById
 *     summary: Lấy chi tiết data
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Lấy chi tiết data thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Data'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', dataController.getDataById);

// Cập nhật dữ liệu theo ID
/**
 * @swagger
 * /data/{id}:
 *   put:
 *     operationId: updateData
 *     summary: Cập nhật data
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/Data'
 *     responses:
 *       200:
 *         description: Cập nhật Data thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Data'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', upload.none(), dataController.updateData);

// Xóa dữ liệu theo ID
/**
 * @swagger
 * /data/{id}:
 *   delete:
 *     operationId: deleteDataById
 *     summary: Xóa data
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Xóa data thành công
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
router.delete('/:id', dataController.deleteData);

// Xóa tất cả dữ liệu
/** 
 * @swagger
 * /data:
 *   delete:
 *     operationId: deleteAllData
 *     summary: Xóa tất cả data
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *   responses:
 *    204:
 *     description: Xóa thành công
 *    500:
 *     description: Lỗi máy chủ nội bộ
 */
router.delete('/', dataController.deleteAllData);

export default router;