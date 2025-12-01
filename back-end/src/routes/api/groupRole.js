import express from 'express';
import groupRoleController from '../../controller/groupRoleController.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Group_Role
 *   description: Quản lý phân quyền theo nhóm người dùng
 */
// Tạo phân quyền theo nhóm người dùng
/**
 * @swagger
 * /group_role:
 *   post:
 *     summary: Tạo mới group_role
 *     tags: [Group_Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/Group_Role'
 *     responses:
 *       201:
 *         description: Tạo group_role thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Group_Role'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', upload.none(), groupRoleController.createGroup_Role);

// Lấy tất cả phân quyền theo nhóm người dùng với phân trang
/**
 * @swagger
 * /group_role:
 *   get:
 *     summary: Lấy danh sách group_role
 *     tags: [Group_Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lấy danh sách group_role thành công
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
 *                         $ref: '#/components/schemas/Group_Role'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', groupRoleController.getAllGroup_Roles);

// Lấy phân quyền theo nhóm người dùng theo ID
/**
 * @swagger
 * /group_role/{id}:
 *   get:
 *     summary: Lấy chi tiết group_role
 *     tags: [Group_Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID group_role
 *     responses:
 *       200:
 *         description: Lấy chi tiết group_role thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Group_Role'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', groupRoleController.getGroup_RoleById);

// Cập nhật phân quyền theo nhóm người dùng theo ID
/**
 * @swagger
 * /group_role/{id}:
 *   put:
 *     summary: Cập nhật group_role
 *     tags: [Group_Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID group_role
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/Group_Role'
 *     responses:
 *       200:
 *         description: Cập nhật Group_Role thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Group_Role'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', upload.none(), groupRoleController.updateGroup_Role);

// Xóa phân quyền theo nhóm người dùng theo ID
/**
 * @swagger
 * /group_role/{id}:
 *   delete:
 *     summary: Xóa group_role
 *     tags: [Group_Role]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID group_role
 *     responses:
 *       200:
 *         description: Xóa group_role thành công
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
router.delete('/:id', groupRoleController.deleteGroup_Role);

// Xóa tất cả phân quyền theo nhóm người dùng
/** 
 * @swagger
 * /group_role:
 *   delete:
 *     summary: Xóa tất cả group_role
 *     tags: [Group_Role]
 *     security:
 *       - bearerAuth: []
 *   responses:
 *    204:
 *     description: Xóa thành công
 *    500:
 *     description: Lỗi máy chủ nội bộ
 */
router.delete('/', groupRoleController.deleteAllGroup_Role);

export default router;