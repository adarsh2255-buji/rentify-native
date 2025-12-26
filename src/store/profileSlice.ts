import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileState {
  name: string;
  profilePhotoUrl?: string;
  email: string;
  mobileNumber: string;
  alternateContact?: string;
  communicationPreferences?: string[];
  kycStatus: string;
  kycVerifiedAt?: string;
}

const initialState: ProfileState = {
  name: '',
  profilePhotoUrl: '',
  email: '',
  mobileNumber: '',
  alternateContact: '',
  communicationPreferences: [],
  kycStatus: '',
  kycVerifiedAt: '',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<Partial<ProfileState>>) {
      return { ...state, ...action.payload };
    },
    clearProfile() {
      return initialState;
    },
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
