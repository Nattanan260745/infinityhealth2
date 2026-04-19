// Polyfill localStorage for Node.js environment (SSR/Build time)
// This MUST be the first thing that runs in the application
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  };
}

// Now continue with the normal entry point
import 'expo-router/entry';
