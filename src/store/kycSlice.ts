import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface KycState {
  kycStatus: KycStatus;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

const initialState: KycState = {
  kycStatus: 'NOT_SUBMITTED',
  submittedAt: null,
  reviewedAt: null,
  rejectionReason: null,
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    setKycStatus(state, action: PayloadAction<Partial<KycState>>) {
      return { ...state, ...action.payload } as KycState;
    },
    resetKyc() {
      return initialState;
    },
  },
});

export const { setKycStatus, resetKyc } = kycSlice.actions;
export default kycSlice.reducer;
