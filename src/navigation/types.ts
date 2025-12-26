export type RootStackParamList = {
  PublicHome: undefined;
  Register: undefined;
  Login: undefined;
  Otp: { email?: string } | undefined; // for registration OTP
  LoginOtp: { email?: string; phone?: string } | undefined; // for login OTP
  Home: undefined;
  KycIntro: undefined;
  KycForm: undefined;
  KycPending: undefined;
  KycRejected: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  ProfileOverview: undefined;
  EditProfile: undefined;
  ChangeEmail: undefined;
  ChangeMobile: undefined;
  PhotoUpdate: undefined;
  CommunicationPreferences: undefined;
  ProductDetails: { productId: string };
};
