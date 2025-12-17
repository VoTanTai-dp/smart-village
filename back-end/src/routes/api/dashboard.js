import express from 'express';
import dashboardController from '../../controller/dashboardController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: API Dashboard cảm biến & đếm người/xe theo camera
 */

/**
 * @swagger
 * /dashboard/sensors:
 *   get:
 *     operationId: getSensorDashboard
 *     summary: Lấy dữ liệu dashboard cảm biến theo camera (sắp xếp theo address, cameraId)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy dữ liệu dashboard thành công
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
 *                         type: object
 *                         properties:
 *                           cameraId:
 *                             type: integer
 *                           ip:
 *                             type: string
 *                           port:
 *                             type: string
 *                           address:
 *                             type: string
 *                           latestRecord:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               temperature: { type: number, nullable: true }
 *                               humidity: { type: number, nullable: true }
 *                               people: { type: integer, nullable: true }
 *                               vehicle: { type: integer, nullable: true }
 *                               timestamp: { type: string, nullable: true }
 *                           history:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 timestamp: { type: string }
 *                                 temperature: { type: number }
 *                                 humidity: { type: number }
 *                                 people: { type: integer, nullable: true }
 *                                 vehicle: { type: integer, nullable: true }
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/sensors', dashboardController.getSensorDashboard);

export default router;
