import { apiClient } from './apiClient';

export const usageApi = {
  logUsage: (usageData) =>
    apiClient('/usage', {
      method: 'POST',
      body: JSON.stringify(usageData),
    }),

  getUsage: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/usage${query ? `?${query}` : ''}`);
  },

  getStats: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/usage/stats${query ? `?${query}` : ''}`);
  },

  simulateTraffic: (data = {}) =>
    apiClient('/usage/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
