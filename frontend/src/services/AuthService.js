import { apiClient } from './apiClient';

const PATH = '/auth';

export const authService = {
  async register(username, email, password, tos_accepted) {
    const res = await apiClient.request(`${PATH}/register`, {
      method: 'POST',
      body: JSON.stringify({ username, email, password, tos_accepted })
    });
    return res.json();
  },
  
  async login(usernameOrEmail, password) {
    const res = await apiClient.request(`${PATH}/login`, {
      method: 'POST',
      body: JSON.stringify({ 
        username_or_email: usernameOrEmail,
        password: password 
      })
    });
    return res.json();
  }
}