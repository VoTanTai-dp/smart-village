import express from 'express';
import modelAIController from '../../controller/modelAIController.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ModelAI
 *   description: Quản lý tính năng AI
 */
// Tạo tính năng AI
/**
 * @swagger
 * /modelAI:
 *   post:
 *     summary: Tạo mới modelAI
 *     tags: [ModelAI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/ModelAI'
 *     responses:
 *       201:
 *         description: Tạo modelAI thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ModelAI'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', upload.none(), modelAIController.createModelAI);

// Lấy tất cả tính năng AI với phân trang
/**
 * @swagger
 * /modelAI:
 *   get:
 *     summary: Lấy danh sách modelAIs
 *     tags: [ModelAI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lấy danh sách modelAI thành công
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
 *                         $ref: '#/components/schemas/ModelAI'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', modelAIController.getAllModelAIs);

// Lấy tính năng AI theo ID
/**
 * @swagger
 * /modelAI/{id}:
 *   get:
 *     summary: Lấy chi tiết modelAI
 *     tags: [ModelAI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID modelAI
 *     responses:
 *       200:
 *         description: Lấy chi tiết modelAI thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ModelAI'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', modelAIController.getModelAIById);

// Cập nhật tính năng AI theo ID
/**
 * @swagger
 * /modelAI/{id}:
 *   put:
 *     summary: Cập nhật modelAI
 *     tags: [ModelAI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID modelAI
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/ModelAI'
 *     responses:
 *       200:
 *         description: Cập nhật ModelAI thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ModelAI'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', upload.none(), modelAIController.updateModelAI);

// Xóa tính năng AI theo ID
/**
 * @swagger
 * /modelAI/{id}:
 *   delete:
 *     summary: Xóa modelAI
 *     tags: [ModelAI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID modelAI
 *     responses:
 *       200:
 *         description: Xóa modelAI thành công
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
router.delete('/:id', modelAIController.deleteModelAI);

// Xóa tất cả tính năng AI
/** 
 * @swagger
 * /modelAI:
 *   delete:
 *     summary: Xóa tất cả modelAI
 *     tags: [ModelAI]
 *     security:
 *       - bearerAuth: []
 *   responses:
 *    204:
 *     description: Xóa thành công
 *    500:
 *     description: Lỗi máy chủ nội bộ
 */
router.delete('/', modelAIController.deleteAllModelAI);

export default router;