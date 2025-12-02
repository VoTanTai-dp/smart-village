import express from 'express';
import userController from '../../controller/userController.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng
 */

/**
 * @swagger
 * /users:
 *   get: 
 *     operationId: getAllUsers
 *     summary: Lấy danh sách user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lấy danh sách user thành công
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
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     operationId: getUserById
 *     summary: Lấy chi tiết user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Lấy chi tiết user thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     operationId: createUser
 *     summary: Tạo mới user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Tạo user thành công
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
router.post('/', upload.none(), userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     operationId: updateUser
 *     summary: Cập nhật user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Cập nhật user thành công
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', upload.none(), userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     operationId: deleteUser
 *     summary: Xóa user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Xóa user thành công
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
router.delete('/:id', userController.deleteUser);

/** 
 * @swagger
 * /users:
 *   delete:
 *     operationId: deleteAllUsers
 *     summary: Xóa tất cả user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *   responses:
 *    200:
 *     description: Xóa tất cả user thành công
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/ApiResponse'
 *    500:
 *     $ref: '#/components/responses/InternalServerError'
 */
router.delete('/', userController.deleteAllUsers);

export default router;
