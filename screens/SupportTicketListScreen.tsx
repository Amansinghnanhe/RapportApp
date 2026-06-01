import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView, RefreshControl
} from 'react-native';
import { getMyTickets } from '../utils/supportTicket.api';

export default function SupportTicketListScreen({ navigation }: any) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const res = await getMyTickets();
      setTickets(res.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchTickets(); };

  const statusConfig: any = {
    OPEN:        { color: '#F59E0B', bg: '#FEF3C7', label: 'Open',        icon: '🟡' },
    IN_PROGRESS: { color: '#3B82F6', bg: '#DBEAFE', label: 'In Progress',  icon: '🔵' },
    CLOSED:      { color: '#10B981', bg: '#D1FAE5', label: 'Closed',       icon: '🟢' },
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#6366F1" />
      <Text style={styles.loadingText}>Loading tickets...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Support Tickets</Text>
          <Text style={styles.headerSub}>{tickets.length} total tickets</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🎫</Text>
            <Text style={styles.emptyTitle}>No tickets yet</Text>
            <Text style={styles.emptySub}>Tap "+ New" to raise your first support ticket</Text>
          </View>
        }
        renderItem={({ item }: any) => {
          const s = statusConfig[item.status] || statusConfig.OPEN;
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('TicketDetail', { id: item._id })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
                </View>
              </View>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardDate}>
                  🕐 {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.cardArrow}>→</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' },
  loadingText: { marginTop: 12, color: '#6366F1', fontSize: 14 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F5',
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: '#6366F1' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  headerSub: { fontSize: 12, color: '#9999B0', marginTop: 2 },
  newBtn: {
    backgroundColor: '#6366F1', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20,
  },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  list: { padding: 16, gap: 12 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#EDEDF5',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardDesc: { fontSize: 13, color: '#6B6B8A', lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 12, color: '#9999B0' },
  cardArrow: { fontSize: 16, color: '#6366F1' },

  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#9999B0', textAlign: 'center', paddingHorizontal: 32 },
});