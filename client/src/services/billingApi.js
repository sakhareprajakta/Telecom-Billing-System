import { apiClient } from './apiClient';

export const billingApi = {
  preview: (data) =>
    apiClient('/billing/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  generate: (data) =>
    apiClient('/billing/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runCycle: (data) =>
    apiClient('/billing/cycle', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
