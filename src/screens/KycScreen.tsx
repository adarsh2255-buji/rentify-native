import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Kyc'>;

export default function KycScreen() {
  const navigation = useNavigation<NavProp>();

  const handleSubmit = () => {
    // Placeholder: submit KYC details to backend
    Alert.alert('KYC', 'KYC details submitted (placeholder).');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KYC Details</Text>
      <Text style={styles.subtitle}>(Placeholder) Add your identity documents and details here.</Text>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit KYC</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' },
  button: { height: 50, backgroundColor: '#28A745', borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});