import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';

import { getToken, removeToken } from '../utils/storage';

export default function HomeScreen({ navigation }: any) {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Token sirf check karne ke liye storage se read ho raha hai
    // Screen pe show nahi karenge
    getToken().then(() => {
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await removeToken();

            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }]
            });
          }
        }
      ]
    );
  };

  const actions = [
    { icon: '👤', label: 'Profile', screen: 'Profile' },
    { icon: '⚙️', label: 'Settings', screen: 'Settings' },
    { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
    { icon: '❓', label: 'Help', screen: null },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>👤</Text>
        </View>

        <Text style={styles.welcomeText}>
          Welcome Back!
        </Text>

        <Text style={styles.welcomeSubText}>
          You are successfully logged in
        </Text>

        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>
            Active Session
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { icon: '🔐', val: 'Secure', lbl: 'Account' },
          { icon: '✅', val: 'Verified', lbl: 'Status' },
          { icon: '⭐', val: 'Active', lbl: 'Member' },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>
              {s.icon}
            </Text>

            <Text style={styles.statValue}>
              {s.val}
            </Text>

            <Text style={styles.statLabel}>
              {s.lbl}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.actionsGrid}>
        {actions.map((a, i) => (
          <TouchableOpacity
            key={i}
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() =>
              a.screen
                ? navigation.navigate(a.screen)
                : null
            }
          >
            <Text style={styles.actionIcon}>
              {a.icon}
            </Text>

            <Text style={styles.actionText}>
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutIcon}>🚪</Text>

        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    backgroundColor: '#F8F9FF',
    padding: 20,
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
  },

  headerCard: {
    backgroundColor: '#007BFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,

    shadowColor: '#007BFF',
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },

  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.25)',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 14,

    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  avatarText: {
    fontSize: 38,
  },

  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },

  welcomeSubText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 14,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: 'rgba(255,255,255,0.2)',

    paddingHorizontal: 14,
    paddingVertical: 5,

    borderRadius: 20,
  },

  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CD964',
    marginRight: 7,
  },

  activeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  statIcon: {
    fontSize: 22,
    marginBottom: 6,
  },

  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },

  statLabel: {
    fontSize: 11,
    color: '#9999B0',
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 12,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },

  actionCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  actionIcon: {
    fontSize: 30,
    marginBottom: 8,
  },

  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',

    padding: 17,
    borderRadius: 16,

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 8,

    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },

  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  logoutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

});