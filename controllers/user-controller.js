import UserService from '../services/user-service.js';

class UserController {
  async getProfile(req, res, next) {
    try {
      const { id } = req.user;
      const user = await UserService.getProfile(id);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { id } = req.user;
      const { email, password } = req.body;

      await UserService.updateProfile(id, email, password);

      res.status(200).json({ message: 'Профиль обновлен' });
    } catch (error) {
      next(error);
    }
  }

  async getFavorites(req, res, next) {
    try {
      const { id } = req.user;
      const favoritesIds = await UserService.getFavorites(id);

      res.status(200).json(favoritesIds);
    } catch (error) {
      next(error);
    }
  }

  async toggleFavorites(req, res, next) {
    try {
      const { id } = req.user;
      const { filmId } = req.body;

      await UserService.toggleFavorites(id, filmId);

      res.status(200).json({ message: 'Избранное успешно обновлено' });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
