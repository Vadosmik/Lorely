const API_BASE = 'http://localhost:80/catalog';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const catalogService = {
  async getStories() {
    const res = await fetch(`${API_BASE}/`);
    if (!res.ok) throw new Error('Server error');
    return res.json();
  },

  async getMinePublishedStories() {
    const res = await fetch(`${API_BASE}/mine`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Server error');
    return res.json();
  },

  async getStory(story_id) {
    const res = await fetch(`${API_BASE}/${story_id}`);
    if (!res.ok) {
      const err = new Error('Server error');
      err.status = res.status;
      throw err;
    };
    return res.json();
  },

  async publishStory(storyData) {
    const res = await fetch(`${API_BASE}/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(storyData)
    });
    if (!res.ok) {
      throw new Error('Server error');
    }
    return res.json();
  },

  async updateStoryInfo(story_id, updateData) {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const res = await fetch(`${API_BASE}/${story_id}`, {
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

  async deleteStory(story_id) {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const res = await fetch(`${API_BASE}/${story_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 401) {
        localStorage.removeItem('token');
      }

      throw new Error(errorData.detail || 'Update error');
    }

    return true;
  }
};