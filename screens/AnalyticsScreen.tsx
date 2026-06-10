import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { getDashboardSummary, getSalesTrend, getMRPerformance } from '../utils/orderApi';

export default function AnalyticsScreen({ navigation }: any) {
  const [summary,     setSummary]     = useState<any>(null);
  const [salesTrend,  setSalesTrend]  = useState<any[]>([]);
  const [mrPerf,      setMrPerf]      = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [activeTab,   setActiveTab]   = useState<'overview' | 'sales' | 'mr'>('overview');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s, t, m] = await Promise.all([
        getDashboardSummary(),
        getSalesTrend(),
        getMRPerformance(),
      ]);
      setSummary(s.data || null);
      setSalesTrend(t.data || []);
      setMrPerf(m.data || []);
    } catch (e) {
      console.log('Analytics error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  if (loading) return (
    <View style={s.loadingBox}>
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text style={s.loadingText}>Loading analytics...</Text>
    </View>
  );

  // Max revenue for bar chart scaling
  const maxRevenue = Math.max(...salesTrend.map((d: any) => d.dailyRevenue || 0), 1);

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>

      {/* ── HEADER ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Analytics</Text>
          <Text style={s.headerSub}>Performance overview</Text>
        </View>
      </View>

      {/* ── TABS ── */}
      <View style={s.tabRow}>
        {(['overview', 'sales', 'mr'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'overview' ? '📊 Overview' : tab === 'sales' ? '📈 Sales' : '👤 MR'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && summary && (
          <>
            <Text style={s.sectionTitle}>📊 Overall Stats</Text>

            {/* Stats Grid */}
            <View style={s.statsGrid}>
              <View style={[s.statCard, { backgroundColor: '#EBF8FF' }]}>
                <Text style={s.statIcon}>💰</Text>
                <Text style={[s.statVal, { color: '#2563EB' }]}>
                  ₹{(summary.totalRevenue || 0).toLocaleString('en-IN')}
                </Text>
                <Text style={s.statLbl}>Total Revenue</Text>
              </View>

              <View style={[s.statCard, { backgroundColor: '#F0FFF4' }]}>
                <Text style={s.statIcon}>📦</Text>
                <Text style={[s.statVal, { color: '#16A34A' }]}>
                  {summary.totalOrders || 0}
                </Text>
                <Text style={s.statLbl}>Total Orders</Text>
              </View>

              <View style={[s.statCard, { backgroundColor: '#FFFBEB' }]}>
                <Text style={s.statIcon}>👥</Text>
                <Text style={[s.statVal, { color: '#CA8A04' }]}>
                  {summary.totalUsers || 0}
                </Text>
                <Text style={s.statLbl}>Total Users</Text>
              </View>

              <View style={[s.statCard, { backgroundColor: '#FFF5F5' }]}>
                <Text style={s.statIcon}>🧑‍💼</Text>
                <Text style={[s.statVal, { color: '#DC2626' }]}>
                  {summary.totalMRs || 0}
                </Text>
                <Text style={s.statLbl}>Total MRs</Text>
              </View>
            </View>

            {/* Order Status Breakdown */}
            <Text style={s.sectionTitle}>📋 Order Status</Text>
            <View style={s.card}>
              {(summary.statusBreakdown || []).map((item: any, i: number) => (
                <View key={i} style={s.breakdownRow}>
                  <Text style={s.breakdownLabel}>{item._id}</Text>
                  <View style={s.breakdownBarBg}>
                    <View style={[
                      s.breakdownBar,
                      {
                        width: `${Math.min((item.count / summary.totalOrders) * 100, 100)}%`,
                        backgroundColor: '#4F46E5'
                      }
                    ]} />
                  </View>
                  <Text style={s.breakdownCount}>{item.count}</Text>
                </View>
              ))}
            </View>

            {/* Order Type Breakdown */}
            <Text style={s.sectionTitle}>📱 Order Types</Text>
            <View style={s.card}>
              {(summary.typeBreakdown || []).map((item: any, i: number) => (
                <View key={i} style={s.breakdownRow}>
                  <Text style={s.breakdownLabel}>{item._id}</Text>
                  <View style={s.breakdownBarBg}>
                    <View style={[
                      s.breakdownBar,
                      {
                        width: `${Math.min((item.count / summary.totalOrders) * 100, 100)}%`,
                        backgroundColor: '#16A34A'
                      }
                    ]} />
                  </View>
                  <Text style={s.breakdownCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── SALES TREND TAB ── */}
        {activeTab === 'sales' && (
          <>
            <Text style={s.sectionTitle}>📈 Last 30 Days Sales</Text>
            <View style={s.card}>
              {salesTrend.length === 0 ? (
                <Text style={s.emptyText}>Koi sales data nahi hai abhi</Text>
              ) : (
                <>
                  {/* Bar Chart */}
                  <View style={s.chartContainer}>
                    <View style={s.barsRow}>
                      {salesTrend.slice(-14).map((day: any, i: number) => (
                        <View key={i} style={s.barWrapper}>
                          <View style={[
                            s.bar,
                            {
                              height: Math.max(
                                (day.dailyRevenue / maxRevenue) * 120, 4
                              ),
                            }
                          ]} />
                          <Text style={s.barLabel}>
                            {day._id?.slice(8)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Daily List */}
                  {salesTrend.slice(-7).reverse().map((day: any, i: number) => (
                    <View key={i} style={s.salesRow}>
                      <Text style={s.salesDate}>{day._id}</Text>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={s.salesRevenue}>
                          ₹{(day.dailyRevenue || 0).toLocaleString('en-IN')}
                        </Text>
                        <Text style={s.salesOrders}>
                          {day.orderCount} orders
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          </>
        )}

        {/* ── MR PERFORMANCE TAB ── */}
        {activeTab === 'mr' && (
          <>
            <Text style={s.sectionTitle}>🏆 MR Leaderboard</Text>
            {mrPerf.length === 0 ? (
              <View style={s.card}>
                <Text style={s.emptyText}>Koi MR performance data nahi hai</Text>
              </View>
            ) : (
              mrPerf.map((mr: any, i: number) => (
                <View key={i} style={s.mrCard}>
                  <View style={s.mrRank}>
                    <Text style={s.mrRankText}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.mrName}>
                      {mr.mrDetails?.fullName || 'Unknown MR'}
                    </Text>
                    <Text style={s.mrMobile}>
                      📱 {mr.mrDetails?.mobile || 'N/A'}
                    </Text>
                    <View style={s.mrStatsRow}>
                      <View style={s.mrStatBadge}>
                        <Text style={s.mrStatText}>
                          📦 {mr.ordersDelivered} delivered
                        </Text>
                      </View>
                      <View style={[s.mrStatBadge, { backgroundColor: '#F0FFF4' }]}>
                        <Text style={[s.mrStatText, { color: '#16A34A' }]}>
                          ₹{(mr.totalBusinessAmount || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={[
                    s.onlineDot,
                    { backgroundColor: mr.mrDetails?.isOnline ? '#16A34A' : '#DC2626' }
                  ]} />
                </View>
              ))
            )}
          </>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flexGrow: 1, padding: 16, paddingBottom: 30 },
  loadingBox:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF', gap: 12 },
  loadingText:    { fontSize: 14, color: '#666' },
  header:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, paddingTop: 50, elevation: 4, gap: 12 },
  backBtn:        { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  backText:       { fontSize: 20, color: '#1A1A2E', fontWeight: '700' },
  headerTitle:    { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  headerSub:      { fontSize: 12, color: '#9999B0', marginTop: 2 },
  tabRow:         { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tab:            { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F0F4FF', alignItems: 'center' },
  tabActive:      { backgroundColor: '#4F46E5' },
  tabText:        { fontSize: 12, fontWeight: '600', color: '#666' },
  tabTextActive:  { color: '#fff' },
  sectionTitle:   { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 10, marginTop: 4 },
  card:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  statsGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard:       { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2 },
  statIcon:       { fontSize: 26, marginBottom: 6 },
  statVal:        { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLbl:        { fontSize: 11, color: '#666', fontWeight: '600', textAlign: 'center' },
  breakdownRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  breakdownLabel: { fontSize: 11, color: '#555', width: 110, fontWeight: '600' },
  breakdownBarBg: { flex: 1, height: 8, backgroundColor: '#F0F4FF', borderRadius: 4, marginHorizontal: 8 },
  breakdownBar:   { height: 8, borderRadius: 4 },
  breakdownCount: { fontSize: 12, color: '#333', fontWeight: '700', width: 30, textAlign: 'right' },
  chartContainer: { marginBottom: 16 },
  barsRow:        { flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 4 },
  barWrapper:     { flex: 1, alignItems: 'center' },
  bar:            { width: '100%', backgroundColor: '#4F46E5', borderRadius: 3 },
  barLabel:       { fontSize: 9, color: '#999', marginTop: 4 },
  salesRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F4FF' },
  salesDate:      { fontSize: 13, color: '#555', fontWeight: '600' },
  salesRevenue:   { fontSize: 14, fontWeight: '700', color: '#4F46E5' },
  salesOrders:    { fontSize: 11, color: '#999' },
  mrCard:         { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2, gap: 12 },
  mrRank:         { width: 36, alignItems: 'center' },
  mrRankText:     { fontSize: 22 },
  mrName:         { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  mrMobile:       { fontSize: 12, color: '#999', marginBottom: 6 },
  mrStatsRow:     { flexDirection: 'row', gap: 8 },
  mrStatBadge:    { backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  mrStatText:     { fontSize: 11, color: '#4F46E5', fontWeight: '600' },
  onlineDot:      { width: 10, height: 10, borderRadius: 5 },
  emptyText:      { textAlign: 'center', color: '#999', fontSize: 14, paddingVertical: 20 },
});