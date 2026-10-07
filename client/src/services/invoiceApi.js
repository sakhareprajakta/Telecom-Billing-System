import { apiClient } from './apiClient';

export const invoiceApi = {
  getInvoices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/invoices${query ? `?${query}` : ''}`);
  },

  getInvoiceById: (id) => apiClient(`/invoices/${id}`),
};
