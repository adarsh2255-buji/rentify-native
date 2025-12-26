import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setKycStatus } from '../store/kycSlice';

const DRAFT_KEY = 'kycDraft_v1';

type Mode = 'manual' | 'upload';

const aadhaarRegex = /^[0-9]{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export default function KycFormScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  const [mode, setMode] = useState<Mode>('manual');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ aadhaar?: string; pan?: string; file?: string }>({});
  const saveTimer = useRef<number | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // Load draft
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setMode(parsed.mode ?? 'manual');
          setAadhaar(parsed.aadhaar ?? '');
          setPan(parsed.pan ?? '');
          setFileUri(parsed.fileUri ?? '');
          setDraftSavedAt(parsed.savedAt ?? null);
        }
      } catch (e) {
        console.warn('Failed to load KYC draft', e);
      }
    })();
  }, []);

  useEffect(() => {
    // validate as user types
    const newErrors: any = {};
    if (aadhaar && !aadhaarRegex.test(aadhaar)) newErrors.aadhaar = 'Aadhaar must be 12 digits';
    if (pan && !panRegex.test(pan)) newErrors.pan = 'PAN must match pattern (ABCDE1234F)';
    setErrors(newErrors);

    // debounce save
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveDraft, 800) as unknown as number;
  }, [aadhaar, pan, fileUri, mode]);

  const saveDraft = async () => {
    try {
      const payload = { mode, aadhaar, pan, fileUri, savedAt: new Date().toISOString() };
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setDraftSavedAt(new Date().toISOString());
    } catch (e) {
      console.warn('Failed to save draft', e);
    }
  };

  const handleManualSubmit = async () => {
    // client-side validation
    const newErrors: any = {};
    if (!aadhaarRegex.test(aadhaar)) newErrors.aadhaar = 'Aadhaar must be numeric 12 digits';
    if (!panRegex.test(pan)) newErrors.pan = 'PAN must follow pattern ABCDE1234F';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSubmitting(true);
    const API_URL = 'https://hrz5g6hz-8000.inc1.devtunnels.ms/api/v1/auth/kyc/submit/';

    if (!token) {
      // Try a quick status probe to see if server accepts session cookies
      try {
        const probe = await fetch('https://hrz5g6hz-8000.inc1.devtunnels.ms/api/v1/auth/status/', { method: 'GET' });
        if (probe.ok) {
          // server accepted session cookie - proceed without token
          console.log('Server accepted probe request without Authorization. Proceeding with submission using session.');
        } else {
          setSubmitting(false);
          Alert.alert('Authentication required', 'Please log in to submit KYC.', [
            { text: 'Login', onPress: () => navigation.navigate('Login') },
            { text: 'Cancel', style: 'cancel' },
          ]);
          return;
        }
      } catch (e) {
        setSubmitting(false);
        Alert.alert('Authentication required', 'Please log in to submit KYC.', [
          { text: 'Login', onPress: () => navigation.navigate('Login') },
          { text: 'Cancel', style: 'cancel' },
        ]);
        return;
      }
    }

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ aadhaar_identifier: aadhaar, pan_identifier: pan }),
      });

      let data: any = null;
      try { data = await response.json(); } catch (e) { data = null; }

      if (response.ok) {
        // Mark KYC pending and clear draft
        dispatch(setKycStatus({ kycStatus: 'PENDING', submittedAt: new Date().toISOString() }));
        await AsyncStorage.removeItem(DRAFT_KEY);
        Alert.alert('Success', 'KYC submitted and is under review');
        navigation.navigate('Home');
      } else {
        // show field-level errors when provided
        console.log('KYC submit error:', response.status, data);
        const fieldErrors: any = {};
        if (data) {
          if (Array.isArray(data.aadhaar_identifier)) fieldErrors.aadhaar = data.aadhaar_identifier.join('\n');
          if (Array.isArray(data.pan_identifier)) fieldErrors.pan = data.pan_identifier.join('\n');
        }
        setErrors((s) => ({ ...s, ...fieldErrors }));
        const message = Object.values(fieldErrors).length ? Object.values(fieldErrors).join('\n') : (data ? JSON.stringify(data) : `Submission failed (${response.status})`);
        Alert.alert('Submission failed', message);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Submission failed (network)');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadFile = async () => {
    if (!fileUri) {
      setErrors((s) => ({ ...s, file: 'Please provide a file URI' }));
      return;
    }

    setErrors((s) => ({ ...s, file: undefined }));
    setUploading(true);

    const API_URL = 'https://hrz5g6hz-8000.inc1.devtunnels.ms/api/v1/auth/kyc/submit/';

    if (!token) {
      setUploading(false);
      Alert.alert('Authentication required', 'Please log in to upload documents.');
      return;
    }

    try {
      const form = new FormData();
      // include fields if present
      if (aadhaar) form.append('aadhaar_identifier', aadhaar);
      if (pan) form.append('pan_identifier', pan);

      // attempt to append file blob
      const filename = fileUri.split('/').pop() || 'document.jpg';
      const match = filename.match(/\.([0-9a-zA-Z]+)$/);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

      // @ts-ignore: React Native FormData file object
      form.append('document', { uri: fileUri, name: filename, type: mime });

      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        // DO NOT set Content-Type; let fetch set multipart boundary
        headers,
        body: form as any,
      });

      let data: any = null;
      try { data = await response.json(); } catch (e) { data = null; }

      if (response.ok) {
        dispatch(setKycStatus({ kycStatus: 'PENDING', submittedAt: new Date().toISOString() }));
        await AsyncStorage.removeItem(DRAFT_KEY);
        Alert.alert('Success', 'KYC submitted and is under review');
        navigation.navigate('Home');
      } else {
        console.log('KYC upload error:', response.status, data);
        const fieldErrors: any = {};
        if (data) {
          if (Array.isArray(data.aadhaar_identifier)) fieldErrors.aadhaar = data.aadhaar_identifier.join('\n');
          if (Array.isArray(data.pan_identifier)) fieldErrors.pan = data.pan_identifier.join('\n');
          if (Array.isArray(data.document)) fieldErrors.file = data.document.join('\n');
        }
        setErrors((s) => ({ ...s, ...fieldErrors }));
        const message = Object.values(fieldErrors).length ? Object.values(fieldErrors).join('\n') : (data ? JSON.stringify(data) : `Upload failed (${response.status})`);
        Alert.alert('Upload failed', message);
      }
    } catch (e: any) {
      console.warn('Upload failed', e);
      Alert.alert('Upload failed', e.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSavePartial = async () => {
    await saveDraft();
    Alert.alert('Saved', 'Draft saved locally. You can resume later.');
  };

  const handleClearDraft = async () => {
    await AsyncStorage.removeItem(DRAFT_KEY);
    setAadhaar('');
    setPan('');
    setFileUri('');
    setDraftSavedAt(null);
    Alert.alert('Cleared', 'Draft cleared');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KYC Form</Text>

      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleButton, mode === 'manual' && styles.toggleActive]} onPress={() => setMode('manual')}>
          <Text style={[styles.toggleText, mode === 'manual' && styles.toggleTextActive]}>Manual Entry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleButton, mode === 'upload' && styles.toggleActive]} onPress={() => setMode('upload')}>
          <Text style={[styles.toggleText, mode === 'upload' && styles.toggleTextActive]}>Upload Documents</Text>
        </TouchableOpacity>
      </View>

      {mode === 'manual' ? (
        <>
          <Text style={styles.label}>Aadhaar number</Text>
          <TextInput style={[styles.input, errors.aadhaar && styles.inputError]} keyboardType="number-pad" value={aadhaar} onChangeText={(t) => setAadhaar(t.replace(/[^0-9]/g, ''))} maxLength={12} placeholder="123412341234" />
          {errors.aadhaar && <Text style={styles.errorText}>{errors.aadhaar}</Text>}

          <Text style={[styles.label, { marginTop: 12 }]}>PAN number</Text>
          <TextInput style={[styles.input, errors.pan && styles.inputError]} value={pan} onChangeText={(t) => setPan(t.toUpperCase())} maxLength={10} placeholder="ABCDE1234F" autoCapitalize="characters" />
          {errors.pan && <Text style={styles.errorText}>{errors.pan}</Text>}

          <TouchableOpacity style={[styles.button, submitting && { opacity: 0.7 }]} onPress={handleManualSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit KYC</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>Document (file URI)</Text>
          <TextInput style={[styles.input, errors.file && styles.inputError]} value={fileUri} onChangeText={setFileUri} placeholder="file:///... or https://..." />
          {fileUri ? <Text style={styles.preview}>Preview: {fileUri.split('/').pop()}</Text> : null}

          <TouchableOpacity style={[styles.button, uploading && { opacity: 0.7 }]} onPress={handleUploadFile} disabled={uploading}>
            {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Upload File</Text>}
          </TouchableOpacity>

          <Text style={{ marginTop: 12, color: '#666' }}>Tip: If your upload fails, you can retry without losing typed values.</Text>
        </>
      )}

      <View style={styles.rowSpace}>
        <TouchableOpacity style={styles.linkButton} onPress={handleSavePartial}><Text style={{ color: '#007AFF' }}>Save Draft</Text></TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={handleClearDraft}><Text style={{ color: '#FF3B30' }}>Clear Draft</Text></TouchableOpacity>
      </View>

      {draftSavedAt ? <Text style={{ marginTop: 8, color: '#666' }}>Last saved: {new Date(draftSavedAt).toLocaleString()}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  toggleRow: { flexDirection: 'row', marginBottom: 12 },
  toggleButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginRight: 8, alignItems: 'center' },
  toggleActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  toggleText: { color: '#333' },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  label: { marginBottom: 6, fontWeight: '600' },
  input: { height: 48, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12 },
  inputError: { borderColor: '#ff4444' },
  errorText: { color: '#ff4444', marginTop: 6 },
  preview: { marginTop: 8, color: '#333' },
  button: { height: 50, backgroundColor: '#007AFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontWeight: '600' },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  linkButton: { padding: 8 },
});