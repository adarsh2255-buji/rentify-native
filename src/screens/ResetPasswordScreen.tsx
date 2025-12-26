import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { confirmPasswordReset } from '../services/authApi';
import { useAppDispatch } from '../store/hooks';
import { clearAuth } from '../store/authSlice';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const params: any = (route as any).params ?? {};
  const emailFromParams = params?.email ?? '';

  const [email, setEmail] = useState(emailFromParams);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      setTimeout(() => {
        Alert.alert('Missing email', 'Please request a password reset again.');
        navigation.navigate('ForgotPassword');
      }, 500);
    }
  }, [email]);

  const validatePassword = (p: string) => {
    const minLength = p.length >= 8;
    const hasNumber = /[0-9]/.test(p);
    const hasAlpha = /[A-Za-z]/.test(p);
    return minLength && hasNumber && hasAlpha;
  };

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Missing email', 'Please request a password reset again.');
      navigation.navigate('ForgotPassword');
      return;
    }
    if (!otp) {
      Alert.alert('Validation', 'Please enter the OTP sent to your email');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match');
      return;
    }
    if (!validatePassword(newPassword)) {
      Alert.alert('Validation', 'Password must be at least 8 characters and contain letters and numbers');
      return;
    }

    setLoading(true);
    try {
      const res = await confirmPasswordReset(email, otp, newPassword);
      if (res.ok) {
        dispatch(clearAuth());
        Alert.alert('Password reset', 'Password changed successfully. For security, you have been logged out from other devices. Please log in with your new password.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        const msg = res.data ? (typeof res.data === 'string' ? res.data : JSON.stringify(res.data)) : 'Invalid or expired OTP';
        Alert.alert('Reset failed', msg, [{ text: 'Request new reset', onPress: () => navigation.navigate('ForgotPassword') }]);
      }
    } catch (e) {
      console.warn('Reset failed', e);
      Alert.alert('Reset failed', 'An error occurred. Please request a new reset.', [{ text: 'Request new reset', onPress: () => navigation.navigate('ForgotPassword') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set new password</Text>
      <Text style={styles.subtitle}>Enter your new password below.</Text>

      <TextInput style={styles.input} placeholder="OTP from email" keyboardType="number-pad" value={otp} onChangeText={setOtp} />
      <TextInput style={styles.input} placeholder="New password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <TextInput style={styles.input} placeholder="Confirm password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Set password</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 12 }} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={{ color: '#007AFF' }}>Request reset again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 18 },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, marginBottom: 12 },
  button: { height: 50, backgroundColor: '#007AFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});