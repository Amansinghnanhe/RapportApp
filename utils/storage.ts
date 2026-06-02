import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Login ke waqt Backend se milne wale Token aur Testing/Real Role dono ko save karne ke liye
 */
export const saveLoginSession = async (token: string, role: string) => {
  try {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('role', role);
  } catch (error) {
    console.error("Storage save error:", error);
  }
};

/**
 * Purane code ko support karne ke liye (Sirf token save karne ka option)
 */
export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error("Token save error:", error);
  }
};

/**
 * Pure App mein kahin bhi Token nikaalne ke liye (API Calls mein use hoga)
 */
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error("Token get error:", error);
    return null;
  }
};

/**
 * User ka Role (ADMIN, MR, USER) nikaalne ke liye (Navigation aur UI control ke liye)
 */
export const getRole = async () => {
  try {
    return await AsyncStorage.getItem('role');
  } catch (error) {
    console.error("Role get error:", error);
    return null;
  }
};

/**
 * Logout ke waqt Token aur Role dono ko mobile memory se delete karne ke liye
 */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
  } catch (error) {
    console.error("Storage remove error:", error);
  }
};

/**
 * Check karne ke liye ki kya koi user logged in hai ya nahi
 */
export const isLoggedIn = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token !== null;
  } catch (error) {
    return false;
  }
};