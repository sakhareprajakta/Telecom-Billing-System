import { apiClient } from './apiClient';

export const customerApi = {
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/customers${query ? `?${query}` : ''}`);
  },

  getCustomerById: (id) => apiClient(`/customers/${id}`),

  updateCustomer: (id, data) =>
    apiClient(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
