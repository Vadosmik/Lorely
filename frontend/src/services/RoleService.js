import { apiClient } from './apiClient';

const PATH = '/roles';

export const roleService = {
  async getRoles() {
    const res = await apiClient.request(`${PATH}/`, { method: 'GET' });
    return res.json();
  },

  async createRole(title) {
    const res = await apiClient.request(`${PATH}/`, {
      method: 'POST',
      body: JSON.stringify({ title })
    });
    return res.json();
  },

  async assignRoleToUser( user_id, role_id ) {
    const res = await apiClient.request(`${PATH}/assign`, {
      method: 'POST',
      body: JSON.stringify({ user_id, role_id })
    });
    return res.json();
  },

  async removeRoleFromUser( user_id, role_id ) {
    const res = await apiClient.request(`${PATH}/assign`, { 
      method: 'DELETE',
      body: JSON.stringify({ user_id, role_id }) });
    return res.json();
  },

  async deleteRole(role_id) {
    const res = await apiClient.request(`${PATH}/${role_id}`, { method: 'DELETE', });
    return res.json();
  }
}