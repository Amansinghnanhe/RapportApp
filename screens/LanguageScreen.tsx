import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
const languages = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
];
export default function LanguageScreen({ navigation }: any) {
  const [selected, setSelected] = useState('en');
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionLabel}>Select Language</Text>
        <View style={styles.card}>
          {languages.map((lang, i) => (
            <TouchableOpacity key={lang.code} style={[styles.langRow, i < languages.length - 1 && styles.langRowBorder]} onPress={() => { setSelected(lang.code); Alert.alert('Language Changed', `App language set to ${lang.name}`); }}>
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={styles.langInfo}><Text style={styles.langName}>{lang.name}</Text><Text style={styles.langNative}>{lang.native}</Text></View>
              {selected === lang.code && <Text style={styles.checkmark}>✅</Text>}
            </TouchableOpacity>
          ))}
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
  container: { padding: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9999B0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  langRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  langRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F4F4FA' },
  flag: { fontSize: 24, marginRight: 14 }, langInfo: { flex: 1 },
  langName: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  langNative: { fontSize: 12, color: '#9999B0', marginTop: 2 },
  checkmark: { fontSize: 18 },
});
