// screens/SupportTicketsScreen.tsx
// ✅ FIX: Was using hardcoded 'http://192.168.1.5:3000' (wrong IP/port).
//         Now uses the shared `api` axios instance from utils/api.ts.

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal, RefreshControl
} from 'react-native';
import api from '../utils/api';

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string;
  replies: { message: string; repliedBy: any; createdAt: string }[];
};

export default function SupportTicketsScreen({ navigation }: any) {
  const [tickets,     setTickets]     = useState<Ticket[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [showCreate,  setShowCreate]  = useState(false);
  const [showDetail,  setShowDetail]  = useState<Ticket | null>(null);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [replyText,   setReplyText]   = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const fetchTickets = async () => {
    try {
      // ✅ FIX: uses shared api instance (correct IP, correct port, with token)
      const res = await api.get('/tickets');
      setTickets(res.data?.data || []);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/tickets', { title, description });
      Alert.alert('✅ Success', 'Ticket created successfully!');
      setTitle('');
      setDescription('');
      setShowCreate(false);
      fetchTickets();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/tickets/reply/${ticketId}`, { message: replyText });
      setReplyText('');
      setShowDetail(res.data?.data || null);
      fetchTickets();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (ticketId: string) => {
    Alert.alert('Close Ticket', 'Has your issue been resolved?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Close It', style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/tickets/close/${ticketId}`);
            setShowDetail(null);
            fetchTickets();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to close ticket');
          }
        },
      },
    ]);
  };

  const statusColor = (s: string) =>
    s === 'OPEN' ? '#3182CE' : s === 'IN_PROGRESS' ? '#D69E2E' : '#38A169';

  const statusLabel = (s: string) =>
    s === 'OPEN' ? '🔵 Open' : s === 'IN_PROGRESS' ? '🟡 In Progress' : '🟢 Closed';

  if (loading) return (
    <View style={st.loadingBox}>
      <ActivityIndicator size="large" color="#3182CE" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>

      {/* ── HEADER ── */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={st.headerTitle}>Help & Support</Text>
          <Text style={st.headerSub}>{tickets.length} total tickets</Text>
        </View>
        <TouchableOpacity style={st.newBtn} onPress={() => setShowCreate(true)}>
          <Text style={st.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* ── TICKETS LIST ── */}
      <ScrollView
        contentContainerStyle={st.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchTickets(); }}
          />
        }
      >
        {tickets.length === 0 ? (
          <View style={st.emptyBox}>
            <Text style={{ fontSize: 48 }}>🎫</Text>
            <Text style={st.emptyTitle}>No tickets yet</Text>
            <Text style={st.emptySub}>Raise a ticket if you have any issue</Text>
            <TouchableOpacity style={st.emptyBtn} onPress={() => setShowCreate(true)}>
              <Text style={st.emptyBtnText}>+ Create Ticket</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket._id}
              style={st.ticketCard}
              onPress={() => setShowDetail(ticket)}
              activeOpacity={0.82}
            >
              <View style={st.ticketTop}>
                <Text style={st.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                <View style={[st.statusBadge, { backgroundColor: statusColor(ticket.status) + '18' }]}>
                  <Text style={[st.statusText, { color: statusColor(ticket.status) }]}>
                    {statusLabel(ticket.status)}
                  </Text>
                </View>
              </View>
              <Text style={st.ticketDesc} numberOfLines={2}>{ticket.description}</Text>
              <View style={st.ticketFooter}>
                <Text style={st.ticketMeta}>
                  📅 {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                </Text>
                <Text style={st.ticketMeta}>
                  💬 {ticket.replies?.length ?? 0} replies
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ── CREATE TICKET MODAL ── */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={st.modalOverlay}>
          <View style={st.modalBox}>
            <Text style={st.modalTitle}>🎫 New Ticket</Text>
            <Text style={st.modalSub}>Describe your issue</Text>

            <Text style={st.label}>Title *</Text>
            <TextInput
              style={st.input}
              placeholder="Enter issue title"
              value={title}
              onChangeText={setTitle}
              maxLength={80}
            />

            <Text style={st.label}>Description *</Text>
            <TextInput
              style={[st.input, st.textarea]}
              placeholder="Describe your problem in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={st.modalBtns}>
              <TouchableOpacity
                style={st.cancelBtn}
                onPress={() => { setShowCreate(false); setTitle(''); setDescription(''); }}
              >
                <Text style={st.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={st.submitBtnText}>Submit</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── TICKET DETAIL MODAL ── */}
      <Modal visible={!!showDetail} animationType="slide" transparent>
        <View style={st.modalOverlay}>
          <View style={[st.modalBox, { maxHeight: '85%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={st.detailHeader}>
                <Text style={st.modalTitle}>{showDetail?.title}</Text>
                {showDetail && (
                  <View style={[st.statusBadge, { backgroundColor: statusColor(showDetail.status) + '18' }]}>
                    <Text style={[st.statusText, { color: statusColor(showDetail.status) }]}>
                      {statusLabel(showDetail.status)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={st.detailDesc}>{showDetail?.description}</Text>

              {(showDetail?.replies?.length ?? 0) > 0 && (
                <View style={st.repliesSection}>
                  <Text style={st.repliesTitle}>💬 Replies</Text>
                  {showDetail?.replies.map((r, i) => (
                    <View key={i} style={st.replyBubble}>
                      <Text style={st.replyName}>
                        {r.repliedBy?.fullName ?? 'Support Team'}
                        <Text style={st.replyRole}> ({r.repliedBy?.role ?? 'admin'})</Text>
                      </Text>
                      <Text style={st.replyMsg}>{r.message}</Text>
                      <Text style={st.replyTime}>
                        {new Date(r.createdAt).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {showDetail?.status !== 'CLOSED' && (
                <View style={st.replyInputBox}>
                  <Text style={st.label}>Add Reply</Text>
                  <TextInput
                    style={[st.input, st.textarea]}
                    placeholder="Write your reply..."
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <TouchableOpacity
                    style={[st.submitBtn, { marginTop: 8 }, submitting && { opacity: 0.6 }]}
                    onPress={() => showDetail && handleReply(showDetail._id)}
                    disabled={submitting}
                  >
                    {submitting
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={st.submitBtnText}>Send Reply</Text>
                    }
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            <View style={st.modalBtns}>
              <TouchableOpacity style={st.cancelBtn} onPress={() => setShowDetail(null)}>
                <Text style={st.cancelBtnText}>Close</Text>
              </TouchableOpacity>
              {showDetail?.status !== 'CLOSED' && (
                <TouchableOpacity
                  style={[st.submitBtn, { backgroundColor: '#E53E3E' }]}
                  onPress={() => showDetail && handleClose(showDetail._id)}
                >
                  <Text style={st.submitBtnText}>Mark Resolved ✅</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const st = StyleSheet.create({
  container:      { flexGrow: 1, padding: 16, paddingBottom: 30 },
  loadingBox:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF' },
  header:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, paddingTop: 50, elevation: 4, gap: 12 },
  backBtn:        { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  backText:       { fontSize: 20, color: '#1A1A2E', fontWeight: '700' },
  headerTitle:    { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  headerSub:      { fontSize: 12, color: '#9999B0', marginTop: 2 },
  newBtn:         { backgroundColor: '#3182CE', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  newBtnText:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  ticketCard:     { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, elevation: 3 },
  ticketTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketTitle:    { fontSize: 15, fontWeight: '700', color: '#1A1A2E', flex: 1, marginRight: 8 },
  ticketDesc:     { fontSize: 13, color: '#7A7A9D', marginBottom: 10, lineHeight: 18 },
  ticketFooter:   { flexDirection: 'row', justifyContent: 'space-between' },
  ticketMeta:     { fontSize: 11, color: '#B0B0C8' },
  statusBadge:    { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:     { fontSize: 11, fontWeight: '700' },
  emptyBox:       { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  emptySub:       { fontSize: 13, color: '#9999B0', textAlign: 'center' },
  emptyBtn:       { backgroundColor: '#3182CE', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  emptyBtnText:   { color: '#fff', fontWeight: '700' },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox:       { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalTitle:     { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  modalSub:       { fontSize: 13, color: '#9999B0', marginBottom: 20 },
  detailHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  detailDesc:     { fontSize: 14, color: '#4A4A6A', lineHeight: 22, marginBottom: 20 },
  repliesSection: { marginBottom: 16 },
  repliesTitle:   { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 10 },
  replyBubble:    { backgroundColor: '#F0F4FF', borderRadius: 14, padding: 12, marginBottom: 8 },
  replyName:      { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  replyRole:      { fontSize: 11, color: '#9999B0', fontWeight: '400' },
  replyMsg:       { fontSize: 13, color: '#4A4A6A', marginTop: 4, lineHeight: 18 },
  replyTime:      { fontSize: 10, color: '#B0B0C8', marginTop: 6 },
  replyInputBox:  { marginTop: 8 },
  label:          { fontSize: 13, fontWeight: '600', color: '#4A4A6A', marginBottom: 6 },
  input:          { backgroundColor: '#F4F6FF', borderRadius: 12, padding: 14, fontSize: 14, color: '#1A1A2E', borderWidth: 1, borderColor: '#E0E4F0' },
  textarea:       { height: 100, marginBottom: 8 },
  modalBtns:      { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn:      { flex: 1, backgroundColor: '#F0F4FF', borderRadius: 14, padding: 14, alignItems: 'center' },
  cancelBtnText:  { color: '#4A4A6A', fontWeight: '700' },
  submitBtn:      { flex: 1, backgroundColor: '#3182CE', borderRadius: 14, padding: 14, alignItems: 'center' },
  submitBtnText:  { color: '#fff', fontWeight: '700' },
});