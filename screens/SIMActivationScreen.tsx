import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SIMActivationScreen({ navigation }: any) {
  return (
    <View style={s.c}>
      <Text style={s.t}>📱 SIM Activation</Text>
      <Text style={s.sub}>Coming Soon...</Text>
      <TouchableOpacity style={s.btn} onPress={() => navigation.goBack()}>
        <Text style={s.btnT}>← Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#F0F4FF' },
  t: { fontSize:28, fontWeight:'800', color:'#1A1A2E', marginBottom:8 },
  sub: { fontSize:14, color:'#9999B0', marginBottom:30 },
  btn: { backgroundColor:'#3182CE', paddingHorizontal:24, paddingVertical:12, borderRadius:12 },
  btnT: { color:'#fff', fontWeight:'700', fontSize:15 },
});