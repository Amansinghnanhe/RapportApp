import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import OTPScreen from './screens/OTPScreen';
import HomeScreen from './screens/HomeScreen';

import { getToken } from './utils/storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const t = await getToken();
      setToken(t);
    } catch (error) {
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {token ? (
          <>
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Register">
              {(props) => <RegisterScreen {...props} onAuthChange={checkAuth} />}
            </Stack.Screen>

            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onAuthChange={checkAuth} />}
            </Stack.Screen>

            <Stack.Screen name="OTP" component={OTPScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}