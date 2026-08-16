import {register, login, logout, githubCallback, redirectToGitHub} from '../controllers/authController.js';
import express from 'express';
import { verifyJWT, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register',  register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/github', redirectToGitHub);
router.get('/github/callback', githubCallback);

export default router;