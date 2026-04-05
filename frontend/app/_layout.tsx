import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Slot } from 'expo-router'; // Added Slot
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'; // Added Clerk imports
import * as SecureStore from 'expo-secure-store'; // Added SecureStore import
import * as Notifications from 'expo-notifications';
import { usePushNotifications } from './hook/usePushNotifications';
import { usePollingNotifications } from './hook/usePollingNotifications';

import { TutorialProvider } from './context/TutorialContext';
import TutorialOverlay from './components/shared/TutorialOverlay';

import '../app/global.css';

// Configure Notification Channel for Android
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Clerk Token Cache Configuration
const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <RootLayoutNav />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  usePushNotifications();
  usePollingNotifications();

  return (
    <TutorialProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="components/HomePage/subHomePage/missions" options={{ headerShown: false }} />
          <Stack.Screen name="components/HomePage/subHomePage/exercise" options={{ headerShown: false }} />
          <Stack.Screen name="components/HomePage/subHomePage/routine" options={{ headerShown: false }} />
          <Stack.Screen name="components/HomePage/subHomePage/modal" options={{ presentation: 'modal' }} />
        </Stack>
        <TutorialOverlay />
      </ThemeProvider>
    </TutorialProvider>
  );
}
