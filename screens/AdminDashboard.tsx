import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { removeToken } from '../utils/storage';

export default function AdminDashboard({ navigation }: any) {
  const handleLogout = async () => {
    await removeToken();
    // Logout hone ke baad wapas Login screen par bhej dega
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>👑</Text>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to the Session (Testing Mode)</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 20 },
  logo: { fontSize: 60, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#E53E3E', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#718096', marginBottom: 30 },
  button: { backgroundColor: '#E53E3E', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12, elevation: 3 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});