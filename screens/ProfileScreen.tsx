import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';

const API_URL = 'http://192.168.29.108:5000/api/v1';

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.data);
    } catch (error) {
      console.log('Profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  const infoItems = [
    { icon: '📧', label: 'Email', value: profile?.email || 'N/A' },
    { icon: '📱', label: 'Mobile', value: profile?.mobile || 'N/A' },
    { icon: '✅', label: 'Verified', value: profile?.isVerified ? 'Yes ✅' : 'No ❌' },
    { icon: '🎭', label: 'Role', value: profile?.role || 'USER' },
    { icon: '📅', label: 'Joined', value: profile?.createdAt ? new Date(profile.createdAt).toDateString() : 'N/A' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {profile?.fullName ? profile.fullName[0].toUpperCase() : '👤'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.fullName || 'User'}</Text>
        <Text style={styles.role}>{profile?.role || 'USER'}</Text>
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>Active</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        {infoItems.map((item, index) => (
          <View
            key={index}
            style={[styles.infoCard, index === infoItems.length - 1 && { borderBottomWidth: 0 }]}
          >
            <Text style={styles.infoIcon}>{item.icon}</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
        <Text style={styles.editButtonText}>✏️  Edit Profile</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FF', padding: 20, paddingBottom: 30 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' },
  loadingText: { marginTop: 10, color: '#888', fontSize: 14 },
  headerCard: {
    backgroundColor: '#007BFF', borderRadius: 24, padding: 28,
    alignItems: 'center', marginBottom: 20, elevation: 10,
    shadowColor: '#007BFF', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14,
  },
  avatarCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitial: { fontSize: 38, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  role: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 12 },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CD964', marginRight: 7 },
  activeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  infoContainer: {
    backgroundColor: '#fff', borderRadius: 20, padding: 8,
    marginBottom: 20, elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10,
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: '#F4F4FA',
  },
  infoIcon: { fontSize: 22, marginRight: 14 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9999B0', marginBottom: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  editButton: {
    backgroundColor: '#007BFF', padding: 17, borderRadius: 14,
    alignItems: 'center', elevation: 8,
    shadowColor: '#007BFF', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10,
  },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});