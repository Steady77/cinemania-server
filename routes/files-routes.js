import express from 'express';
import pool from '../db.js';
import { authorize } from '../middleware/authorize.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { makeDir, removeFile } from '../utils/files.js';

const __dirname = path.resolve();
const uploadPath = path.resolve(__dirname, `upload`);

const router = express.Router();

router.put('/upload', authorize, async (req, res) => {
  try {
    const { id } = req.user;

    if (!req.files || Object.keys(req.files).length === 0) {
      return req.status(400).json({ message: 'Файл не найден' });
    }

    const { image } = req.files;
    const newImageName = uuidv4() + '.jpg';

    const oldUserAvatar = await pool.query('SELECT avatar FROM users WHERE id = $1', [id]);
    const oldImageName = oldUserAvatar.rows[0].avatar;

    removeFile(uploadPath, oldImageName);
    makeDir(uploadPath, id);

    const filePath = path.join(uploadPath, id, newImageName);
    image.mv(filePath);

    const newUserAvatar = path.join(id, newImageName);

    await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [newUserAvatar, id]);

    res.status(200).json({ message: 'Файл успешно загружен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при загрузке файла', error: error.message });
  }
});

export default router;
