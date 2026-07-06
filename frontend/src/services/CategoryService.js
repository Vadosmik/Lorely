const API_BASE = 'http://localhost:80/category';

export const categoryService = {
    async getCategories() {
    const res = await fetch(`${API_BASE}/`);
    if (!res.ok) throw new Error('Server error');
    return res.json();
  },
}