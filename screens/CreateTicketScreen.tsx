import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { createTicket } from '../utils/supportTicket.api';

export default function CreateTicketScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please fill in both title and description.');
      return;
    }
    setLoading(true);
    try {
      await createTicket(title.trim(), description.trim());
      Alert.alert('✅ Success', 'Your ticket has been submitted!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Ticket</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Info Banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerIcon}>💬</Text>
            <Text style={styles.bannerText}>
              Describe your issue clearly. Our team will respond as soon as possible.
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.label}>Ticket Title <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Payment not processed"
            placeholderTextColor="#B0B0C3"
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>

          {/* Description */}
          <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Explain your issue in detail..."
            placeholderTextColor="#B0B0C3"
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/500</Text>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {loading ? 'Submitting...' : '🎫  Submit Ticket'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F5',
  },
  backBtn: { padding: 4, width: 40 },
  backArrow: { fontSize: 22, color: '#6366F1' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },

  container: { padding: 20 },

  banner: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#EEF2FF', borderRadius: 12,
    padding: 14, marginBottom: 24, gap: 10,
  },
  bannerIcon: { fontSize: 20 },
  bannerText: { flex: 1, fontSize: 13, color: '#4338CA', lineHeight: 20 },

  label: { fontSize: 14, fontWeight: '600', color: '#1A1A2E', marginBottom: 8 },
  required: { color: '#EF4444' },

  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 14, fontSize: 14, color: '#1A1A2E',
    marginBottom: 4,
  },
  textArea: { height: 140, marginBottom: 4 },
  charCount: { fontSize: 11, color: '#B0B0C3', textAlign: 'right', marginBottom: 20 },

  submitBtn: {
    backgroundColor: '#6366F1', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: '#9999B0', fontSize: 14 },
});