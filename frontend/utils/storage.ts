import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage utility that works on both web and native
// For Native: Uses SecureStore for sensitive data (tokens) and AsyncStorage for others if needed.
// For Web: Uses localStorage (Note: Web storage is less secure, but standard for web apps).

const storage = {
  async setItem(key: string, value: any): Promise<void> {
    const stringValue = String(value);
    if (Platform.OS === 'web') {
      localStorage.setItem(key, stringValue);
    } else {
      // Use SecureStore for potentially sensitive keys like 'token', 'userId'
      if (key === 'token' || key === 'userId' || key.toLowerCase().includes('key')) {
        await SecureStore.setItemAsync(key, stringValue);
      } else {
        await AsyncStorage.setItem(key, stringValue);
      }
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      // Try SecureStore first
      let result = await SecureStore.getItemAsync(key);
      if (result) return result;

      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
      await AsyncStorage.removeItem(key);
    }
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.clear();
    } else {
      // Clear both
      // Note: SecureStore doesn't have a clearAll, so we might need to track keys if strictly needed,
      // but typically we just clear AsyncStorage and specific SecureStore keys on logout.
      await AsyncStorage.clear();
    }
  },
};

export default storage;
