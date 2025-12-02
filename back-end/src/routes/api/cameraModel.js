import express from 'express';
import cameraModelController from '../../controller/cameraModelController.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Camera_Model
 *   description: Quản lý tính năng AI theo camera
 */
// Tạo tính năng AI theo camera
/**
 * @swagger
 * /camera_model:
 *   post:
 *     operationId: createCamera_Model
 *     summary: Tạo mới camera_model
 *     tags: [Camera_Model]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/Camera_Model'
 *     responses:
 *       201:
 *         description: Tạo camera_model thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Camera_Model'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', upload.none(), cameraModelController.createCamera_Model);

// Lấy tất cả tính năng AI theo camera với phân trang
/**
 * @swagger
 * /camera_model:
 *   get:
 *     operationId: getAllCamera_Models
 *     summary: Lấy danh sách camera_model
 *     tags: [Camera_Model]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lấy danh sách camera_model thành công
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
 *                         $ref: '#/components/schemas/Camera_Model'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', cameraModelController.getAllCamera_Models);

// Lấy tính năng AI theo camera theo ID
/**
 * @swagger
 * /camera_model/{id}:
 *   get:
 *     operationId: getCamera_ModelById
 *     summary: Lấy chi tiết camera_model
 *     tags: [Camera_Model]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Lấy chi tiết camera_model thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Camera_Model'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', cameraModelController.getCamera_ModelById);

// Cập nhật tính năng AI theo camera theo ID
/**
 * @swagger
 * /camera_model/{id}:
 *   put:
 *     operationId: updateCamera_Model
 *     summary: Cập nhật camera_model
 *     tags: [Camera_Model]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/Camera_Model'
 *     responses:
 *       200:
 *         description: Cập nhật Camera_Model thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Camera_Model'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', upload.none(), cameraModelController.updateCamera_Model);

// Xóa tính năng AI theo camera theo ID
/**
 * @swagger
 * /camera_model/{id}:
 *   delete:
 *     operationId: deleteCamera_Model
 *     summary: Xóa camera_model
 *     tags: [Camera_Model]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Xóa camera_model thành công
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
router.delete('/:id', cameraModelController.deleteCamera_Model);

// Xóa tất cả tính năng AI theo camera
/** 
 * @swagger
 * /camera_model:
 *   delete:
 *     operationId: deleteAllCamera_Model
 *     summary: Xóa tất cả camera_model
 *     tags: [Camera_Model]
 *     security:
 *       - bearerAuth: []
 *   responses:
 *    204:
 *     description: Xóa thành công
 *    500:
 *     description: Lỗi máy chủ nội bộ
 */
router.delete('/', cameraModelController.deleteAllCamera_Model);

export default router;