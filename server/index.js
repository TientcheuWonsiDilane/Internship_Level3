import express from 'express';
import cors from "cors";
import 'dotenv/config';
import dbConnect from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
const port = process.env.PORT || 5500;

dbConnect();

app.use('/api/auth', authRoutes);

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
});

