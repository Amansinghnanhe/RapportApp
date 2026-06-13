import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, ActivityIndicator,
  Animated, StatusBar, Dimensions, Modal
} from 'react-native';
import api from '../utils/api';

const { width } = Dimensions.get('window');

const DARK = {
  bg: '#060B18', card: '#0E1628', cardBorder: 'rgba(99,130,255,0.12)',
  text: '#F0F4FF', subText: '#6B7A99', accent: '#4F6EF7',
  green: '#10B981', orange: '#F59E0B', red: '#EF4444',
  divider: 'rgba(255,255,255,0.06)', input: 'rgba(255,255,255,0.05)',
  inputBorder: 'rgba(255,255,255,0.10)',
};

const VISIT_PURPOSES = [
  '📦 Order Collection',
  '🪪 KYC Submission',
  '💰 Payment Collection',
  '📱 SIM Activation',
  '🤝 Relationship Visit',
  '📋 Document Collection',
  '🔧 Issue Resolution',
  '🆕 New Retailer Onboarding',
];

const STATUS_COLORS: Record<string, string> = {
  completed:  '#10B981',
  in_progress:'#F59E0B',
  pending:    '#6B7280',
  cancelled:  '#EF4444',
};

export default function VisitReportScreen({ navigation }: any) {
  const T = DARK;

  const [visits, setVisits]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [activeTab, setActiveTab]   = useState<'today' | 'history'>('today');

  // New visit form
  const [retailerName, setRetailerName] = useState('');
  const [purpose, setPurpose]           = useState('');
  const [notes, setNotes]               = useState('');
  const [showPurpose, setShowPurpose]   = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchVisits();
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchVisits = async () => {
    try {
      const res = await api.get('/mr/visit-reports');
      setVisits(res.data.data || []);
    } catch {
      // fallback mock data agar API nahi hai
      setVisits([
        { _id: '1', retailerName: 'Sharma Telecom', purpose: '📱 SIM Activation', notes: 'Activated 5 SIMs', status: 'completed', createdAt: new Date().toISOString(), checkIn: '09:30 AM', checkOut: '10:15 AM' },
        { _id: '2', retailerName: 'Raj Mobile',     purpose: '🪪 KYC Submission',  notes: 'Submitted 2 KYC docs', status: 'completed', createdAt: new Date().toISOString(), checkIn: '11:00 AM', checkOut: '11:45 AM' },
        { _id: '3', retailerName: 'Galaxy Store',   purpose: '💰 Payment Collection', notes: 'Collected ₹5000', status: 'in_progress', createdAt: new Date().toISOString(), checkIn: '02:00 PM', checkOut: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisit = async () => {
    if (!retailerName.trim()) return Alert.alert('Error', 'Retailer name daalo');
    if (!purpose) return Alert.alert('Error', 'Visit purpose select karo');

    setSubmitting(true);
    try {
      await api.post('/mr/visit-reports', {
        retailerName: retailerName.trim(),
        purpose,
        notes: notes.trim(),
        checkIn: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        status: 'in_progress',
      });
      Alert.alert('✅ Success', 'Visit report add ho gayi!');
      setShowModal(false);
      setRetailerName('');
      setPurpose('');
      setNotes('');
      fetchVisits();
    } catch {
      // local add karo agar API nahi hai
      const newVisit = {
        _id: Date.now().toString(),
        retailerName: retailerName.trim(),
        purpose,
        notes: notes.trim(),
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        checkIn: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        checkOut: '',
      };
      setVisits(prev => [newVisit, ...prev]);
      setShowModal(false);
      setRetailerName('');
      setPurpose('');
      setNotes('');
      Alert.alert('✅ Added', 'Visit locally save ho gayi!');
    } finally {
      setSubmitting(false);
    }
  };

  const todayVisits   = visits.filter(v => {
    const d = new Date(v.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const historyVisits = visits.filter(v => {
    const d = new Date(v.createdAt);
    const today = new Date();
    return d.toDateString() !== today.toDateString();
  });

  const displayVisits = activeTab === 'today' ? todayVisits : historyVisits;

  const todayStats = {
    total:     todayVisits.length,
    completed: todayVisits.filter(v => v.status === 'completed').length,
    ongoing:   todayVisits.filter(v => v.status === 'in_progress').length,
  };

  if (loading) return (
    <View style={[s.center, { backgroundColor: T.bg }]}>
      <ActivityIndicator size="large" color={T.accent} />
      <Text style={[s.loadingText, { color: T.subText }]}>Loading visits...</Text>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />
      <View style={[s.root, { backgroundColor: T.bg }]}>

        {/* Glow */}
        <View style={s.glow1} />
        <View style={s.glow2} />

        <Animated.ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
        >

          {/* ── Header ── */}
          <Animated.View style={[s.header, { transform: [{ translateY: slideAnim }] }]}>
            <View style={s.headerLeft}>
              <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                <Text style={s.backIcon}>←</Text>
              </TouchableOpacity>
              <View>
                <Text style={[s.pageTitle, { color: T.text }]}>Visit Reports</Text>
                <Text style={[s.pageSub, { color: T.subText }]}>
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[s.addBtn, { backgroundColor: T.accent }]}
              onPress={() => setShowModal(true)}
            >
              <Text style={s.addBtnText}>+ Add Visit</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Today Summary ── */}
          <View style={[s.summaryCard, { backgroundColor: '#1A3A8A' }]}>
            <View style={s.summaryDeco1} />
            <View style={s.summaryDeco2} />
            <Text style={s.summaryTitle}>📊 Today's Summary</Text>
            <View style={s.summaryRow}>
              {[
                { val: todayStats.total,     lbl: 'Total Visits',  color: '#60A5FA' },
                { val: todayStats.completed, lbl: 'Completed',     color: '#34D399' },
                { val: todayStats.ongoing,   lbl: 'In Progress',   color: '#FCD34D' },
              ].map((st, i) => (
                <View key={i} style={s.summaryItem}>
                  <Text style={[s.summaryVal, { color: st.color }]}>{st.val}</Text>
                  <Text style={s.summaryLbl}>{st.lbl}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Tabs ── */}
          <View style={[s.tabRow, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
            {(['today', 'history'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[s.tab, activeTab === tab && { backgroundColor: T.accent }]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[s.tabText, { color: activeTab === tab ? '#fff' : T.subText }]}>
                  {tab === 'today' ? `📅 Today (${todayVisits.length})` : `📜 History (${historyVisits.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Visit List ── */}
          {displayVisits.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyIcon}>📭</Text>
              <Text style={[s.emptyText, { color: T.text }]}>
                {activeTab === 'today' ? 'Aaj koi visit nahi' : 'Koi history nahi'}
              </Text>
              <Text style={[s.emptySub, { color: T.subText }]}>
                + Add Visit se naya visit add karo
              </Text>
            </View>
          ) : (
            displayVisits.map((visit, i) => (
              <Animated.View
                key={visit._id}
                style={[s.visitCard, { backgroundColor: T.card, borderColor: T.cardBorder,
                  borderLeftColor: STATUS_COLORS[visit.status] || T.accent,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }]}
              >
                {/* Status Badge */}
                <View style={[s.statusBadge, { backgroundColor: (STATUS_COLORS[visit.status] || T.accent) + '20' }]}>
                  <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[visit.status] || T.accent }]} />
                  <Text style={[s.statusText, { color: STATUS_COLORS[visit.status] || T.accent }]}>
                    {visit.status === 'completed' ? 'Completed' :
                     visit.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </Text>
                </View>

                {/* Retailer Name */}
                <Text style={[s.retailerName, { color: T.text }]}>{visit.retailerName}</Text>

                {/* Purpose */}
                <View style={[s.purposeTag, { backgroundColor: T.accent + '18' }]}>
                  <Text style={[s.purposeText, { color: T.accent }]}>{visit.purpose}</Text>
                </View>

                {/* Time Row */}
                <View style={s.timeRow}>
                  <View style={s.timeItem}>
                    <Text style={[s.timeLabel, { color: T.subText }]}>Check In</Text>
                    <Text style={[s.timeVal, { color: T.green }]}>🟢 {visit.checkIn || 'N/A'}</Text>
                  </View>
                  {visit.checkOut ? (
                    <View style={s.timeItem}>
                      <Text style={[s.timeLabel, { color: T.subText }]}>Check Out</Text>
                      <Text style={[s.timeVal, { color: T.red }]}>🔴 {visit.checkOut}</Text>
                    </View>
                  ) : (
                    <View style={s.timeItem}>
                      <Text style={[s.timeLabel, { color: T.subText }]}>Check Out</Text>
                      <Text style={[s.timeVal, { color: T.orange }]}>⏳ Ongoing</Text>
                    </View>
                  )}
                </View>

                {/* Notes */}
                {visit.notes ? (
                  <View style={[s.notesBox, { backgroundColor: T.input, borderColor: T.inputBorder }]}>
                    <Text style={[s.notesLabel, { color: T.subText }]}>📝 Notes</Text>
                    <Text style={[s.notesText, { color: T.text }]}>{visit.notes}</Text>
                  </View>
                ) : null}
              </Animated.View>
            ))
          )}

          <View style={{ height: 40 }} />
        </Animated.ScrollView>

        {/* ══ ADD VISIT MODAL ══ */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={[s.modalCard, { backgroundColor: T.card }]}>

              <View style={s.modalHeader}>
                <Text style={[s.modalTitle, { color: T.text }]}>➕ New Visit Report</Text>
                <TouchableOpacity onPress={() => setShowModal(false)} style={s.modalClose}>
                  <Text style={{ color: T.subText, fontSize: 20 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>

                {/* Retailer Name */}
                <Text style={[s.inputLabel, { color: T.subText }]}>RETAILER / SHOP NAME</Text>
                <View style={[s.inputBox, { backgroundColor: T.input, borderColor: T.inputBorder }]}>
                  <Text style={s.inputIcon}>🏪</Text>
                  <TextInput
                    style={[s.input, { color: T.text }]}
                    value={retailerName}
                    onChangeText={setRetailerName}
                    placeholder="Enter retailer name"
                    placeholderTextColor={T.subText}
                  />
                </View>

                {/* Purpose */}
                <Text style={[s.inputLabel, { color: T.subText }]}>VISIT PURPOSE</Text>
                <TouchableOpacity
                  style={[s.inputBox, { backgroundColor: T.input, borderColor: purpose ? T.accent : T.inputBorder }]}
                  onPress={() => setShowPurpose(p => !p)}
                >
                  <Text style={s.inputIcon}>🎯</Text>
                  <Text style={[s.input, { color: purpose ? T.text : T.subText }]}>
                    {purpose || 'Select purpose'}
                  </Text>
                  <Text style={{ color: T.subText }}>▼</Text>
                </TouchableOpacity>

                {showPurpose && (
                  <View style={[s.purposeList, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                    {VISIT_PURPOSES.map((p, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[s.purposeOption, { borderBottomColor: T.divider,
                          backgroundColor: purpose === p ? T.accent + '18' : 'transparent' }]}
                        onPress={() => { setPurpose(p); setShowPurpose(false); }}
                      >
                        <Text style={[s.purposeOptionText, { color: purpose === p ? T.accent : T.text }]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Notes */}
                <Text style={[s.inputLabel, { color: T.subText }]}>NOTES (OPTIONAL)</Text>
                <View style={[s.inputBox, s.notesInput, { backgroundColor: T.input, borderColor: T.inputBorder }]}>
                  <TextInput
                    style={[s.input, { color: T.text, textAlignVertical: 'top' }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Visit ke baare mein kuch likho..."
                    placeholderTextColor={T.subText}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Submit */}
                <TouchableOpacity
                  style={[s.submitBtn, { backgroundColor: T.accent }, submitting && { opacity: 0.6 }]}
                  onPress={handleAddVisit}
                  disabled={submitting}
                >
                  {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.submitText}>✅ Save Visit Report</Text>
                  }
                </TouchableOpacity>

              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  glow1:       { position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(79,110,247,0.12)' },
  glow2:       { position: 'absolute', bottom: 100, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(139,92,246,0.08)' },
  scroll:      { flexGrow: 1, padding: 16, paddingTop: 52, paddingBottom: 40 },

  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft:{ flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:   { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  backIcon:  { color: '#fff', fontSize: 18, fontWeight: '600' },
  pageTitle: { fontSize: 22, fontWeight: '800' },
  pageSub:   { fontSize: 12, marginTop: 2 },
  addBtn:    { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, elevation: 4 },
  addBtnText:{ color: '#fff', fontWeight: '800', fontSize: 13 },

  summaryCard:  { borderRadius: 22, padding: 20, marginBottom: 16, overflow: 'hidden', elevation: 10, shadowColor: '#1A3A8A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14 },
  summaryDeco1: { position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.06)' },
  summaryDeco2: { position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)' },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.70)', marginBottom: 16 },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem:  { alignItems: 'center' },
  summaryVal:   { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  summaryLbl:   { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },

  tabRow:  { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 16, borderWidth: 1 },
  tab:     { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '700' },

  emptyBox:  { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub:  { fontSize: 13 },

  visitCard:      { borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderLeftWidth: 4, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  statusBadge:    { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10, gap: 6 },
  statusDot:      { width: 7, height: 7, borderRadius: 4 },
  statusText:     { fontSize: 11, fontWeight: '700' },
  retailerName:   { fontSize: 17, fontWeight: '800', marginBottom: 8 },
  purposeTag:     { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 12 },
  purposeText:    { fontSize: 12, fontWeight: '700' },
  timeRow:        { flexDirection: 'row', gap: 16, marginBottom: 10 },
  timeItem:       { flex: 1 },
  timeLabel:      { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  timeVal:        { fontSize: 13, fontWeight: '700' },
  notesBox:       { borderRadius: 10, padding: 10, borderWidth: 1, marginTop: 4 },
  notesLabel:     { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  notesText:      { fontSize: 13 },

  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.70)', justifyContent: 'flex-end' },
  modalCard:     { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '90%' },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:    { fontSize: 18, fontWeight: '800' },
  modalClose:    { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },

  inputLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8, marginTop: 14 },
  inputBox:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12, height: 50, gap: 10 },
  inputIcon:   { fontSize: 16 },
  input:       { flex: 1, fontSize: 14, fontWeight: '500' },
  notesInput:  { height: 80, alignItems: 'flex-start', paddingTop: 12 },

  purposeList:       { borderRadius: 14, borderWidth: 1, marginTop: 6, overflow: 'hidden', marginBottom: 4 },
  purposeOption:     { paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1 },
  purposeOptionText: { fontSize: 14, fontWeight: '600' },

  submitBtn:  { backgroundColor: '#4F6EF7', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});