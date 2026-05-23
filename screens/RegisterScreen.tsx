import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.29.108:5000/api/v1';

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ simple validation helpers
  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const isValidMobile = (val: string) =>
    /^[0-9]{10}$/.test(val);

  const handleRegister = async () => {
    const fullName = name.trim();
    const emailId = email.trim();
    const mobileNo = mobile.trim();

    // ❌ validations
    if (!fullName || !emailId || !mobileNo) {
      return Alert.alert('Error', 'All fields are required');
    }

    if (!isValidEmail(emailId)) {
      return Alert.alert('Error', 'Invalid email format');
    }

    if (!isValidMobile(mobileNo)) {
      return Alert.alert('Error', 'Mobile must be 10 digits');
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/auth/register`, {
        fullName,
        email: emailId,
        mobile: mobileNo
      });

      const userId = res.data?.data?.userId;

      Alert.alert('Success', 'OTP sent successfully');

      // 🔥 IMPORTANT FIX (prevents back navigation issue)
      navigation.navigate('OTP', { userId });

    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Registration Failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>R</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Fill your details</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>

          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Mobile (10 digits)"
            value={mobile}
            onChangeText={setMobile}
            style={styles.input}
            keyboardType="numeric"
            maxLength={10}
          />

        </View>

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.disabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have account? Login</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#007BFF'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#777'
  },
  formContainer: {
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  disabled: {
    backgroundColor: '#88B8FF'
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  link: {
    marginTop: 15,
    textAlign: 'center',
    color: '#007BFF'
  }
});