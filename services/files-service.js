import pool from '../db.js';
import { makeDir, removeFile } from '../utils/files.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class FilesService {
  async upload(id, image) {
    const newImageName = uuidv4() + '.jpg';

    const __dirname = path.resolve();
    const uploadPath = path.resolve(__dirname, `upload`);

    const oldUserAvatar = await pool.query('SELECT avatar FROM users WHERE id = $1', [id]);
    const oldImageName = oldUserAvatar.rows[0].avatar;
    console.log(oldImageName);
    removeFile(__dirname, oldImageName);
    makeDir(uploadPath, id);

    const filePath = path.join(uploadPath, id, newImageName);
    image.mv(filePath);

    const newPath = path.join('/upload', id, newImageName);
    const newUserAvatar = newPath.split(path.sep).join(path.posix.sep);

    await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [newUserAvatar, id]);

    return newUserAvatar;
  }
}

export default new FilesService();
