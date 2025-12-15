import express from 'express';
import databaseController from '../../controller/databaseController.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.get('/tables', databaseController.listTables);
router.get('/:table', databaseController.getTableData);
router.post('/:table', upload.single('avatar'), databaseController.createRow);
router.put('/:table/:id', upload.single('avatar'), databaseController.updateRow);
router.delete('/:table/:id', databaseController.deleteRow);

export default router;
