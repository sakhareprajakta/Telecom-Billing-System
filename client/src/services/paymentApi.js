import { apiClient } from './apiClient';

export const paymentApi = {
  makePayment: (paymentData, idempotencyKey) =>
    apiClient('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
      headers: idempotencyKey ? { 'idempotency-key': idempotencyKey } : {},
    }),

  getPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/payments${query ? `?${query}` : ''}`);
  },
};
