import express from 'express';
import cors from "cors";
import 'dotenv/config';
import dbConnect from './config/db.js';

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5500;

dbConnect();



app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
});

