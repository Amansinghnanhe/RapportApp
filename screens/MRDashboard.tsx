import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import { getEarningDashboard } from '../services/earning.service';
import { removeToken } from '../utils/storage';

export default function MRDashboard({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const result = await getEarningDashboard();

      setData(result);
      setError('');
    } catch (err) {
      console.log(err);

      setError(
        'Dashboard data load nahi hua. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await removeToken();

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        size="large"
        color="#4F46E5"
      />
    );
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchData();
          }}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>
          MR Earnings Dashboard
        </Text>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Total Earned */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>
          Total Earned
        </Text>

        <Text style={styles.totalAmount}>
          ₹ {data?.totalEarned ?? 0}
        </Text>
      </View>

      {/* Row 1 */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Pending Payout
          </Text>

          <Text style={styles.cardValue}>
            ₹ {data?.pendingPayout ?? 0}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Paid Amount
          </Text>

          <Text style={styles.cardValue}>
            ₹ {data?.paidAmount ?? 0}
          </Text>
        </View>
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Deliveries
          </Text>

          <Text style={styles.cardValue}>
            {data?.totalDeliveries ?? 0}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Distance Travelled
          </Text>

          <Text style={styles.cardValue}>
            {data?.totalDistanceTravelled ?? 0} km
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>
          Earnings Summary
        </Text>

        <Text style={styles.infoValue}>
          {data?.totalDeliveries ?? 0} Deliveries Completed
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },

  logoutBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  logoutText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },

  totalCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 14,
    color: '#c7d2fe',
    marginBottom: 6,
  },

  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },

  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },

  cardLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },

  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 14,
    color: '#666',
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },

  error: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    color: 'red',
    fontSize: 16,
  },
});