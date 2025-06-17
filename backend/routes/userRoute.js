import express from 'express';
import { registerUser, loginUser, adminLogin, getUserProfile, updateUserProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/adminAuth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.get('/profile/:userId', authMiddleware, getUserProfile);
userRouter.put('/profile/:userId', authMiddleware, updateUserProfile);

export default userRouter;
