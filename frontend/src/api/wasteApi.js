import { apiClient } from './client';

export const wasteApi = {
  async classifyWaste(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token') || '';
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_BASE}/waste_categories/classify`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error('Classification failed');
    }
    
    const data = await res.json();
    return data.category || 'Unknown';
  },

  async createScan(scanData) {
    // For now, this might not be implemented in the backend
    // Returning a mock success response
    console.log('Creating scan:', scanData);
    return { success: true, ...scanData };
  },

  async getLeaderboard(limit = 100) {
    try {
      // This endpoint might not exist, returning empty array for now
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/profiles/leaderboard?limit=${limit}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      return [];
    }
  },

  async getUserRank(userId) {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/profiles/rank/${userId}`);
      if (res.ok) {
        const data = await res.json();
        return data.rank || 0;
      }
      return 0;
    } catch (err) {
      console.error('Failed to fetch user rank:', err);
      return 0;
    }
  },
};

