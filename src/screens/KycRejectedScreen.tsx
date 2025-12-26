import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'KycRejected'>;

export default function KycRejectedScreen() {
  const kyc = useAppSelector((s) => s.kyc);
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KYC Rejected</Text>
      <Text style={styles.reasonLabel}>Reason</Text>
      <Text style={styles.reason}>{kyc.rejectionReason ?? 'No reason provided'}</Text>

      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('KycForm')}>
        <Text style={styles.btnText}>Resubmit KYC</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  reasonLabel: { fontWeight: '600', marginTop: 8 },
  reason: { marginTop: 8, color: '#A11', backgroundColor: '#FFF1F2', padding: 12, borderRadius: 8 },
  btn: { marginTop: 20, backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
});