import sessionService from '../service/sessionService.js';

const createSession = async (req, res) => {
    try {
        const session = await sessionService.createSession(req.body);
        res.status(201).json({
            success: true,
            message: 'Session created successfully',
            data: session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: error.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const getAllSessions = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        if (page <= 0) page = 1;
        if (limit <= 0) limit = 10;

        const sessions = await sessionService.getAllSessions({ page, limit });
        res.status(200).json({
            success: true,
            message: 'Sessions retrieved successfully',
            data: sessions.data,
            meta: sessions.meta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: error.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const getSessionById = async (req, res) => {
    try {
        const session = await sessionService.getSessionById(req.params.id);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found',
                errorCode: 'SESSION_NOT_FOUND'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Session retrieved successfully',
            data: session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: error.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const updateSession = async (req, res) => {
    try {
        const updatedSession = await sessionService.updateSession(req.params.id, req.body);
        if (!updatedSession) {
            return res.status(404).json({
                success: false,
                message: 'Session not found',
                errorCode: 'SESSION_NOT_FOUND'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Session updated successfully',
            data: updatedSession
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: error.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const deleteSessionById = async (req, res) => {
    try {
        const deletedSession = await sessionService.deleteSessionById(req.params.id);
        if (!deletedSession) {
            return res.status(404).json({
                success: false,
                message: 'Session not found',
                errorCode: 'SESSION_NOT_FOUND'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Session deleted successfully',
            data: deletedSession
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: error.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const deleteAllSessions = async (req, res) => {
    try {
        await sessionService.deleteAllSessions();
        res.status(200).json({
            success: true,
            message: 'All sessions deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: error.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

module.exports = {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSessionById,
    deleteAllSessions,
};