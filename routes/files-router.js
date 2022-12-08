import express from 'express';
import { authorize } from '../middleware/authorize.js';
import FilesController from '../controllers/files-controller.js';

const router = express.Router();

router.put('/upload', authorize, FilesController.upload);

export default router;
