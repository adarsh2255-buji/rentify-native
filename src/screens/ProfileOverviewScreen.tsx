import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAppSelector } from '../store/hooks';

// Add navigation type for ProfileOverview
type NavProp = NativeStackNavigationProp<RootStackParamList, 'ProfileOverview'>;

export default function ProfileOverviewScreen() {
  const navigation = useNavigation<NavProp>();
  const profile = useAppSelector((s) => s.profile);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Overview</Text>
      <View style={styles.photoRow}>
        {profile.profilePhotoUrl ? (
          <Image source={{ uri: profile.profilePhotoUrl }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}><Text style={{ color: '#888' }}>No Photo</Text></View>
        )}
        <TouchableOpacity style={styles.photoEditBtn} onPress={() => navigation.navigate('PhotoUpdate')}>
          <Text style={styles.photoEditText}>Edit Photo</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{profile.name || '—'}</Text>
      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{profile.email || '—'}</Text>
      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('ChangeEmail')}>
        <Text style={styles.editText}>Change</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Mobile Number</Text>
      <Text style={styles.value}>{profile.mobileNumber || '—'}</Text>
      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('ChangeMobile')}>
        <Text style={styles.editText}>Change</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Alternate Contact</Text>
      <Text style={styles.value}>{profile.alternateContact || '—'}</Text>
      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Communication Preferences</Text>
      <Text style={styles.value}>{profile.communicationPreferences?.join(', ') || '—'}</Text>
      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('CommunicationPreferences')}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
      <Text style={styles.label}>KYC Status</Text>
      <Text style={styles.value}>{profile.kycStatus || '—'}</Text>
      <Text style={styles.label}>KYC Verified At</Text>
      <Text style={styles.value}>{profile.kycVerifiedAt || '—'}</Text>
      <Text style={styles.readOnlyNote}>Aadhaar, PAN, KYC status are always read-only.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  photoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  photo: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  photoPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  photoEditBtn: { padding: 8, backgroundColor: '#007AFF', borderRadius: 8 },
  photoEditText: { color: '#fff', fontWeight: '600' },
  label: { fontWeight: '600', marginTop: 12 },
  value: { fontSize: 16, marginBottom: 4 },
  editBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  editText: { color: '#007AFF', fontWeight: '600' },
  readOnlyNote: { marginTop: 18, color: '#888', fontSize: 13 },
});
