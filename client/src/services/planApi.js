import { apiClient } from './apiClient';

export const planApi = {
  getPlans: () => apiClient('/plans'),

  createPlan: (planData) =>
    apiClient('/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    }),

  updatePlan: (id, planData) =>
    apiClient(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    }),

  subscribe: (data) =>
    apiClient('/plans/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
