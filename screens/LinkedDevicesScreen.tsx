import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
export default function LinkedDevicesScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Linked Devices</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.banner}><Text style={styles.bannerIcon}>🛡️</Text><Text style={styles.bannerText}>These are the devices currently logged into your account.</Text></View>
        <View style={styles.deviceCard}>
          <Text style={styles.deviceIcon}>📱</Text>
          <View style={styles.deviceInfo}>
            <View style={styles.deviceNameRow}>
              <Text style={styles.deviceName}>Current Device</Text>
              <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>This Device</Text></View>
            </View>
            <Text style={styles.deviceSub}>Android • Active now</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutAllBtn} onPress={() => Alert.alert('Logout All', 'Logout from all other devices?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout All', style: 'destructive', onPress: () => Alert.alert('Done', 'Logged out from all devices.') }])}>
          <Text style={styles.logoutAllText}>🚪  Logout All Other Devices</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  backBtn: { padding: 4, width: 40 }, backArrow: { fontSize: 22, color: '#6366F1' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  container: { padding: 20 },
  banner: { flexDirection: 'row', backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14, marginBottom: 20, gap: 10 },
  bannerIcon: { fontSize: 20 }, bannerText: { flex: 1, fontSize: 13, color: '#4338CA', lineHeight: 20 },
  deviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  deviceIcon: { fontSize: 28, marginRight: 14 },
  deviceInfo: { flex: 1 }, deviceNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deviceName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  currentBadge: { backgroundColor: '#EAFAF1', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  currentBadgeText: { fontSize: 10, color: '#28A745', fontWeight: '700' },
  deviceSub: { fontSize: 12, color: '#9999B0', marginTop: 4 },
  logoutAllBtn: { backgroundColor: '#FFF0EF', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#FFCDD2' },
  logoutAllText: { color: '#FF3B30', fontWeight: '700', fontSize: 14 },
});
