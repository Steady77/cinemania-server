import AdminService from '../services/admin-service.js';

class AdminController {
  async getAllUsers(req, res, next) {
    try {
      const { keyword } = req.query;

      const users = await AdminService.getAllUsers(keyword);

      res.status(200).json({
        users: users.map((user) => ({
          id: user.id,
          email: user.email,
          isAdmin: user.is_admin,
          createdAt: user.created_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      await AdminService.deleteUser(id);

      res.status(200).json({ message: 'Пользователь удален' });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
