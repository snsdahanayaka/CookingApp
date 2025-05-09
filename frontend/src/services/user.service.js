import api from './api';

class UserService {
  getUserProfile() {
    return api.get('/users/me');
  }

  updateUserProfile(id, userData) {
    return api.put(`/users/${id}`, userData);
  }

  getUserById(id) {
    return api.get(`/users/${id}`);
  }
}

export default new UserService();
