// screens/CheckoutScreen.tsx
// ✅ FIXES:
//   1. addressId is now fetched from API — not expected from route.params
//   2. Shows address selector so user can pick a delivery address
//   3. Proper null-checks before placing order
//   4. Uses the shared orderApi (no hardcoded fetch/IP)

import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { createCheckoutSession, createOrder, getUserAddresses } from '../utils/orderApi';

export default function CheckoutScreen({ route, navigation }: any) {
  const { cartItems } = route.params || { cartItems: [] };

  const [sessionId,     setSessionId]     = useState<string | null>(null);
  const [addresses,     setAddresses]     = useState<any[]>([]);
  const [selectedAddr,  setSelectedAddr]  = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [initLoading,   setInitLoading]   = useState(true);
  const [ordering,      setOrdering]      = useState(false);

  useEffect(() => {
    initScreen();
  }, []);

  const initScreen = async () => {
    try {
      // ✅ FIX: Fetch session AND addresses in parallel
      const [sessionRes, addrRes] = await Promise.all([
        createCheckoutSession(
          cartItems.map((item: any) => ({ planId: item.planId, quantity: item.quantity })),
          'NORMAL'
        ),
        getUserAddresses(),
      ]);

      if (sessionRes.data?._id) {
        setSessionId(sessionRes.data._id);
      } else {
        Alert.alert('Error', 'Checkout session nahi bani. Wapas jao aur dobara try karo.');
      }

      const addrList = addrRes.data || [];
      setAddresses(addrList);
      // Auto-select first address if available
      if (addrList.length > 0) setSelectedAddr(addrList[0]._id);
    } catch (err) {
      Alert.alert('Error', 'Screen load nahi hui. Internet check karo.');
    } finally {
      setInitLoading(false);
    }
  };

  const placeOrder = async () => {
    // ✅ FIX: Validate both sessionId AND addressId before proceeding
    if (!sessionId) {
      Alert.alert('Error', 'Checkout session missing hai. Screen reload karo.');
      return;
    }
    if (!selectedAddr) {
      Alert.alert('Address Required', 'Please ek delivery address select karo.');
      return;
    }

    setOrdering(true);
    try {
      const res = await createOrder({
        sessionId,
        addressId: selectedAddr,
        paymentMethod,
        orderType: 'NORMAL',
      });

      if (res.data?._id) {
        navigation.replace('OrderSuccess', { order: res.data });
      } else {
        Alert.alert('Error', res.message || 'Order place nahi hua.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Order place nahi hua.');
    } finally {
      setOrdering(false);
    }
  };

  if (initLoading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Checkout prepare ho raha hai...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Order Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Cart Items */}
      <Text style={styles.sectionLabel}>Items</Text>
      <View style={styles.card}>
        {cartItems.map((item: any, i: number) => (
          <View
            key={item.planId}
            style={[styles.item, i < cartItems.length - 1 && styles.itemBorder]}
          >
            <Text style={styles.itemText}>{item.name || 'Plan'}</Text>
            <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
          </View>
        ))}
      </View>

      {/* Address Selection */}
      <Text style={styles.sectionLabel}>Delivery Address</Text>
      {addresses.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>
            Koi address nahi hai. Profile mein jaakar address add karo.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          {addresses.map((addr: any, i: number) => (
            <TouchableOpacity
              key={addr._id}
              style={[
                styles.addrRow,
                i < addresses.length - 1 && styles.itemBorder,
                selectedAddr === addr._id && styles.addrRowSelected,
              ]}
              onPress={() => setSelectedAddr(addr._id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.addrTitle}>{addr.label || 'Address'}</Text>
                <Text style={styles.addrSub}>
                  {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                </Text>
              </View>
              <View style={[styles.radio, selectedAddr === addr._id && styles.radioActive]}>
                {selectedAddr === addr._id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Payment Method */}
      <Text style={styles.sectionLabel}>Payment Method</Text>
      <View style={styles.paymentRow}>
        {(['COD', 'ONLINE'] as const).map((method) => (
          <TouchableOpacity
            key={method}
            style={[styles.payBtn, paymentMethod === method && styles.payBtnActive]}
            onPress={() => setPaymentMethod(method)}
          >
            <Text style={[
              styles.payBtnText,
              paymentMethod === method && styles.payBtnTextActive
            ]}>
              {method === 'COD' ? '💵 Cash on Delivery' : '📱 Online Payment'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Place Order Button */}
      <TouchableOpacity
        style={[
          styles.orderBtn,
          (ordering || !selectedAddr || !sessionId) && styles.orderBtnDisabled,
        ]}
        onPress={placeOrder}
        disabled={ordering || !selectedAddr || !sessionId}
      >
        {ordering
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.orderBtnText}>Place Order →</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F8F9FF' },
  loadingBox:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#F8F9FF' },
  loadingText:     { fontSize: 14, color: '#9999B0' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  backBtn:         { padding: 4, width: 40 },
  backArrow:       { fontSize: 22, color: '#6366F1' },
  heading:         { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  sectionLabel:    { fontSize: 12, fontWeight: '700', color: '#9999B0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20, paddingHorizontal: 20 },
  card:            { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, overflow: 'hidden' },
  item:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  itemBorder:      { borderBottomWidth: 1, borderBottomColor: '#F4F4FA' },
  itemText:        { fontSize: 15, color: '#1A1A2E', fontWeight: '600' },
  itemQty:         { fontSize: 14, color: '#9999B0' },
  addrRow:         { flexDirection: 'row', alignItems: 'center', padding: 14 },
  addrRowSelected: { backgroundColor: '#F5F3FF' },
  addrTitle:       { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  addrSub:         { fontSize: 12, color: '#9999B0' },
  radio:           { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D0D0E0', justifyContent: 'center', alignItems: 'center' },
  radioActive:     { borderColor: '#6366F1' },
  radioDot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1' },
  emptyText:       { padding: 16, fontSize: 13, color: '#9999B0', textAlign: 'center' },
  paymentRow:      { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 4 },
  payBtn:          { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#DDE3F0', alignItems: 'center', backgroundColor: '#fff' },
  payBtnActive:    { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  payBtnText:      { color: '#555', fontWeight: '600', fontSize: 13 },
  payBtnTextActive:{ color: '#fff', fontWeight: '700', fontSize: 13 },
  orderBtn:        { marginHorizontal: 20, marginTop: 28, backgroundColor: '#4F46E5', padding: 17, borderRadius: 14, alignItems: 'center', elevation: 6, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  orderBtnDisabled:{ opacity: 0.5 },
  orderBtnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
});