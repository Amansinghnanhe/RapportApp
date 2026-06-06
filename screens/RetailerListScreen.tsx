import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import axios from 'axios';
import { getToken } from '../utils/storage';
import { API_URL } from '../utils/config';

type Retailer = {
  _id: string;
  shopName: string;
  ownerName: string;
  mobile: string;
  area: string;
  city: string;
  isActive: boolean;
};

const DUMMY: Retailer[] = [
  { _id: '1', shopName: 'Sharma Telecom', ownerName: 'Raj Sharma', mobile: '9876543210', area: 'Karol Bagh', city: 'Delhi', isActive: true },
  { _id: '2', shopName: 'Galaxy Mobile', ownerName: 'Suresh Kumar', mobile: '9123456780', area: 'Lajpat Nagar', city: 'Delhi', isActive: true },
  { _id: '3', shopName: 'Raj Mobile Store', ownerName: 'Amit Raj', mobile: '9988776655', area: 'Rohini', city: 'Delhi', isActive: false },
  { _id: '4', shopName: 'New India Telecom', ownerName: 'Priya Singh', mobile: '9871234560', area: 'Dwarka', city: 'Delhi', isActive: true },
  { _id: '5', shopName: 'Star Mobile', ownerName: 'Vikram Yadav', mobile: '9654321870', area: 'Saket', city: 'Delhi', isActive: true },
];

export default function RetailerListScreen({ navigation }: any) {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [filtered, setFiltered] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchRetailers(); }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(retailers);
    } else {
      const q = search.toLowerCase();
      setFiltered(retailers.filter(r =>
        r.shopName?.toLowerCase().includes(q) ||
        r.ownerName?.toLowerCase().includes(q) ||
        r.area?.toLowerCase().includes(q)
      ));
    }
  }, [search, retailers]);

  const fetchRetailers = async () => {
    try {
      const token = await getToken();
      // ✅ SAHI URL
      const res = await axios.get(`${API_URL}/mr/retailers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [];
      setRetailers(list.length > 0 ? list : DUMMY);
      setFiltered(list.length > 0 ? list : DUMMY);
    } catch (error: any) {
      console.log('Retailers error:', error?.response?.status, error?.message);
      // Backend ready nahi hai toh dummy data
      setRetailers(DUMMY);
      setFiltered(DUMMY);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: Retailer }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.82}
      onPress={() => Alert.alert(
        item.shopName,
        `Owner: ${item.ownerName}\nMobile: ${item.mobile}\nArea: ${item.area}, ${item.city}`
      )}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, { backgroundColor: item.isActive ? '#EBF8FF' : '#F5F5F5' }]}>
          <Text style={styles.avatarText}>🏪</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.shopName} numberOfLines={1}>{item.shopName}</Text>
            <View style={[styles.badge, { backgroundColor: item.isActive ? '#EAFAF1' : '#FFF0EF' }]}>
              <Text style={[styles.badgeText, { color: item.isActive ? '#27AE60' : '#E74C3C' }]}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text style={styles.ownerName}>👤 {item.ownerName}</Text>
          <Text style={styles.area}>📍 {item.area}, {item.city}</Text>
          <Text style={styles.mobile}>📞 {item.mobile}</Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.visitBtn}
          onPress={() => navigation.navigate('VisitReport', {
            retailerId: item._id,
            shopName: item.shopName
          })}
        >
          <Text style={styles.visitBtnText}>📝 Visit Log</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.simBtn}
          onPress={() => navigation.navigate('SIMActivation', {
            retailerId: item._id,
            shopName: item.shopName
          })}
        >
          <Text style={styles.simBtnText}>📱 Activate SIM</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="large" color="#1A56DB" />
      <Text style={styles.loadingText}>Retailers load ho rahe hain...</Text>
    </View>
  );

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Retailers</Text>
          <Text style={styles.headerSub}>{filtered.length} retailers found</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {retailers.filter(r => r.isActive).length} Active
          </Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Shop name, owner ya area search karo..."
          placeholderTextColor="#B0B0C3"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ fontSize: 18, color: '#9999B0' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{retailers.length}</Text>
          <Text style={styles.statLbl}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: '#27AE60' }]}>
            {retailers.filter(r => r.isActive).length}
          </Text>
          <Text style={styles.statLbl}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: '#E74C3C' }]}>
            {retailers.filter(r => !r.isActive).length}
          </Text>
          <Text style={styles.statLbl}>Inactive</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchRetailers(); }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48 }}>🏪</Text>
            <Text style={styles.emptyTitle}>Koi retailer nahi mila</Text>
            <Text style={styles.emptySub}>Pull to refresh karo</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F4FF' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF', gap: 12 },
  loadingText: { fontSize: 14, color: '#9999B0' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 20, color: '#1A1A2E', fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  headerSub: { fontSize: 12, color: '#9999B0', marginTop: 2 },
  countBadge: { backgroundColor: '#1A56DB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  countText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A2E' },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#1A56DB' },
  statLbl: { fontSize: 11, color: '#9999B0', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#F0F0F5' },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardLeft: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  shopName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', flex: 1, marginRight: 8 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  ownerName: { fontSize: 12, color: '#7A7A9D', marginBottom: 2 },
  area: { fontSize: 12, color: '#7A7A9D', marginBottom: 2 },
  mobile: { fontSize: 12, color: '#7A7A9D' },
  actionRow: { flexDirection: 'row', gap: 10 },
  visitBtn: { flex: 1, backgroundColor: '#EEF2FF', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  visitBtnText: { color: '#4338CA', fontSize: 13, fontWeight: '700' },
  simBtn: { flex: 1, backgroundColor: '#EAFAF1', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  simBtnText: { color: '#15803D', fontSize: 13, fontWeight: '700' },
  emptyBox: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  emptySub: { fontSize: 13, color: '#9999B0', textAlign: 'center' },
});