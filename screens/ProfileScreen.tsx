import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, ActivityIndicator, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { getToken } from '../utils/storage';

const API_URL = 'http://192.168.29.108:5000/api/v1';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

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

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>{profile?.fullName || 'User'}</Text>
        <Text style={styles.role}>{profile?.role || 'USER'}</Text>
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>Active</Text>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoContainer}>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📧</Text>
          <View>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📱</Text>
          <View>
            <Text style={styles.infoLabel}>Mobile</Text>
            <Text style={styles.infoValue}>{profile?.mobile || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>✅</Text>
          <View>
            <Text style={styles.infoLabel}>Verified</Text>
            <Text style={styles.infoValue}>
              {profile?.isVerified ? 'Yes ✅' : 'No ❌'}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📅</Text>
          <View>
            <Text style={styles.infoLabel}>Joined</Text>
            <Text style={styles.infoValue}>
              {profile?.createdAt
                ? new Date(profile.createdAt).toDateString()
                : 'N/A'}
            </Text>
          </View>
        </View>

      </View>

      {/* Edit Button */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F9FF',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
  },
  loadingText: {
    marginTop: 10,
    color: '#888',
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: '#007BFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  role: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CD964',
    marginRight: 6,
  },
  activeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});