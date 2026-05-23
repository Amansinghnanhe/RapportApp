import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import axios from 'axios';
import { saveToken } from '../utils/storage';

const API_URL = 'http://192.168.29.108:5000/api/v1';

export default function LoginScreen({ navigation }: any) {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrMobile || !password) {
      return Alert.alert('Error', 'All fields required');
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/auth/login`, {
        emailOrMobile,
        password
      });

      const token = res.data?.data?.token;

      await saveToken(token);

      Alert.alert('Success', 'Login Successful');

      // 🔥 IMPORTANT FIX
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });

    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Login</Text>

        <TextInput
          placeholder="Email or Mobile"
          value={emailOrMobile}
          onChangeText={setEmailOrMobile}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Go to Register</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 12, marginBottom: 10, borderRadius: 8 },
  btn: { backgroundColor: '#007BFF', padding: 14, borderRadius: 8 },
  btnText: { color: '#fff', textAlign: 'center' },
  link: { marginTop: 15, color: '#007BFF', textAlign: 'center' }
});