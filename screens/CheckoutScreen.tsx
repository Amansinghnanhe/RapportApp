import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { createCheckoutSession, createOrder } from '../utils/orderApi';

export default function CheckoutScreen({ route, navigation }: any) {
  const { cartItems, addressId } = route.params;
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');

  useEffect(() => {
    // Screen khulte hi session create karo
    initSession();
  }, []);

  const initSession = async () => {
    try {
      const items = cartItems.map((item: any) => ({
        planId: item.planId,
        quantity: item.quantity,
      }));
      const res = await createCheckoutSession(items, 'NORMAL');
      if (res.data?._id) {
        setSessionId(res.data._id);
      }
    } catch (err) {
      Alert.alert('Error', 'Session create nahi hui');
    }
  };

  const placeOrder = async () => {
    if (!sessionId || !addressId) {
      Alert.alert('Error', 'Session ya address missing hai');
      return;
    }
    setLoading(true);
    try {
      const res = await createOrder({
        sessionId,
        addressId,
        paymentMethod,
        orderType: 'NORMAL',
      });
      if (res.data?._id) {
        navigation.navigate('OrderSuccess', { order: res.data });
      }
    } catch (err) {
      Alert.alert('Error', 'Order place nahi hua');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order Summary</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.planId}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
          </View>
        )}
      />

      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.paymentRow}>
        {['COD', 'ONLINE'].map((method) => (
          <TouchableOpacity
            key={method}
            style={[styles.payBtn, paymentMethod === method && styles.payBtnActive]}
            onPress={() => setPaymentMethod(method as any)}
          >
            <Text style={paymentMethod === method ? styles.payBtnTextActive : styles.payBtnText}>
              {method}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.orderBtn, loading && { opacity: 0.6 }]}
        onPress={placeOrder}
        disabled={loading}
      >
        <Text style={styles.orderBtnText}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  itemText: { fontSize: 15, color: '#333' },
  itemQty: { fontSize: 15, color: '#666' },
  label: { fontSize: 14, color: '#888', marginTop: 20, marginBottom: 8 },
  paymentRow: { flexDirection: 'row', gap: 12 },
  payBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  payBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  payBtnText: { color: '#333' },
  payBtnTextActive: { color: '#fff', fontWeight: '600' },
  orderBtn: { marginTop: 30, backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center' },
  orderBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});