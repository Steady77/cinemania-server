import ApiError from '../exeptions/api-error.js';
import FilesService from '../services/files-service.js';

class FilesController {
  async upload(req, res, next) {
    try {
      const { id } = req.user;
      const { image } = req.files;

      if (!req.files || Object.keys(req.files).length === 0) {
        return ApiError.BadRequest('Файл не найден');
      }

      const avatarUrl = await FilesService.upload(id, image);

      res.status(200).json({ message: 'Файл успешно загружен', url: avatarUrl });
    } catch (error) {
      next(error);
    }
  }
}

export default new FilesController();
