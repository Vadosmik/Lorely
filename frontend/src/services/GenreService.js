import { apiClient } from './apiClient';

const PATH = '/genre';

export const genreService = {
    async getGenres() {
    const res = await apiClient.request(`${PATH}/`);
    return res.json();
  },

  async createGenre(genreData) {
    const res = await apiClient.request(`${PATH}/`, {
      method: 'POST',
      body: JSON.stringify(genreData)
    });
    return res.json();
  },

  async updateGenre(genreId, genreData) {
    const res = await apiClient.request(`${PATH}/${genreId}`, {
      method: 'PATCH',
      body: JSON.stringify(genreData)
    });
    return res.json();
  },

  async deleteGenre(genreId) {
    const res = await apiClient.request(`${PATH}/${genreId}`, { method: 'DELETE' });
    return res.json();
  }
}