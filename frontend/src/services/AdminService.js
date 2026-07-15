import { apiClient } from './apiClient';

const PATH = '/admin';

export const adminService = {
  async getUsers() {
    const res = await apiClient.request(`${PATH}/users`, { method: 'GET' });
    return res.json();
  },
}