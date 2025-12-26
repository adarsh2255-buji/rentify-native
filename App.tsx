import React, { useEffect, useRef } from 'react';
import { SafeAreaView, StatusBar, useColorScheme, Alert } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';
import LoginOtpScreen from './src/screens/LoginOtpScreen';
import HomeScreen from './src/screens/HomeScreen';
import KycIntroScreen from './src/screens/KycIntroScreen';
import KycFormScreen from './src/screens/KycFormScreen';
import KycPendingScreen from './src/screens/KycPendingScreen';
import KycRejectedScreen from './src/screens/KycRejectedScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import ProfileOverviewScreen from './src/screens/ProfileOverviewScreen';
import type { RootStackParamList } from './src/navigation/types';
import { Linking } from 'react-native';
import store from './src/store';
import { useAppSelector, useAppDispatch } from './src/store/hooks';
import { fetchKycStatus } from './src/services/authApi';
import { setKycStatus } from './src/store/kycSlice';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

function _KycEnforcer() {
  const auth = useAppSelector((s) => s.auth);
  const kyc = useAppSelector((s) => s.kyc);
  const dispatch = useAppDispatch();
  const prevKycRef = useRef<string | null>(null);
  const pollRef = useRef<any>(null);
  const firstFetchedRef = useRef(false);

  // Fetch status immediately when logged in and poll periodically
  useEffect(() => {
    let mounted = true;

    async function updateStatus() {
      if (!auth.isAuthenticated) return;
      try {
        const data = await fetchKycStatus(auth.token ?? null);
        if (!mounted) return;
        // The helper now returns a normalized shape: { kycStatus, submittedAt, reviewedAt, rejectionReason }
        firstFetchedRef.current = true;
        dispatch(setKycStatus({
          kycStatus: (data?.kycStatus as any) ?? kyc.kycStatus,
          submittedAt: data?.submittedAt ?? kyc.submittedAt,
          reviewedAt: data?.reviewedAt ?? kyc.reviewedAt,
          rejectionReason: data?.rejectionReason ?? kyc.rejectionReason,
        }));
      } catch (e) {
        console.warn('Failed to fetch KYC status', e);
      }
    }

    if (auth.isAuthenticated) {
      updateStatus();
      // poll every 30s
      pollRef.current = setInterval(updateStatus, 30000);
    }

    return () => { mounted = false; if (pollRef.current) clearInterval(pollRef.current); };
  }, [auth.isAuthenticated]);

  // Deep link handling for password reset links (e.g., myapp://reset?token=... or https://app/.../reset?token=...)
  React.useEffect(() => {
    const extractToken = (url: string | null | undefined) => {
      if (!url) return null;
      try {
        // fallback-safe regex extraction to avoid URL/URLSearchParams typing issues
        const m = /[?&]token=([^&]+)/.exec(url);
        if (m && m[1]) return decodeURIComponent(m[1]);
      } catch (e) {
        // ignore
      }
      return null;
    };

    const handleUrl = (event: { url: string }) => {
      const token = extractToken(event.url);
      if (token && navigationRef.isReady()) {
        navigationRef.navigate('ResetPassword', { token });
      }
    };

    Linking.getInitialURL().then((url) => { const t = extractToken(url); if (t && navigationRef.isReady()) navigationRef.navigate('ResetPassword', { token: t }); }).catch(() => {});
    const sub = Linking.addEventListener('url', handleUrl);
    return () => { sub.remove(); };
  }, []);

  // Redirect based on kyc status changes
  useEffect(() => {
    const status = kyc.kycStatus;
    const current = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : null;

    // Show success once when it transitions to VERIFIED
    if (prevKycRef.current !== 'VERIFIED' && status === 'VERIFIED') {
      Alert.alert('KYC Verified', 'Your KYC is verified. All features are now unlocked.');
      if (navigationRef.isReady()) navigationRef.reset({ index: 0, routes: [{ name: 'Home' }] });
    }

    if (!auth.isAuthenticated) {
      // do nothing; auth stack is shown
    } else {
      // Only act on server-provided status after we've fetched at least once to avoid redirecting to KYC intro prematurely
      if (!firstFetchedRef.current) {
        return;
      }

      if (status === 'NOT_SUBMITTED') {
        if (current !== 'KycIntro' && current !== 'KycForm') navigationRef.navigate('KycIntro');
      } else if (status === 'PENDING') {
        // 'PENDING' covers 'submitted' or 'pending_kyc' server states
        if (current !== 'KycPending') navigationRef.navigate('KycPending');
      } else if (status === 'REJECTED') {
        if (current !== 'KycRejected') navigationRef.navigate('KycRejected');
      } else if (status === 'VERIFIED') {
        // handled above
      }
    }

    prevKycRef.current = status;
  }, [kyc.kycStatus, auth.isAuthenticated]);

  return null;
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Stack.Navigator initialRouteName="PublicHome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PublicHome" component={require('./src/screens/PublicHomeScreen').default} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="LoginOtp" component={LoginOtpScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="KycIntro" component={KycIntroScreen} />
            <Stack.Screen name="KycForm" component={KycFormScreen} />
            <Stack.Screen name="KycPending" component={KycPendingScreen} />
            <Stack.Screen name="KycRejected" component={KycRejectedScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="ProfileOverview" component={ProfileOverviewScreen} />
            <Stack.Screen name="ProductDetails" component={require('./src/screens/ProductDetailsScreen').default} />
          </Stack.Navigator>
        </SafeAreaView>
        <_KycEnforcer />
      </NavigationContainer>
    </Provider>
  );
}

export default App;