import { apiClient } from './apiClient';

export const reportApi = {
  getDashboardStats: () => apiClient('/reports/dashboard'),

  getNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/reports/notifications${query ? `?${query}` : ''}`);
  },

  markRead: (id) =>
    apiClient(`/reports/notifications/${id}/read`, {
      method: 'PUT',
    }),
};
