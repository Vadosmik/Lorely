import { apiClient } from './apiClient';

const PATH = '/stories';

export const storyService = {
  async getStories() {
    const res = await apiClient.request(`${PATH}/`);
    return res.json();
  },

  async getStory(story_id) {
    const res = await apiClient.request(`${PATH}/${story_id}`);
    return res.json();
  },

  async createStory(storyData) {
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