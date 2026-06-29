const API_BASE = 'http://localhost:80/storage';

export const storageService = {
  async getFile(path) {
    const res = await fetch(`${API_BASE}/download/${path}`, {
      method: 'GET'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${res.status}`);
    }

    return res.blob();
  },

  async uploadFile( file_type, file ) {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload/${file_type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${res.status}`);
    }
    
    return res.json();
  },

  async deleteFile(path) {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const res = await fetch(`${API_BASE}/delete/${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${res.status}`);
    }

    return true;
  }
}