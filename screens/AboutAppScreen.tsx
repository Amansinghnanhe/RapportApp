import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
export default function AboutAppScreen({ navigation }: any) {
  const info = [
    { label: 'App Name', value: 'RapportApp' },
    { label: 'Version', value: '1.0.0' },
    { label: 'Build', value: '2026.06.01' },
    { label: 'Developer', value: 'Aman' },
    { label: 'Platform', value: 'React Native + Expo' },
    { label: 'Backend', value: 'Node.js + MongoDB' },
  ];
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>About App</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}><Text style={styles.logoEmoji}>📡</Text></View>
          <Text style={styles.appName}>RapportApp</Text>
          <Text style={styles.tagline}>Connecting People, Seamlessly</Text>
          <View style={styles.versionBadge}><Text style={styles.versionBadgeText}>v1.0.0</Text></View>
        </View>
        <Text style={styles.sectionLabel}>App Details</Text>
        <View style={styles.card}>
          {info.map((item, i) => (
            <View key={i} style={[styles.infoRow, i < info.length - 1 && styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.madeWith}>
          <Text style={styles.madeWithText}>Made with ❤️ by Aman</Text>
          <Text style={styles.madeWithSub}>© 2026 RapportApp. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  backBtn: { padding: 4, width: 40 }, backArrow: { fontSize: 22, color: '#6366F1' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  container: { padding: 20, alignItems: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 32, marginTop: 8 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#007BFF', justifyContent: 'center', alignItems: 'center', marginBottom: 14, elevation: 10, shadowColor: '#007BFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: 24, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 4 },
  tagline: { fontSize: 13, color: '#9999B0', marginBottom: 12 },
  versionBadge: { backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  versionBadgeText: { color: '#6366F1', fontWeight: '700', fontSize: 13 },
  sectionLabel: { alignSelf: 'flex-start', fontSize: 12, fontWeight: '700', color: '#9999B0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F4F4FA' },
  infoLabel: { fontSize: 13, color: '#9999B0', fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  madeWith: { alignItems: 'center' },
  madeWithText: { fontSize: 14, color: '#555', fontWeight: '600' },
  madeWithSub: { fontSize: 11, color: '#B0B0C3', marginTop: 4 },
});
