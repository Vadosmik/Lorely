import { apiClient } from './apiClient';

const PATH = '/users';

export const profileService = {
  async getUsers() {
    const res = await apiClient.request(`${PATH}/`, { method: 'GET' });
    return res.json();
  },

  async getUser(id) {
    const res = await apiClient.request(`${PATH}/${id}`, { method: 'GET' });
    return res.json();
  },

  async getUserByUsername(username) {
    const res = await apiClient.request(`${PATH}/by/${username}`, { method: 'GET' });
    return res.json();
  },

  async getMe() {
    const res = await apiClient.request(`${PATH}/me/profile`, { method: 'GET' });
    return res.json();
  },

  async updateMyInfo(updateData) {
    const res = await apiClient.request(`${PATH}/me/profile`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
    return res.json();
  },

  async updateMyPassword(passwordData) {
    const res = await apiClient.request(`${PATH}/me/password`, {
      method: 'PATCH',
      body: JSON.stringify(passwordData)
    });
    return res.json();
  },

  async deleteMyAccount() {
    const res = await apiClient.request(`${PATH}/me`, { method: 'DELETE', });
    return res.json();
  }
}