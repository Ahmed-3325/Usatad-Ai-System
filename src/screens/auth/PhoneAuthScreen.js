import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useFirebase } from '../../context/FirebaseProvider';

export default function PhoneAuthScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const { auth } = useFirebase();

  const handleSendOTP = async () => {
    // NOTE: Implementing Phone Auth via the JS SDK in Expo Go requires 
    // integrating 'expo-firebase-recaptcha' or rendering a hidden WebView.
    // Ensure you link the RecaptchaVerifier instance here.
    Alert.alert('Info', 'To send SMS in Expo Go, you must wire up the expo-firebase-recaptcha component.');
  };

  const handleVerifyOTP = async () => {
    try {
      if (confirmResult) {
        await confirmResult.confirm(verificationCode);
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid Verification Code');
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-gray-800 mb-2">Phone Login</Text>
      <Text className="text-gray-500 mb-8">We will send you an OTP to verify your number.</Text>

      {!confirmResult ? (
        <>
          <TextInput
            placeholder="Phone Number (e.g. +923001234567)"
            className="w-full bg-gray-100 p-4 rounded-xl mb-6"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity 
            className="w-full bg-green-500 p-4 rounded-xl"
            onPress={handleSendOTP}
          >
            <Text className="text-white text-center font-semibold text-lg">Send OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            placeholder="Enter 6-digit OTP"
            className="w-full bg-gray-100 p-4 rounded-xl mb-6"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
          />
          <TouchableOpacity 
            className="w-full bg-blue-600 p-4 rounded-xl"
            onPress={handleVerifyOTP}
          >
            <Text className="text-white text-center font-semibold text-lg">Verify OTP</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
