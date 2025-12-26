import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async () => {
    // Basic validation
    if (!email && !phone) {
      Alert.alert('Validation', 'Please provide email or phone.');
      return;
    }

    setIsLoading(true);
    const API_URL = 'https://hrz5g6hz-8000.inc1.devtunnels.ms/api/v1/auth/login/request-otp/';

    try {
      console.log('Login request url =>', API_URL, 'payload =>', { email, phone, password });
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, password }),
      });

      let data: any = null;
      let textBody: string | null = null;
      try {
        data = await response.json();
      } catch (e) {
        // Try reading text body for diagnostics (HTML error page or plain message)
        try {
          textBody = await response.text();
        } catch (e2) {
          textBody = null;
        }
        data = null; // empty or invalid JSON
      }

      if (response.ok) {
        Alert.alert('OTP Sent', 'OTP for login has been sent.');
        navigation.navigate('LoginOtp', { email, phone });
      } else {
        console.log('Login request error:', response.status, response.statusText, data, 'textBody:', textBody);
        const message = data
          ? (typeof data === 'string' ? data : JSON.stringify(data))
          : (textBody ? textBody : `Request failed (${response.status} ${response.statusText})`);
        Alert.alert('Error', message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Could not request login OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.7 }]} onPress={handleRequestOtp} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Request OTP</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={{ color: '#007AFF' }}>Forgot password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#333', textAlign: 'center' },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, marginBottom: 12 },
  button: { height: 50, backgroundColor: '#007AFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});