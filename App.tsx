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
import NotificationScreen from './screens/NotificationScreen';
import SettingsScreen from './screens/SettingsScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SupportTicketListScreen from './screens/SupportTicketListScreen';
import CreateTicketScreen from './screens/CreateTicketScreen';

// Naye screens import
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import LinkedDevicesScreen from './screens/LinkedDevicesScreen';
import LanguageScreen from './screens/LanguageScreen';
import AppearanceScreen from './screens/AppearanceScreen';
import AboutAppScreen from './screens/AboutAppScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';

// Testing ke dashboards
import AdminDashboard from './screens/AdminDashboard';
import MRDashboard from './screens/MRDashboard';

// Storage utility imports
import { getToken, getRole } from './utils/storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠', Profile: '👤', Notifications: '🔔', Settings: '⚙️', Analytics: '📊',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
      {icons[name]}
    </Text>
  );
}

// Main Tabs Component for Normal Users
function MainTabs({ route }: any) {
  const rawRole = route.params?.role || 'USER';
  const userRole = rawRole.toUpperCase();

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
        tabBarActiveTintColor: '#007BFF',
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      
      {/* Analytics dashboard access control */}
      {(userRole === 'ADMIN' || userRole === 'MR') && (
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      )}
      
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null); 

  useEffect(() => { checkLogin(); }, []);

  const checkLogin = async () => {
    const token = await getToken();
    const userRole = await getRole(); 
    
    setIsLoggedIn(token !== null);
    setRole(userRole ? userRole.toUpperCase() : null);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FF' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        // 🚀 AUTOMATIC ROUTING: Agar login ho toh direct uske role wale module par bhejega
        initialRouteName={isLoggedIn ? 'Main' : 'Login'}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        
        {/* 🔥 INDUSTRIAL STRATEGY: Root screen selector based on role session */}
        {role === 'ADMIN' ? (
          <Stack.Screen name="Main" component={AdminDashboard} />
        ) : role === 'MR' ? (
          <Stack.Screen name="Main" component={MRDashboard} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} initialParams={{ role: role }} />
        )}
        
        {/* Fallback routes for dynamic transitions */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="MRDashboard" component={MRDashboard} />
        
        <Stack.Screen name="SupportTickets" component={SupportTicketListScreen} />
        <Stack.Screen name="CreateTicket" component={CreateTicketScreen} />

        {/* Common Sub-screens */}
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="LinkedDevices" component={LinkedDevicesScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="Appearance" component={AppearanceScreen} />
        <Stack.Screen name="AboutApp" component={AboutAppScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}