import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth-routes.js';
import adminRouter from './routes/admin-routes.js';
import filesRouter from './routes/files-routes.js';
import fileUpload from 'express-fileupload';
import path from 'path';

dotenv.config();

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;
const app = express();

// const corsOptions = { credentials: true, origin: process.env.URL || '*' };

app.use(cors());
app.use(json());
app.use(express.static(path.resolve(__dirname, 'upload')));
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  }),
);
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/files', filesRouter);

app.listen(PORT, () => console.log('Server started'));
