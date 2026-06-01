import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
const sections = [
  { title: '1. Information We Collect', content: 'We collect information you provide directly to us, such as your name, email address, mobile number, and any other information you choose to provide during registration or while using our services.' },
  { title: '2. How We Use Your Information', content: 'We use the information we collect to provide, maintain, and improve our services, process transactions, send notifications, and communicate with you about your account.' },
  { title: '3. Information Sharing', content: 'We do not sell, trade, or otherwise transfer your personal information to outside parties. This does not include trusted third parties who assist us in operating our application.' },
  { title: '4. Data Security', content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.' },
  { title: '5. Your Rights', content: 'You have the right to access, update, or delete your personal information at any time. You may also opt out of receiving promotional communications from us.' },
  { title: '6. Contact Us', content: 'If you have any questions about this Privacy Policy, please contact us through the Help & Support section in the app.' },
];
export default function PrivacyPolicyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBanner}>
          <Text style={styles.bannerIcon}>📄</Text>
          <View><Text style={styles.bannerTitle}>Privacy Policy</Text><Text style={styles.bannerDate}>Last updated: June 2026</Text></View>
        </View>
        {sections.map((section, i) => (
          <View key={i} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
        <Text style={styles.footer}>© 2026 RapportApp. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  backBtn: { padding: 4, width: 40 }, backArrow: { fontSize: 22, color: '#6366F1' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  container: { padding: 20, paddingBottom: 40 },
  topBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#EBF4FF', borderRadius: 14, padding: 16, marginBottom: 20 },
  bannerIcon: { fontSize: 36 },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  bannerDate: { fontSize: 12, color: '#9999B0', marginTop: 2 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  sectionContent: { fontSize: 13, color: '#555', lineHeight: 22 },
  footer: { textAlign: 'center', fontSize: 12, color: '#B0B0C3', marginTop: 12 },
});
