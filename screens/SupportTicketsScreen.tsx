import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal, RefreshControl
} from 'react-native';
import { getToken } from '../utils/storage';

// ✅ FIXED: API_URL ko uncomment kiya aur path ko /admin ke sath map kiya
const API_URL = 'http://192.168.29.108:5000/api/v1/admin';

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

  const authFetch = async (url: string, options: any = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  const fetchTickets = async () => {
    try {
      const res = await authFetch(`${API_URL}/tickets`, { method: 'GET' });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        setTickets(data.data || []);
      } else {
        const textError = await res.text();
        console.error("Fetch Tickets Error:", textError.substring(0, 100));
        Alert.alert('Error', 'Server se unexpected response mila. Path check karein.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Tickets fetch karne mein dikkat aayi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Title aur description dono bharo');
      return;
    }
    setSubmitting(true);
    try {
      // ✅ FIXED: Method explicitly POST kiya aur body pass ki
      const res = await authFetch(`${API_URL}/tickets`, {
        method: 'POST',
        body: JSON.stringify({ title, description }),
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (res.ok) {
          Alert.alert('✅ Done', 'Ticket successfully create ho gayi!');
          setTitle('');
          setDescription('');
          setShowCreate(false);
          fetchTickets(); // List refresh karne ke liye
        } else {
          Alert.alert('Error', data.message || 'Kuch galat hua');
        }
      } else {
        const textError = await res.text();
        console.error("Create Ticket HTML Error:", textError.substring(0, 100));
        Alert.alert('Server Error', 'Ticket route nahi mila ya token invalid hai.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Server se connect nahi ho pa raha');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_URL}/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: replyText }),
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (res.ok) {
          setReplyText('');
          setShowDetail(data.data);
          fetchTickets();
        } else {
          Alert.alert('Error', data.message);
        }
      } else {
        Alert.alert('Error', 'Server issue while replying');
      }
    } catch (e) {
      Alert.alert('Error', 'Reply nahi ho payi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (ticketId: string) => {
    Alert.alert('Ticket Close', 'Kya issue resolve ho gaya?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close Karo', style: 'destructive',
        onPress: async () => {
          try {
            const res = await authFetch(`${API_URL}/tickets/${ticketId}/close`, { method: 'PATCH' });
            if (res.ok) {
              setShowDetail(null);
              fetchTickets();
            } else {
              Alert.alert('Error', 'Close request fail ho gayi');
            }
          } catch (e) {
            Alert.alert('Error', 'Close nahi ho payi');
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
    <View style={s.loadingBox}>
      <ActivityIndicator size="large" color="#3182CE" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4FF' }}>

      {/* ── HEADER ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Help & Support</Text>
          <Text style={s.headerSub}>{tickets.length} total tickets</Text>
        </View>
        <TouchableOpacity style={s.newBtn} onPress={() => setShowCreate(true)}>
          <Text style={s.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* ── TICKETS LIST ── */}
      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTickets(); }} />
        }
      >
        {tickets.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={{ fontSize: 48 }}>🎫</Text>
            <Text style={s.emptyTitle}>Koi ticket nahi hai</Text>
            <Text style={s.emptySub}>Koi problem ho toh naya ticket banao</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setShowCreate(true)}>
              <Text style={s.emptyBtnText}>+ Ticket Banao</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket._id}
              style={s.ticketCard}
              onPress={() => setShowDetail(ticket)}
              activeOpacity={0.82}
            >
              <View style={s.ticketTop}>
                <Text style={s.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                <View style={[s.statusBadge, { backgroundColor: statusColor(ticket.status) + '18' }]}>
                  <Text style={[s.statusText, { color: statusColor(ticket.status) }]}>
                    {statusLabel(ticket.status)}
                  </Text>
                </View>
              </View>
              <Text style={s.ticketDesc} numberOfLines={2}>{ticket.description}</Text>
              <View style={s.ticketFooter}>
                <Text style={s.ticketMeta}>
                  📅 {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                </Text>
                <Text style={s.ticketMeta}>
                  💬 {ticket.replies.length} replies
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ── CREATE TICKET MODAL ── */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>🎫 New Ticket</Text>
            <Text style={s.modalSub}>Apni problem describe karo</Text>

            <Text style={s.label}>Title *</Text>
            <TextInput
              style={s.input}
              placeholder="Problem ka short title"
              value={title}
              onChangeText={setTitle}
              maxLength={80}
            />

            <Text style={s.label}>Description *</Text>
            <TextInput
              style={[s.input, s.textarea]}
              placeholder="Poori problem detail mein likho..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={s.modalBtns}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => { setShowCreate(false); setTitle(''); setDescription(''); }}
              >
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.submitBtnText}>Submit</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── TICKET DETAIL MODAL ── */}
      <Modal visible={!!showDetail} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalBox, { maxHeight: '85%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={s.detailHeader}>
                <Text style={s.modalTitle}>{showDetail?.title}</Text>
                {showDetail && (
                  <View style={[s.statusBadge, { backgroundColor: statusColor(showDetail.status) + '18' }]}>
                    <Text style={[s.statusText, { color: statusColor(showDetail.status) }]}>
                      {statusLabel(showDetail.status)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={s.detailDesc}>{showDetail?.description}</Text>

              {/* Replies */}
              {(showDetail?.replies?.length ?? 0) > 0 && (
                <View style={s.repliesSection}>
                  <Text style={s.repliesTitle}>💬 Replies</Text>
                  {showDetail?.replies.map((r, i) => (
                    <View key={i} style={s.replyBubble}>
                      <Text style={s.replyName}>
                        {r.repliedBy?.fullName ?? 'Support Team'}
                        <Text style={s.replyRole}> ({r.repliedBy?.role ?? 'admin'})</Text>
                      </Text>
                      <Text style={s.replyMsg}>{r.message}</Text>
                      <Text style={s.replyTime}>
                        {new Date(r.createdAt).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Reply Input — only if not closed */}
              {showDetail?.status !== 'CLOSED' && (
                <View style={s.replyInputBox}>
                  <Text style={s.label}>Add Reply</Text>
                  <TextInput
                    style={[s.input, s.textarea]}
                    placeholder="Reply likho..."
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <TouchableOpacity
                    style={[s.submitBtn, { marginTop: 8 }, submitting && { opacity: 0.6 }]}
                    onPress={() => showDetail && handleReply(showDetail._id)}
                    disabled={submitting}
                  >
                    {submitting
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={s.submitBtnText}>Reply Bhejo</Text>
                    }
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {/* Footer Buttons */}
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowDetail(null)}>
                <Text style={s.cancelBtnText}>Close</Text>
              </TouchableOpacity>
              {showDetail?.status !== 'CLOSED' && (
                <TouchableOpacity
                  style={[s.submitBtn, { backgroundColor: '#E53E3E' }]}
                  onPress={() => showDetail && handleClose(showDetail._id)}
                >
                  <Text style={s.submitBtnText}>Issue Resolved ✅</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  container:  { flexGrow: 1, padding: 16, paddingBottom: 30 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF' },
  header:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, paddingTop: 50, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, gap: 12 },
  backBtn:     { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  backText:    { fontSize: 20, color: '#1A1A2E', fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  headerSub:   { fontSize: 12, color: '#9999B0', marginTop: 2 },
  newBtn:      { backgroundColor: '#3182CE', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  newBtnText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
  ticketCard:   { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  ticketTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketTitle:  { fontSize: 15, fontWeight: '700', color: '#1A1A2E', flex: 1, marginRight: 8 },
  ticketDesc:   { fontSize: 13, color: '#7A7A9D', marginBottom: 10, lineHeight: 18 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  ticketMeta:   { fontSize: 11, color: '#B0B0C8' },
  statusBadge:  { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:   { fontSize: 11, fontWeight: '700' },
  emptyBox:     { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  emptySub:     { fontSize: 13, color: '#9999B0', textAlign: 'center' },
  emptyBtn:     { backgroundColor: '#3182CE', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox:     { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  modalSub:     { fontSize: 13, color: '#9999B0', marginBottom: 20 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  detailDesc:   { fontSize: 14, color: '#4A4A6A', lineHeight: 22, marginBottom: 20 },
  repliesSection: { marginBottom: 16 },
  repliesTitle:   { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 10 },
  replyBubble:    { backgroundColor: '#F0F4FF', borderRadius: 14, padding: 12, marginBottom: 8 },
  replyName:      { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  replyRole:      { fontSize: 11, color: '#9999B0', fontWeight: '400' },
  replyMsg:       { fontSize: 13, color: '#4A4A6A', marginTop: 4, lineHeight: 18 },
  replyTime:      { fontSize: 10, color: '#B0B0C8', marginTop: 6 },
  replyInputBox:  { marginTop: 8 },
  label:     { fontSize: 13, fontWeight: '600', color: '#4A4A6A', marginBottom: 6 },
  input:     { backgroundColor: '#F4F6FF', borderRadius: 12, padding: 14, fontSize: 14, color: '#1A1A2E', borderWidth: 1, borderColor: '#E0E4F0' },
  textarea:  { height: 100, marginBottom: 8 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn:     { flex: 1, backgroundColor: '#F0F4FF', borderRadius: 14, padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#4A4A6A', fontWeight: '700' },
  submitBtn:     { flex: 1, backgroundColor: '#3182CE', borderRadius: 14, padding: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700' },
});