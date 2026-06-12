// screens/OrderSuccessScreen.tsx
// ✅ FIX: navigation.navigate('MRDashboard') → navigation.navigate('Main')
//         MRDashboard is a separate stack screen outside the tabs.
//         After placing an order the user should land back on the Home tab.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function OrderSuccessScreen({ route, navigation }: any) {
  const { order } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>✅</Text>
      </View>
      <Text style={styles.title}>Order Placed!</Text>
      {order?.orderNumber ? (
        <Text style={styles.orderNum}>Order # {order.orderNumber}</Text>
      ) : null}
      <Text style={styles.sub}>
        Aapka order successfully place ho gaya hai.{'\n'}
        Jald hi aapko MR assign kiya jayega.
      </Text>

      {/* ✅ FIX: navigate to 'Main' (tab navigator) not 'MRDashboard' */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
      >
        <Text style={styles.btnText}>Back to Home →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#F8F9FF' },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EAFAF1', justifyContent: 'center', alignItems: 'center', marginBottom: 24, elevation: 4, shadowColor: '#16A34A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
  icon:       { fontSize: 52 },
  title:      { fontSize: 26, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
  orderNum:   { fontSize: 14, color: '#6366F1', fontWeight: '700', marginBottom: 16, backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  sub:        { fontSize: 14, color: '#7A7A9D', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  btn:        { backgroundColor: '#4F46E5', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 14, elevation: 6, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
});