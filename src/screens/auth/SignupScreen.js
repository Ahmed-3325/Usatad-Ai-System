import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirebase } from '../../context/FirebaseProvider';
import { Feather } from '@expo/vector-icons';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { auth, db } = useFirebase();

  const handleSignup = async () => {
    // 1. Inputs Validation
    if (!name.trim() || !location.trim() || !email.trim() || !password) {
      Alert.alert('Required', 'Please fill all fields properly.');
      return;
    }

    setLoading(true);

    try {
      // 2. Firebase Auth - User Creation
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 3. Firestore - Saving User Data
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name.trim(),
        location: location.trim(),
        email: email.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
        authProvider: "password"
      });

      // 4. Success Alert (Navigation only happens after user clicks OK)
      Alert.alert('Success 🎉', 'Registered successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setName(''); setLocation(''); setEmail(''); setPassword('');
            navigation.replace('Login');
          }
        }
      ]);

    } catch (error) {
      console.log("Firebase Error Code:", error.code);

      // 5. User-Friendly Error Handling
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('User Exists', 'User already exists! Login please.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'The email address format is incorrect.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Weak Password', 'Password should be at least 6 characters.');
      } else {
        Alert.alert('Signup Failed', error.message);
      }
    } finally {
      // ✅ YEH LINE SAB SE ZAROORI HAI: Loading har haal mein ruk jayegi
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-[#1A3673]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

        {/* Header Section */}
        <View className="px-6 pt-16 pb-8">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6 w-10 h-10 rounded-xl bg-white/10 items-center justify-center text-white">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold tracking-tight">Create Account</Text>
          <Text className="text-blue-100 text-sm mt-2 font-medium opacity-80">Join Ustad AI Platform • Developed by MARQ</Text>
        </View>

        {/* White Card Section */}
        <View className="flex-1 bg-white rounded-t-[35px] px-6 pt-10 pb-10 shadow-2xl">
          <View className="flex-1">

            <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Full Name</Text>
            <TextInput
              placeholder="e.g. Saim Raza"
              value={name}
              onChangeText={setName}
              className="border border-gray-200 p-4 rounded-2xl mb-5 bg-gray-50 text-gray-800"
            />

            <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">City / Location</Text>
            <TextInput
              placeholder="e.g. Nawabshah, Sindh"
              value={location}
              onChangeText={setLocation}
              className="border border-gray-200 p-4 rounded-2xl mb-5 bg-gray-50 text-gray-800"
            />

            <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Email Address</Text>
            <TextInput
              placeholder="ustad@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-200 p-4 rounded-2xl mb-5 bg-gray-50 text-gray-800"
            />

            <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Password</Text>
            <TextInput
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-200 p-4 rounded-2xl mb-8 bg-gray-50 text-gray-800"
            />

            {/* Submit Button */}
            <TouchableOpacity
              className={`w-full p-4 rounded-2xl flex-row justify-center items-center shadow-lg ${loading ? 'bg-gray-200' : 'bg-[#FFB300]'}`}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#1A3673" />
              ) : (
                <>
                  <Text className="text-[#1A3673] font-black text-lg mr-2">Continue</Text>
                  <Feather name="chevron-right" size={20} color="#1A3673" />
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-500 font-medium">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-[#1A3673] font-bold">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}