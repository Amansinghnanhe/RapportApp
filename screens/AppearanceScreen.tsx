import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
const themes = [
  { id: 'light', label: 'Light Mode', icon: '☀️', desc: 'Clean white background' },
  { id: 'dark', label: 'Dark Mode', icon: '🌙', desc: 'Easy on the eyes at night' },
  { id: 'system', label: 'System Default', icon: '📱', desc: 'Follows your device setting' },
];
export default function AppearanceScreen({ navigation }: any) {
  const [selected, setSelected] = useState('light');
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionLabel}>Theme</Text>
        <View style={styles.card}>
          {themes.map((theme, i) => (
            <TouchableOpacity key={theme.id} style={[styles.themeRow, i < themes.length - 1 && styles.themeRowBorder, selected === theme.id && styles.themeRowSelected]} onPress={() => setSelected(theme.id)}>
              <View style={styles.themeIconBox}><Text style={styles.themeIcon}>{theme.icon}</Text></View>
              <View style={styles.themeInfo}><Text style={styles.themeLabel}>{theme.label}</Text><Text style={styles.themeDesc}>{theme.desc}</Text></View>
              <View style={[styles.radio, selected === theme.id && styles.radioSelected]}>
                {selected === theme.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.noteBanner}><Text style={styles.noteText}>🚧 Dark mode coming soon! Currently Light Mode is active.</Text></View>
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
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9999B0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, marginBottom: 20 },
  themeRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  themeRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F4F4FA' },
  themeRowSelected: { backgroundColor: '#F8F6FF' },
  themeIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F4EFFF', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  themeIcon: { fontSize: 22 }, themeInfo: { flex: 1 },
  themeLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  themeDesc: { fontSize: 12, color: '#9999B0', marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D0D0E0', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#6366F1' }, radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1' },
  noteBanner: { backgroundColor: '#FFF8EC', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FFE4A0' },
  noteText: { fontSize: 13, color: '#856404', lineHeight: 20 },
});
