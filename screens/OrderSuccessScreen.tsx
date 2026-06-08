import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function OrderSuccessScreen({ route, navigation }: any) {
  const { order } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✅</Text>
      <Text style={styles.title}>Order Placed!</Text>
      <Text style={styles.orderNum}>Order # {order?.orderNumber}</Text>
      <Text style={styles.sub}>
        Aapka order successfully place ho gaya hai.{'\n'}
        Jald hi aapko MR assign kiya jayega.
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('MRDashboard')}
      >
        <Text style={styles.btnText}>Dashboard par jao</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#fff' },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#111', marginBottom: 8 },
  orderNum: { fontSize: 15, color: '#4F46E5', fontWeight: '600', marginBottom: 16 },
  sub: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  btn: { backgroundColor: '#4F46E5', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});