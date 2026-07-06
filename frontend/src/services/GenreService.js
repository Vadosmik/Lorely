const API_BASE = 'http://localhost:80/genre';

export const genreService = {
    async getGenres() {
    const res = await fetch(`${API_BASE}/`);
    if (!res.ok) throw new Error('Server error');
    return res.json();
  },
}