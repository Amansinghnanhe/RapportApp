import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, AppState
} from 'react-native';
import * as Location from 'expo-location';
import { updateMRLocation, toggleMROnline } from '../utils/orderApi';

export default function LocationTrackingScreen() {
  const [isOnline, setIsOnline]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [tracking, setTracking]       = useState(false);

  const intervalRef = useRef<any>(null);
  const appState    = useRef(AppState.currentState);

  // Permission maango
  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Location permission dena zaroori hai tracking ke liye.',
      );
      return false;
    }
    return true;
  };

  // Ek baar location bhejo
  const sendLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;
      setCurrentLocation({ lat: latitude, lng: longitude });
      await updateMRLocation(latitude, longitude);
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    } catch (err) {
      console.log('Location send error:', err);
    }
  };

  // Tracking start
  const startTracking = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    setTracking(true);
    await sendLocation(); // Turant ek baar bhejo

    // Har 15 second mein bhejo
    intervalRef.current = setInterval(async () => {
      await sendLocation();
    }, 15000);
  };

  // Tracking stop
  const stopTracking = () => {
    setTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Online/Offline toggle
  const handleToggleOnline = async () => {
    setLoading(true);
    try {
      await toggleMROnline();
      const newStatus = !isOnline;
      setIsOnline(newStatus);

      if (newStatus) {
        await startTracking();
        Alert.alert('✅ Online', 'Aap ab online hain. Location tracking shuru ho gayi.');
      } else {
        stopTracking();
        Alert.alert('🔴 Offline', 'Aap ab offline hain. Tracking band ho gayi.');
      }
    } catch (err) {
      Alert.alert('Error', 'Status update nahi hua. Backend check karo.');
    } finally {
      setLoading(false);
    }
  };

  // App background mein jaye to bhi track karo
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active' &&
        isOnline
      ) {
        sendLocation();
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [isOnline]);

  // Component unmount pe tracking band
  useEffect(() => {
    return () => stopTracking();
  }, []);

  return (
    <View style={styles.container}>

      {/* Status Card */}
      <View style={[styles.statusCard, { backgroundColor: isOnline ? '#F0FFF4' : '#FFF5F5' }]}>
        <Text style={styles.statusIcon}>{isOnline ? '🟢' : '🔴'}</Text>
        <Text style={[styles.statusText, { color: isOnline ? '#16A34A' : '#DC2626' }]}>
          {isOnline ? 'Online — Tracking Active' : 'Offline — Tracking Stopped'}
        </Text>
      </View>

      {/* Location Info */}
      {currentLocation && (
        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>📍 Current Location</Text>
          <Text style={styles.locationText}>
            Lat: {currentLocation.lat.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Lng: {currentLocation.lng.toFixed(6)}
          </Text>
          {lastUpdated ? (
            <Text style={styles.updatedText}>Last updated: {lastUpdated}</Text>
          ) : null}
        </View>
      )}

      {/* Tracking indicator */}
      {tracking && (
        <View style={styles.trackingRow}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.trackingText}>
            Location har 15 sec mein update ho rahi hai...
          </Text>
        </View>
      )}

      {/* Main Toggle Button */}
      <TouchableOpacity
        style={[
          styles.toggleBtn,
          { backgroundColor: isOnline ? '#DC2626' : '#16A34A' },
          loading && { opacity: 0.6 },
        ]}
        onPress={handleToggleOnline}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.toggleBtnText}>
              {isOnline ? '🔴 Go Offline' : '🟢 Go Online'}
            </Text>
        }
      </TouchableOpacity>

      <Text style={styles.hint}>
        Online hone par location automatically backend ko bhejti rahegi.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, padding: 20, backgroundColor: '#F8FAFF' },
  statusCard:    { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, marginBottom: 20, gap: 10 },
  statusIcon:    { fontSize: 22 },
  statusText:    { fontSize: 15, fontWeight: '700' },
  locationCard:  { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 2 },
  locationTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8 },
  locationText:  { fontSize: 13, color: '#555', marginBottom: 4 },
  updatedText:   { fontSize: 11, color: '#999', marginTop: 6 },
  trackingRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  trackingText:  { fontSize: 13, color: '#2563EB' },
  toggleBtn:     { padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  toggleBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint:          { fontSize: 12, color: '#999', textAlign: 'center' },
});