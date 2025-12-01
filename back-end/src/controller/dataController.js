import dataService from '../service/dataService.js'

const createData = async (req, res) => {
    try {
        const newData = await dataService.createData(req.body);
        return res.status(201).json({
            success: true,
            message: 'Data created successfully',
            data: newData
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const getAllData = async (req, res) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        if (!page || page <= 0) page = 1;
        if (!limit || limit <= 0) limit = 10;

        const allData = await dataService.getAllData({ page, limit });
        return res.status(200).json({
            success: true,
            message: 'Data retrieved successfully',
            data: allData,
            meta: allData.meta
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const getDataById = async (req, res) => {
    try {
        const dataId = await dataService.getDataById(req.params.id);
        if (!dataId) {
            return res.status(404).json({
                success: false,
                message: 'Data not found',
                errorCode: 'DATA_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Get data successfully',
            data: dataId
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const updateData = async (req, res) => {
    try {
        const updateData = await dataService.updateData(req.params.id, req.body);
        if (!updateData) {
            return res.status(404).json({
                success: false,
                message: 'Data not found',
                errorCode: 'DATA_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Data updated successfully',
            data: updateData
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const deleteData = async (req, res) => {
    try {
        const deleteData = await dataService.deleteData(req.params.id);
        if (!deleteData) {
            return res.status(404).json({
                success: false,
                message: 'Data not found',
                errorCode: 'DATA_NOT_FOUND'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Data deleted successfully',
            data: deleteData
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

const deleteAllData = async (req, res) => {
    try {
        await dataService.deleteAllData();
        return res.status(200).json({
            success: true,
            message: 'All data deleted successfully',
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: e.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

module.exports = {
    createData,
    getAllData,
    getDataById,
    updateData,
    deleteData,
    deleteAllData
};