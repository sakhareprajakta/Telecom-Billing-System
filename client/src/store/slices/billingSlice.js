import { createSlice } from '@reduxjs/toolkit';

const billingSlice = createSlice({
  name: 'billing',
  initialState: {
    selectedPeriod: '2026-10',
    selectedCustomerId: null,
    activeCalculation: null,
  },
  reducers: {
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    setSelectedCustomerId: (state, action) => {
      state.selectedCustomerId = action.payload;
    },
    setActiveCalculation: (state, action) => {
      state.activeCalculation = action.payload;
    },
  },
});

export const { setSelectedPeriod, setSelectedCustomerId, setActiveCalculation } = billingSlice.actions;
export default billingSlice.reducer;
