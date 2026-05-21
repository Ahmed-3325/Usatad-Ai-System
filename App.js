import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { FirebaseProvider } from './src/context/FirebaseProvider';
import { NetworkProvider } from './src/context/NetworkProvider';
import { LanguageProvider } from './src/context/LanguageContext';

// Polyfill for NativeWind (if needed based on version, but typically handled by babel)
// Make sure you have configured babel.config.js and tailwind.config.js for NativeWind.

if (Platform.OS === 'web') {
  // Inject Tailwind CSS via CDN for bulletproof web styling
  const script = document.createElement('script');
  script.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(script);

  // Inject a mobile container style to map exact mockups on desktop browser
  const style = document.createElement('style');
  style.innerHTML = `
    body {
      background-color: #f3f4f6;
      display: flex;
      justify-content: center;
      margin: 0;
      padding: 0;
      height: 100vh;
      width: 100vw;
    }
    #root {
      width: 100%;
      max-width: 420px;
      height: 100vh;
      background-color: white;
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      position: relative;
    }
  `;
  document.head.appendChild(style);
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <FirebaseProvider>
          <LanguageProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <AppNavigator />
            </NavigationContainer>
          </LanguageProvider>
        </FirebaseProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
