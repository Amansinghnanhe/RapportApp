import React, { useEffect, useState } from 'react';
import {
  View, Text, ActivityIndicator, StyleSheet,
  ScrollView, RefreshControl, TouchableOpacity
} from 'react-native';
import { getEarningDashboard } from '../services/earning.service';
import { removeToken } from '../utils/storage';

export default function MRDashboard({ navigation }: any) {
  const [data, setData]             = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState('');

  const fetchData = async () => {
    try {
      const result = await getEarningDashboard();
      setData(result);
      setError('');
    } catch (e) {
      setError('Data load nahi hua. Internet check karo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await removeToken();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} size="large" color="#4F46E5" />;
  if (error)   return <Text style={styles.error}>{error}</Text>;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>MR Dashboard</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Total Earning Card */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Earning</Text>
        <Text style={styles.totalAmount}>Rs. {data?.totalEarning ?? 0}</Text>
        <View style={[styles.statusBadge,
          { backgroundColor: data?.status === 'PAID' ? '#22c55e' : '#f97316' }]}>
          <Text style={styles.statusText}>{data?.status ?? 'PENDING'}</Text>
        </View>
      </View>

      {/* Earning Breakdown */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Base Earning</Text>
          <Text style={styles.cardValue}>Rs. {data?.baseEarning ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Distance</Text>
          <Text style={styles.cardValue}>Rs. {data?.distanceEarning ?? 0}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Incentive</Text>
          <Text style={styles.cardValue}>Rs. {data?.incentive ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Extra KM</Text>
          <Text style={styles.cardValue}>{data?.extraDistanceKm ?? 0} km</Text>
        </View>
      </View>

      {/* Extra Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Fixed Distance</Text>
        <Text style={styles.infoValue}>{data?.fixedDistanceKm ?? 5} km</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Per KM Rate</Text>
        <Text style={styles.infoValue}>Rs. {data?.perKmRate ?? 20} / km</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heading:     { fontSize: 22, fontWeight: 'bold', color: '#222' },
  logoutBtn:   { backgroundColor: '#fee2e2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  logoutText:  { color: '#dc2626', fontWeight: '600', fontSize: 13 },
  totalCard:   { backgroundColor: '#4F46E5', borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center' },
  totalLabel:  { fontSize: 14, color: '#c7d2fe', marginBottom: 4 },
  totalAmount: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusText:  { fontSize: 13, fontWeight: '600', color: '#fff' },
  row:         { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card:        { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  cardLabel:   { fontSize: 12, color: '#888', marginBottom: 4 },
  cardValue:   { fontSize: 20, fontWeight: '700', color: '#333' },
  infoCard:    { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel:   { fontSize: 14, color: '#666' },
  infoValue:   { fontSize: 16, fontWeight: '600', color: '#333' },
  error:       { flex: 1, textAlign: 'center', marginTop: 40, color: 'red', fontSize: 16 },
});