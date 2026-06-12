// screens/PlanListScreen.tsx
// ✅ NEW: This is the missing screen between Home → Checkout.
//         It fetches real plans and lets the user pick one before going to Checkout.

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import api from '../utils/api';

type Plan = {
  _id: string;
  name: string;
  price: number;
  validity?: string;
  data?: string;
  description?: string;
};

export default function PlanListScreen({ navigation }: any) {
  const [plans,   setPlans]   = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      setPlans(res.data?.data || []);
    } catch (e) {
      Alert.alert('Error', 'Plans load nahi hue. Internet check karo.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    const plan = plans.find(p => p._id === selected);
    if (!plan) {
      Alert.alert('Select Plan', 'Pehle ek plan select karo');
      return;
    }
    navigation.navigate('Checkout', {
      cartItems: [{ planId: plan._id, name: plan.name, quantity: 1 }],
    });
  };

  const renderItem = ({ item }: { item: Plan }) => (
    <TouchableOpacity
      style={[styles.card, selected === item._id && styles.cardSelected]}
      onPress={() => setSelected(item._id)}
      activeOpacity={0.82}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.planName}>{item.name}</Text>
        {item.validity ? <Text style={styles.planMeta}>📅 {item.validity}</Text> : null}
        {item.data     ? <Text style={styles.planMeta}>📶 {item.data}</Text>     : null}
        {item.description ? <Text style={styles.planDesc}>{item.description}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 8 }}>
        <Text style={styles.price}>₹{item.price}</Text>
        <View style={[styles.radio, selected === item._id && styles.radioActive]}>
          {selected === item._id && <View style={styles.radioDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text style={styles.loadingText}>Plans load ho rahe hain...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a Plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={plans}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text style={styles.emptyTitle}>Koi plan available nahi hai</Text>
          </View>
        }
      />

      {/* Proceed Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.proceedBtn, !selected && styles.proceedBtnDisabled]}
          onPress={handleProceed}
          disabled={!selected}
        >
          <Text style={styles.proceedBtnText}>Proceed to Checkout →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#F8F9FF' },
  loadingBox:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#F8F9FF' },
  loadingText:        { fontSize: 14, color: '#9999B0' },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  backBtn:            { padding: 4, width: 40 },
  backArrow:          { fontSize: 22, color: '#6366F1' },
  headerTitle:        { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  list:               { padding: 16, paddingBottom: 100 },
  card:               { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  cardSelected:       { borderColor: '#6366F1', backgroundColor: '#F5F3FF' },
  planName:           { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  planMeta:           { fontSize: 12, color: '#7A7A9D', marginBottom: 2 },
  planDesc:           { fontSize: 12, color: '#9999B0', marginTop: 4 },
  price:              { fontSize: 18, fontWeight: '800', color: '#6366F1' },
  radio:              { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D0D0E0', justifyContent: 'center', alignItems: 'center' },
  radioActive:        { borderColor: '#6366F1' },
  radioDot:           { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1' },
  emptyBox:           { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyTitle:         { fontSize: 16, fontWeight: '600', color: '#9999B0' },
  footer:             { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F5' },
  proceedBtn:         { backgroundColor: '#4F46E5', padding: 16, borderRadius: 14, alignItems: 'center', elevation: 6, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  proceedBtnDisabled: { opacity: 0.5 },
  proceedBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
});