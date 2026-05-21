import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import MainTabNavigator from './MainTabNavigator';
import ProviderDetailScreen from '../screens/main/ProviderDetailScreen';
import AllServicesScreen from '../screens/main/AllServicesScreen';
import FilteredUstadsScreen from '../screens/main/FilteredUstadsScreen';

const Stack = createNativeStackNavigator();

// Temporary hardcoded Splash Screen for Demo
function SplashScreen({ navigation }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 justify-center items-center bg-[#1A3673]">
      <View className="bg-white/10 p-6 rounded-full mb-6 items-center justify-center">
        <FontAwesome5 name="tools" size={48} color="white" />
      </View>
      <Text className="text-white text-4xl font-bold mb-8">Ustad AI</Text>
      <ActivityIndicator size="large" color="#FFB300" />
    </View>
  );
}

export default function AppNavigator() {
  // BYPASS ALL FIREBASE LOGIC FOR MANUAL SEQUENCING
  return (
    <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
      <Stack.Screen name="AllServices" component={AllServicesScreen} />
      <Stack.Screen name="FilteredUstads" component={FilteredUstadsScreen} />
    </Stack.Navigator>
  );
}
