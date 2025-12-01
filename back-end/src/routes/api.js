import express from 'express';
import userRouter from './api/user.js';
import groupRouter from './api/group.js';
// import roleRouter from './api/role.js';
// import groupRoleRouter from './api/groupRole.js';
import cameraRouter from './api/camera.js';
// import sessionRouter from './api/session.js';
// import dataRouter from './api/data.js';
// import countRouter from './api/count.js';
// import modelAIRouter from './api/modelAI.js';
// import cameraModelRouter from './api/cameraModel.js';

const router = express.Router();

const initApiRoutes = (app) => {
    router.use('/users', userRouter);
    router.use('/groups', groupRouter);
    // router.use('/roles', roleRouter);
    // router.use('/group-roles', groupRoleRouter);
    router.use('/cameras', cameraRouter);
    // router.use('/sessions', sessionRouter);
    // router.use('/data', dataRouter);
    // router.use('/counts', countRouter);
    // router.use('/models-ai', modelAIRouter);
    // router.use('/camera-models', cameraModelRouter);

    app.use('/api', router);
    return app;
};

export default initApiRoutes;
