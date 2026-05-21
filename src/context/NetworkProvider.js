import React, { createContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { MaterialIcons } from '@expo/vector-icons';

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected !== false); // Default to true if null
    });
    return () => unsubscribe();
  }, []);

  const handleRetry = () => {
    NetInfo.fetch().then(state => setIsConnected(state.isConnected !== false));
  };

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
      <Modal visible={!isConnected} animationType="slide" transparent={false}>
        <View className="flex-1 justify-center items-center bg-[#1A3673] px-6">
          <MaterialIcons name="wifi-off" size={80} color="white" />
          <Text className="text-white text-2xl font-bold mt-6 text-center">No Internet Connection</Text>
          <Text className="text-gray-300 text-center mt-2 mb-8 text-base">
            Apologies, Ustad AI requires an active internet connection to find and book providers.
          </Text>
          <TouchableOpacity 
            className="bg-[#FFB300] w-full p-4 rounded-xl shadow-md"
            onPress={handleRetry}
          >
            <Text className="text-[#1A3673] text-center font-bold text-lg">Retry Connection</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </NetworkContext.Provider>
  );
};
