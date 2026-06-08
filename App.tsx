import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, Platform } from 'react-native';

import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import OTPScreen from './screens/OTPScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import MRDashboard from './screens/MRDashboard';
import CheckoutScreen from './screens/CheckoutScreen';
import OrderSuccessScreen from './screens/OrderSuccessScreen';


// Sub-screens
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import LinkedDevicesScreen from './screens/LinkedDevicesScreen';
import LanguageScreen from './screens/LanguageScreen';
import AppearanceScreen from './screens/AppearanceScreen';
import AboutAppScreen from './screens/AboutAppScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';

// ✅ NEW: SIM Delivery MR Screens
import RetailerListScreen from './screens/RetailerListScreen';
import SIMActivationScreen from './screens/SIMActivationScreen';
import KYCScreen from './screens/KYCScreen';
import DailyTargetScreen from './screens/DailyTargetScreen';
import VisitReportScreen from './screens/VisitReportScreen';
import SupportTicketsScreen from './screens/SupportTicketsScreen';

import { getToken } from './utils/storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Bottom Tabs (MR ke liye) ──────────────────────────────
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Profile: '👤',
    Settings: '⚙️',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
      {icons[name]}
    </Text>
  );
}

function MRTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: ({ focused, color }) => (
          <Text style={{ fontSize: 10, color, fontWeight: focused ? '700' : '400' }}>
            {route.name}
          </Text>
        ),
        tabBarActiveTintColor: '#3182CE',
        tabBarInactiveTintColor: '#B0B0C3',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 20,
          height: Platform.OS === 'ios' ? 84 : 62,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}    />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => { checkLogin(); }, []);

  const checkLogin = async () => {
    const token = await getToken();
    setIsLoggedIn(token !== null);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF' }}>
        <ActivityIndicator size="large" color="#3182CE" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Main' : 'Login'}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        {/* ── Auth Screens ── */}
        <Stack.Screen name="Login"    component={LoginScreen}    />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OTP"      component={OTPScreen}      />

        {/* ── MR Main App (Bottom Tabs) ── */}
        <Stack.Screen name="Main" component={MRTabs} />

        {/* ── MR Dashboard ── */}
        <Stack.Screen name="MRDashboard" component={MRDashboard} />

        {/* ── ✅ NEW: SIM Delivery Screens ── */}
        <Stack.Screen name="RetailerList"  component={RetailerListScreen}  />
        <Stack.Screen name="SIMActivation" component={SIMActivationScreen} />
        <Stack.Screen name="KYC"           component={KYCScreen}           />
        <Stack.Screen name="DailyTarget"   component={DailyTargetScreen}   />
        <Stack.Screen name="VisitReport"   component={VisitReportScreen}   />

        {/* ── Common Sub-screens ── */}
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="LinkedDevices"  component={LinkedDevicesScreen}  />
        <Stack.Screen name="Language"       component={LanguageScreen}       />
        <Stack.Screen name="Appearance"     component={AppearanceScreen}     />
        <Stack.Screen name="AboutApp"       component={AboutAppScreen}       />
        <Stack.Screen name="PrivacyPolicy"  component={PrivacyPolicyScreen}  />
        <Stack.Screen name="SupportTickets" component={SupportTicketsScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}