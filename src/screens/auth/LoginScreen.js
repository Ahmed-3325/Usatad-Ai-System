import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useFirebase } from '../../context/FirebaseProvider';
import * as WebBrowser from 'expo-web-browser';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { auth } = useFirebase();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Login successfully!');
      navigation.replace('MainTabs');
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Please enter correct username or password.');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'Please register yourself first.');
      } else {
        Alert.alert('Login Failed', error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#1A3673]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="px-6 pt-16 pb-8">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6 w-10 h-10 rounded-xl bg-white/10 items-center justify-center">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row items-center mb-2">
            <View className="bg-[#FFB300] p-3 rounded-xl mr-4">
              <FontAwesome5 name="tools" size={24} color="#1A3673" />
            </View>
            <View>
              <Text className="text-white text-3xl font-bold">Welcome Back</Text>
              <Text className="text-gray-300 text-base mt-1">Login to find your trusted Ustad</Text>
            </View>
          </View>
        </View>

        {/* White Card */}
        <View className="flex-1 bg-white rounded-t-[30px] px-6 pt-8 pb-10 shadow-lg">


          {/* Form */}
          <Text className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Email Address</Text>
          <View className="flex-row items-center border border-gray-200 rounded-xl mb-6 bg-white overflow-hidden">
            <View className="px-4 border-r border-gray-200 py-4">
              <Feather name="mail" size={20} color="#6B7280" />
            </View>
            <TextInput
              className="flex-1 px-4 py-4 text-base text-gray-800"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Password</Text>
          <View className="flex-row items-center border border-gray-200 rounded-xl mb-2 bg-white overflow-hidden">
            <View className="px-4 py-4">
              <Feather name="lock" size={20} color="#6B7280" />
            </View>
            <TextInput
              className="flex-1 py-4 text-base text-gray-800"
              placeholder=""
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-4 py-4">
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="mb-8">
            <Text className="text-right text-[#FFB300] font-bold">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-[#FFB300] p-4 rounded-xl flex-row justify-center items-center shadow-sm"
            onPress={handleLogin}
          >
            <Text className="text-[#1A3673] font-bold text-lg mr-2">Sign In</Text>
            <Feather name="arrow-right" size={20} color="#1A3673" />
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text className="text-[#FFB300] font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
