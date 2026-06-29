const API_BASE = 'http://localhost:80/users';

export const profileService = {
  async getUsers() {
    const res = await fetch(`${API_BASE}/`, {
      method: 'GET'
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${res.status}`);
    }

    return res.json();
  },

  async getUser(username) {
    const res = await fetch(`${API_BASE}/${username}`, {
      method: 'GET'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${res.status}`);
    }

    return res.json();
  },

  async getMe() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const res = await fetch(`${API_BASE}/me/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      localStorage.removeItem('token');
      return null;
    }
    return res.json();
  },

  async updateMyInfo(updateData) {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const res = await fetch(`${API_BASE}/me/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 401) {
        localStorage.removeItem('token');
      }

      throw new Error(errorData.detail || 'Update error');
    }

    return res.json();
  },

  async updateMyPassword(passwordData) {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const res = await fetch(`${API_BASE}/me/password`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 401) {
        localStorage.removeItem('token');
      }

      throw new Error(errorData.detail || 'Password update error');
    }

    return res.json();
  },

  async deleteMyAccount() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const res = await fetch(`${API_BASE}/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Delete account error');
    }

    localStorage.removeItem('token');

    return res.json();
  }
}