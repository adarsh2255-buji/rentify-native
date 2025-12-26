import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppSelector } from '../store/hooks';

export default function KycPendingScreen() {
  const kyc = useAppSelector((s) => s.kyc);

  return (
    <View style={styles.container}>
      <View style={styles.badge}><Text style={styles.badgeText}>Pending</Text></View>
      <Text style={styles.title}>Your KYC is under review</Text>
      <Text style={styles.sub}>Submitted: {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleString() : '—'}</Text>
      <Text style={styles.body}>
        Our team is reviewing your documents. Reviews typically take 1–3 business days. We'll notify you when the review is complete.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => { /* optionally open support or refresh */ }}>
        <Text style={styles.btnText}>Refresh status</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', alignItems: 'center' },
  badge: { marginTop: 24, backgroundColor: '#FDE68A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#92400E', fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '700', marginTop: 24 },
  sub: { marginTop: 8, color: '#666' },
  body: { marginTop: 16, textAlign: 'center', color: '#444' },
  btn: { marginTop: 24, backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
});