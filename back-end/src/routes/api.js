import express from 'express';
import userRouter from './api/user.js';
import groupRouter from './api/group.js';
import roleRouter from './api/role.js';
import groupRoleRouter from './api/groupRole.js';
import cameraRouter from './api/camera.js';
import sessionRouter from './api/session.js';
import dataRouter from './api/data.js';
import countRouter from './api/count.js';
import modelAIRouter from './api/modelAI.js';
import cameraModelRouter from './api/cameraModel.js';
import streamRoute from './api/stream.js';

const router = express.Router();

const initApiRoutes = (app) => {
    router.use('/users', userRouter);
    router.use('/groups', groupRouter);
    router.use('/roles', roleRouter);
    router.use('/group_role', groupRoleRouter);
    router.use('/cameras', cameraRouter);
    router.use('/sessions', sessionRouter);
    router.use('/data', dataRouter);
    router.use('/counts', countRouter);
    router.use('/modelAI', modelAIRouter);
    router.use('/camera_model', cameraModelRouter);

    app.use('/api/v1', streamRoute);
    app.use('/api/v1', router);
    return app;
};

export default initApiRoutes;