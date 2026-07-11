import { apiClient } from './apiClient';

const PATH = '/catalog';

export const catalogService = {
  async getStories() {
    const res = await apiClient.request(`${PATH}/`);
    return res.json();
  },

  async getMinePublishedStories() {
    const res = await apiClient.request(`${PATH}/mine`);
    return res.json();
  },

  async searchStories(filters) {
    const res = await apiClient.request(`${PATH}/search`, {
      method: 'POST',
      body: JSON.stringify(filters)
    });
    return res.json();
  },

  async getStory(story_id) {
    const res = await apiClient.request(`${PATH}/${story_id}`);
    return res.json();
  },

  async publishStory(storyData) {
    const res = await apiClient.request(`${PATH}/`, {
      method: 'POST',
      body: JSON.stringify(storyData)
    });
    return res.json();
  },

  async updateStoryInfo(story_id, updateData) {
    const res = await apiClient.request(`${PATH}/${story_id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
    return res.json();
  },

  async deleteStory(story_id) {
    const res = await apiClient.request(`${PATH}/${story_id}`, { method: 'DELETE' });
    return true;
  }
};