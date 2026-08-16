import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

const userRoute = router('');

userRoute.get('/', getAllUsers);
userRoute.get('/:id', getUserById);
userRoute.put('/:id', updateUser);
userRoute.delete('/:id', deleteUser);