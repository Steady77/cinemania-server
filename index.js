import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth-router.js';
import adminRouter from './routes/admin-router.js';
import filesRouter from './routes/files-router.js';
import userRouter from './routes/user-router.js';
import fileUpload from 'express-fileupload';
import path from 'path';
import { exeption } from './middleware/exeption.js';

dotenv.config();

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;
const app = express();

// const corsOptions = { credentials: true, origin: process.env.URL || '*' };
const fileOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
};

app.use(cors());
app.use(json());
app.use('/upload', express.static(path.resolve(__dirname, 'upload')));
app.use(fileUpload(fileOptions));
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/files', filesRouter);
app.use('/user', userRouter);

app.use(exeption);

app.listen(PORT, () => console.log('Server started'));
