import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppDispatch } from '../store/hooks';
import { setAuth } from '../store/authSlice';
import { resendOtp } from '../services/authApi';

type Props = { route: { params?: { email?: string; phone?: string } } };

type NavProp = NativeStackNavigationProp<RootStackParamList, 'LoginOtp'>;

export default function LoginOtpScreen({ route }: Props) {
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const email = route?.params?.email ?? '';
  const phone = route?.params?.phone ?? '';
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleResend = async () => {
    setOtpError(null);
    setIsLoading(true);
    try {
      const res = await resendOtp({ email, purpose: 'login' });
      if (res.ok) {
        Alert.alert('OTP Sent', 'A new OTP has been sent.');
      } else {
        const msg = res.data ? (typeof res.data === 'string' ? res.data : JSON.stringify(res.data)) : 'Could not resend OTP.';
        Alert.alert('Could not resend', msg);
      }
    } catch (e) {
      Alert.alert('Network Error', 'Could not resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyLogin = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    const API_URL = 'https://hrz5g6hz-8000.inc1.devtunnels.ms/api/v1/auth/login/verify-otp/';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, otp_code: otp }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }

      if (response.ok) {
        // Attempt to set auth info if returned
        console.log('Login verify success response data:', data);
        const userId = (data && (data.userId || data.id || data.user?.id)) ?? null;
        // backend may return tokens in fields 'access' and 'refresh'
        const access = (data && (data.access || data.accessToken || data.token || data.authToken)) ?? null;
        const refresh = (data && (data.refresh || data.refreshToken)) ?? null;
        dispatch(setAuth({ isAuthenticated: true, userId, email: email || null, mobileNumber: phone || null, token: access, refreshToken: refresh }));

        if (!access) console.warn('Login verify did not return an access token. Backend may be using session cookies.');
        else console.log('Stored access token (first 8 chars):', access.slice(0, 8));

        Alert.alert('Success', 'Login verified!');
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        console.log('Login verify error:', response.status, response.statusText, data);
        // Display field errors if provided
        if (data && data.otp_code && Array.isArray(data.otp_code)) {
          setOtpError(data.otp_code.join('\n'));
        } else {
          const message = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : `Verification failed (${response.status} ${response.statusText})`;
          Alert.alert('Verification failed', message);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Could not verify login OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Login OTP</Text>
      <Text style={styles.subtitle}>We sent a code to {email || phone}</Text>

      <TextInput style={[styles.input, otpError && { borderColor: '#ff4444' }]} placeholder="123456" keyboardType="number-pad" maxLength={6} value={otp} onChangeText={(t) => { setOtp(t); setOtpError(null); }} />
      {otpError ? <Text style={{ color: '#ff4444', marginTop: 6 }}>{otpError}</Text> : null}

      <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.7 }]} onPress={handleVerifyLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={handleResend}>
        <Text style={{ color: '#007AFF' }}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 16, fontSize: 18, textAlign: 'center', marginBottom: 12 },
  button: { height: 50, backgroundColor: '#007AFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});