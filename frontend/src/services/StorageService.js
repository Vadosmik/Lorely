import { apiClient } from './apiClient';

const PATH = '/storage';

export const storageService = {
  async getFile(path) {
    const res = await apiClient.request(`${PATH}/download/${path}`, { method: 'GET' });
    return res.blob();
  },

  async uploadFile( file_type, file ) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.request(`${PATH}/upload/${file_type}`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async deleteFile(path) {
    const res = await apiClient.request(`${PATH}/delete/${path}`, { method: 'DELETE' });
    return true;
  }
}