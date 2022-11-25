import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth-routes.js';
import usersRouter from './routes/users-routes.js';
import filesRouter from './routes/files-routes.js';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
app.use('/users', usersRouter);
app.use('/files', filesRouter);

app.listen(PORT, () => console.log('Server started'));
