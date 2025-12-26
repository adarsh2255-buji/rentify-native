import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'KycIntro'>;

export default function KycIntroScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>KYC Verification</Text>

      <Text style={styles.sectionTitle}>Purpose</Text>
      <Text style={styles.sectionText}>
        KYC (Know Your Customer) is required to verify identity, comply with regulations, and unlock full app capabilities such as withdrawals and higher limits.
      </Text>

      <Text style={styles.sectionTitle}>Why KYC is required</Text>
      <Text style={styles.sectionText}>
        To make the platform secure and compliant. It helps prevent fraud and ensures a safer experience for all users.
      </Text>

      <Text style={styles.sectionTitle}>What features are locked</Text>
      <Text style={styles.sectionText}>Certain features (withdrawals, higher limits, identity-sensitive operations) are unavailable until your KYC is verified.</Text>

      <Text style={styles.sectionTitle}>What documents are needed</Text>
      <Text style={styles.sectionText}>Aadhaar (or national ID) and PAN (or tax ID) — you may either enter numbers manually or upload images of documents.</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('KycForm')}>
        <Text style={styles.buttonText}>Start Verification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  sectionText: { fontSize: 14, color: '#444' },
  button: { marginTop: 24, height: 52, backgroundColor: '#007AFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});