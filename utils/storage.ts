import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';

// Save token
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.log('Error saving token:', error);
  }
};

// Get token
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.log('Error getting token:', error);
    return null;
  }
};

// Remove token
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.log('Error removing token:', error);
  }
};

// Check login
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  } catch (error) {
    console.log('Error checking login:', error);
    return false;
  }
};