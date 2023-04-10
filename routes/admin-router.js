import express from 'express';
import AdminController from '../controllers/admin-controller.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.get('/users', authorize, AdminController.getAllUsers);
router.delete('/user/:id', authorize, AdminController.deleteUser);

export default router;
