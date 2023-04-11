import express from 'express';
import { authorize } from '../middleware/authorize.js';
import UserController from '../controllers/user-controller.js';

const router = express.Router();

router.get('/profile', authorize, UserController.getProfile);
router.put('/profile', authorize, UserController.updateProfile);
router.delete('/profile/:id', authorize, UserController.deleteProfile);

router.get('/profile/favorites', authorize, UserController.getFavorites);
router.post('/profile/favorites', authorize, UserController.toggleFavorites);

router.get('/profile/history', authorize, UserController.getWatchHistory);
router.post('/profile/history', authorize, UserController.setWatchHistory);

export default router;
