import {register, login, logout, githubCallback, redirectToGitHub, forgotPassword} from '../controllers/authController.js';
import express from 'express';

const router = express.Router();

router.post('/register',  register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/github', redirectToGitHub);
router.get('/github/callback', githubCallback);
router.post('/forgot-password', forgotPassword);

export default router;

