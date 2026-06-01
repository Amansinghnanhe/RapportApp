import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { getToken } from '../utils/storage';
const API_URL = 'http://192.168.29.108:5000/api/v1';
export default function ChangePasswordScreen({ navigation }: any) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { Alert.alert('Error', 'Please fill all fields'); return; }
    if (newPassword.length < 6) { Alert.alert('Error', 'New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Error', 'New passwords do not match'); return; }
    try {
      setLoading(true);
      const token = await getToken();
      await axios.post(`${API_URL}/user/change-password`, { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert('✅ Success', 'Password changed successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.banner}><Text style={styles.bannerIcon}>🔒</Text><Text style={styles.bannerText}>Choose a strong password to keep your account secure.</Text></View>
        {[
          { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggleShow: () => setShowCurrent(!showCurrent) },
          { label: 'New Password', value: newPassword, setter: setNewPassword, show: showNew, toggleShow: () => setShowNew(!showNew) },
          { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggleShow: () => setShowConfirm(!showConfirm) },
        ].map((field, i) => (
          <View key={i}>
            <Text style={styles.label}>{field.label}</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={field.value} onChangeText={field.setter} secureTextEntry={!field.show} placeholder="••••••••" placeholderTextColor="#B0B0C3" />
              <TouchableOpacity onPress={field.toggleShow} style={styles.eyeBtn}><Text>{field.show ? '🙈' : '👁️'}</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>🔐  Update Password</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  backBtn: { padding: 4, width: 40 }, backArrow: { fontSize: 22, color: '#6366F1' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  container: { padding: 20 },
  banner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF0EF', borderRadius: 12, padding: 14, marginBottom: 24, gap: 10 },
  bannerIcon: { fontSize: 20 }, bannerText: { flex: 1, fontSize: 13, color: '#CC3300', lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1A1A2E', marginBottom: 8, marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, marginBottom: 16 },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: '#1A1A2E' }, eyeBtn: { padding: 8 },
  btn: { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 12, elevation: 6, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnDisabled: { opacity: 0.6 }, btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 }, cancelText: { color: '#9999B0', fontSize: 14 },
});
