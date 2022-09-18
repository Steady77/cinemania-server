import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth-routes.js';
import usersRouter from './routes/users-routes.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const corsOptions = { credentials: true, origin: process.env.URL || '*' };

app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.listen(PORT, () => console.log('Server started'));
