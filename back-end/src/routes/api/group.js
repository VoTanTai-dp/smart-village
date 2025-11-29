import express from 'express';
import groupController from '../../controller/groupController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Quản lý nhóm người dùng
 */
// Tạo nhóm người dùng
/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Tạo mới group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/Group'
 *     responses:
 *       201:
 *         description: Tạo group thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', groupController.createGroup);

// Lấy tất cả nhóm người dùng với phân trang
/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Lấy danh sách groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lấy danh sách group thành công
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
 *                         $ref: '#/components/schemas/Group'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', groupController.getAllGroups);

// Lấy nhóm người dùng theo ID
/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Lấy chi tiết user
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID group
 *     responses:
 *       200:
 *         description: Lấy chi tiết group thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Group'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', groupController.getGroupById);

// Cập nhật nhóm người dùng theo ID
/**
 * @swagger
 * /groups/{id}:
 *   put:
 *     summary: Cập nhật group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID group
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/Group'
 *     responses:
 *       200:
 *         description: Cập nhật Group thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Group'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', groupController.updateGroup);

// Xóa nhóm người dùng theo ID
/**
 * @swagger
 * /groups/{id}:
 *   delete:
 *     summary: Xóa group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID group
 *     responses:
 *       200:
 *         description: Xóa group thành công
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
router.delete('/:id', groupController.deleteGroup);

// Xóa tất cả nhóm người dùng
/** 
 * @swagger
 * /groups:
 *   delete:
 *     summary: Xóa tất cả user
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *   responses:
 *    204:
 *     description: Xóa thành công
 *    500:
 *     description: Lỗi máy chủ nội bộ
 */
router.delete('/', groupController.deleteAllGroup);

// Gán vai trò cho nhóm người dùng
// router.post('/:groupId/roles/:roleId', groupController.assignRoleToGroup);

export default router;