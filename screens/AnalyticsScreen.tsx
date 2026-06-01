import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { getToken } from '../utils/storage';

const API_URL = 'http://192.168.29.108:5000/api/v1';

export default function AnalyticsScreen() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [mrPerformance, setMrPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [dashRes, salesRes, mrRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/dashboard-summary`, { headers }),
        axios.get(`${API_URL}/analytics/sales-trend`, { headers }),
        axios.get(`${API_URL}/analytics/mr-performance`, { headers }),
      ]);

      setDashboard(dashRes.data.data);
      setSalesTrend(salesRes.data.data || []);
      setMrPerformance(mrRes.data.data || []);
    } catch (error: any) {
      console.log('Analytics error:', error?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007BFF']} />
      }
    >
      <Text style={styles.pageTitle}>📊 Analytics</Text>

      {/* Dashboard Summary */}
      <Text style={styles.sectionTitle}>Dashboard Summary</Text>
      <View style={styles.statsGrid}>
        {[
          { icon: '💰', label: 'Total Revenue', value: `₹${dashboard?.totalRevenue?.toLocaleString() || 0}` },
          { icon: '📦', label: 'Total Orders', value: dashboard?.totalOrders || 0 },
          { icon: '👥', label: 'Total Users', value: dashboard?.totalUsers || 0 },
          { icon: '🚴', label: 'Total MRs', value: dashboard?.totalMRs || 0 },
          { icon: '📋', label: 'Active Plans', value: dashboard?.activePlans || 0 },
          { icon: '🏷️', label: 'Plan Types', value: dashboard?.activePlanTypes || 0 },
        ].map((item, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{item.icon}</Text>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Order Status Breakdown */}
      <Text style={styles.sectionTitle}>Order Status</Text>
      <View style={styles.card}>
        {dashboard?.statusBreakdown?.map((s: any, i: number) => (
          <View key={i} style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{s._id}</Text>
            <View style={styles.breakdownBarContainer}>
              <View style={[styles.breakdownBar, {
                width: `${Math.min((s.count / (dashboard?.totalOrders || 1)) * 100, 100)}%`,
                backgroundColor: '#007BFF'
              }]} />
            </View>
            <Text style={styles.breakdownCount}>{s.count}</Text>
          </View>
        ))}
      </View>

      {/* Sales Trend — Last 30 Days */}
      <Text style={styles.sectionTitle}>Sales Trend (Last 30 Days)</Text>
      <View style={styles.card}>
        {salesTrend.length === 0 ? (
          <Text style={styles.emptyText}>No sales data available</Text>
        ) : (
          salesTrend.slice(-7).map((day: any, i: number) => (
            <View key={i} style={styles.trendRow}>
              <Text style={styles.trendDate}>{day._id}</Text>
              <Text style={styles.trendOrders}>{day.orderCount} orders</Text>
              <Text style={styles.trendRevenue}>₹{day.dailyRevenue?.toLocaleString()}</Text>
            </View>
          ))
        )}
      </View>

      {/* MR Performance */}
      <Text style={styles.sectionTitle}>MR Performance</Text>
      <View style={styles.card}>
        {mrPerformance.length === 0 ? (
          <Text style={styles.emptyText}>No MR data available</Text>
        ) : (
          mrPerformance.map((mr: any, i: number) => (
            <View key={i} style={styles.mrRow}>
              <View style={styles.mrRank}>
                <Text style={styles.mrRankText}>#{i + 1}</Text>
              </View>
              <View style={styles.mrInfo}>
                <Text style={styles.mrName}>{mr.mrDetails?.fullName || 'N/A'}</Text>
                <Text style={styles.mrMobile}>{mr.mrDetails?.mobile || ''}</Text>
              </View>
              <View style={styles.mrStats}>
                <Text style={styles.mrDelivered}>{mr.ordersDelivered} delivered</Text>
                <Text style={styles.mrAmount}>₹{mr.totalBusinessAmount?.toLocaleString()}</Text>
              </View>
            </View>
          ))
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FF', padding: 20, paddingBottom: 30 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' },
  loadingText: { marginTop: 10, color: '#888', fontSize: 14 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 16,
    padding: 16, alignItems: 'center', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E' },
  statLabel: { fontSize: 11, color: '#9999B0', marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 20, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
  },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  breakdownLabel: { width: 100, fontSize: 12, color: '#555', fontWeight: '600' },
  breakdownBarContainer: { flex: 1, height: 8, backgroundColor: '#F0F0FA', borderRadius: 4, marginHorizontal: 8 },
  breakdownBar: { height: 8, borderRadius: 4 },
  breakdownCount: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', width: 30, textAlign: 'right' },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F4F4FA' },
  trendDate: { fontSize: 12, color: '#555', flex: 1 },
  trendOrders: { fontSize: 12, color: '#007BFF', fontWeight: '600', marginHorizontal: 8 },
  trendRevenue: { fontSize: 12, color: '#28A745', fontWeight: '700' },
  mrRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F4F4FA' },
  mrRank: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mrRankText: { fontSize: 13, fontWeight: '700', color: '#6366F1' },
  mrInfo: { flex: 1 },
  mrName: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  mrMobile: { fontSize: 11, color: '#9999B0', marginTop: 2 },
  mrStats: { alignItems: 'flex-end' },
  mrDelivered: { fontSize: 12, color: '#007BFF', fontWeight: '600' },
  mrAmount: { fontSize: 12, color: '#28A745', fontWeight: '700', marginTop: 2 },
  emptyText: { color: '#9999B0', textAlign: 'center', padding: 20 },
});