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
import { Server } from 'socket.io';
import http from 'http';
import { CORS_OPTIONS, FILE_OPTIONS, PORT, SOCKET_OPTIONS } from './utils/consts.js';
import { onConnection } from './socket_io/on-connection.js';

dotenv.config();

const __dirname = path.resolve();

const app = express();
const server = http.Server(app);
const io = new Server(server, SOCKET_OPTIONS);

app.use(cors(CORS_OPTIONS));
app.use(json());
app.use('/upload', express.static(path.resolve(__dirname, 'upload')));
app.use(fileUpload(FILE_OPTIONS));
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/files', filesRouter);
app.use('/user', userRouter);

app.use(exeption);

io.on('connection', (socket) => {
	onConnection(io, socket);
});

server.listen(PORT, (error) => {
	if (error) {
		throw new Error(error);
	}

	console.log('Server started');
});
