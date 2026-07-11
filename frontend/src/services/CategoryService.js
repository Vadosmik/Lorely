import { apiClient } from './apiClient';

const PATH = '/category';

export const categoryService = {
  async getCategories() {
    const res = await apiClient.request(`${PATH}/`);
    return res.json();
  },

  async createCategory(categoryData) {
    const res = await apiClient.request(`${PATH}/`, {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
    return res.json();
  },

  async updateCategory(categoryId, categoryData) {
    const res = await apiClient.request(`${PATH}/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData)
    });
    return res.json();
  },

  async deleteCategory(categoryId) {
    const res = await apiClient.request(`${PATH}/${categoryId}`, { method: 'DELETE' });
    return res.json();
  }
};