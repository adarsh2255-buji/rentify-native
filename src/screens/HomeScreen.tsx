import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearAuth } from '../store/authSlice';
import { resetKyc } from '../store/kycSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const auth = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            // Best-effort: call server logout with refresh token if available
            const refresh = auth.refreshToken;
            const access = auth.token;
            if (refresh && access) {
              try {
                await fetch('https://hrz5g6hz-8000.inc1.devtunnels.ms/api/v1/auth/logout/', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access}`
                  },
                  body: JSON.stringify({ refresh }),
                });
              } catch (e) {
                // ignore server errors on logout
              }
            }

            dispatch(clearAuth());
            dispatch(resetKyc());
            await AsyncStorage.removeItem('kycDraft_v1');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (e) {
            console.warn('Logout failed', e);
            Alert.alert('Logout failed', 'Could not complete logout.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>You're logged in.</Text>
      <Text style={{ marginBottom: 8 }}>Email: {auth.email ?? '—'}</Text>
      <Text style={{ marginBottom: 16 }}>Phone: {auth.mobileNumber ?? '—'}</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('KycIntro')}>
        <Text style={styles.buttonText}>Add KYC details</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProfileOverview')}>
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  button: { height: 50, backgroundColor: '#007AFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { marginTop: 12, height: 50, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#FF3B30', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
});