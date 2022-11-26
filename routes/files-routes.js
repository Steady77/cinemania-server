import express from 'express';
import pool from '../db.js';
import { authorize } from '../middleware/authorize.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.resolve();

const router = express.Router();

router.put('/upload', authorize, async (req, res) => {
  try {
    const { id } = req.user;

    if (!req.files || Object.keys(req.files).length === 0) {
      return req.status(400).json({ message: 'Файл не найден' });
    }

    const { image } = req.files;
    let fileName = uuidv4() + '.jpg';

    image.mv(path.resolve(__dirname, 'upload', fileName));
    await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [fileName, id]);

    res.status(200).json({ message: 'Файл успешно загружен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при загрузке файла', error: error.message });
  }
});

export default router;
