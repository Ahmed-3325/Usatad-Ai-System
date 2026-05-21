import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import providersData from '../../providers.json';

const API_URL = "https://ustad-ai-orchestrator-404848705226.us-central1.run.app";

export default function FilteredUstadsScreen({ route, navigation }) {
  const { category, title } = route.params;
  const displayTitle = title || category;
  const [loadingProvider, setLoadingProvider] = useState(null);

  const displayProviders = useMemo(() => {
    if (!category) return [];
    const searchCat = category.toLowerCase().trim();

    return providersData.filter(p => {
      const prof = (p.Profession || '').toLowerCase().trim();
      const service = (p.Service_Type || '').toLowerCase().trim();
      const matchString = `${prof} ${service}`;

      if (searchCat === 'ac' || searchCat === 'ac_repair' || searchCat === 'ac repair') {
        return matchString.includes('electrician') || matchString.includes('ac') || matchString.includes('repair') || matchString.includes('hvac');
      }
      if (searchCat === 'plumber') {
        return matchString.includes('plumber') || matchString.includes('plumbing');
      }
      if (searchCat === 'electrician') {
        return matchString.includes('electrician');
      }
      if (searchCat === 'painter') {
        return matchString.includes('painter') || matchString.includes('painting');
      }
      if (searchCat === 'carpenter') {
        return matchString.includes('carpenter') || matchString.includes('woodwork');
      }
      if (searchCat === 'clean' || searchCat === 'home_clean' || searchCat === 'home clean') {
        return matchString.includes('cleaner') || matchString.includes('cleaning') || matchString.includes('maid');
      }

      return prof === searchCat || service === searchCat || matchString.includes(searchCat);
    });
  }, [category]);

  const handleHireNow = async (provider) => {
    setLoadingProvider(provider.Provider_ID);
    try {
      const bookingId = `BK-${Math.floor(Math.random() * 100000)}`;
      
      await axios.post(`${API_URL}/simulate-booking`, {
        booking_id: bookingId,
        provider_id: provider.Provider_ID
      });

      const newBooking = {
        id: bookingId,
        service: provider.Profession,
        providerName: provider.Name,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        status: 'En-Route',
        price: `${provider.Base_Price_PKR || 1500} PKR`,
        location: provider.City || 'Your Location'
      };

      const existingHistory = await AsyncStorage.getItem('@ustad_history');
      const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
      await AsyncStorage.setItem('@ustad_history', JSON.stringify([newBooking, ...historyArray]));

      Alert.alert(
        "Booking Confirmed!", 
        `Ustad ${provider.Name} is en-route. WhatsApp notification sent!`,
        [
          { text: "View Bookings", onPress: () => navigation.navigate('History') },
          { text: "OK", style: "cancel" }
        ]
      );
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to confirm booking. Please try again.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100"
      onPress={() => navigation.navigate('ProviderDetail', { provider: item })}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3 border border-gray-200">
            <Feather name="user" size={24} color="#6B7280" />
            <View className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${item.Availability_Status === 'Offline' ? 'bg-gray-400' : 'bg-green-500'}`} />
          </View>
          <View>
            <Text className="font-bold text-[#1A3673] text-base">{item.Name}</Text>
            <Text className="text-gray-500 text-xs">{item.Profession}</Text>
          </View>
        </View>
        <View className="bg-blue-50 px-2 py-1 rounded">
          <Text className="text-[#1A3673] font-bold text-xs">Rs. {item.Base_Price_PKR || '1500'}</Text>
        </View>
      </View>

      <View className="flex-row justify-between bg-gray-50 p-3 rounded-xl mb-3">
        <View className="items-center">
          <View className="flex-row items-center mb-1">
            <Feather name="star" size={12} color="#F59E0B" />
            <Text className="text-gray-800 font-bold ml-1 text-xs">{item.Rating}</Text>
          </View>
          <Text className="text-gray-400 text-[10px] uppercase font-bold">Rating</Text>
        </View>
        <View className="w-[1px] bg-gray-200" />
        <View className="items-center">
          <View className="flex-row items-center mb-1">
            <Feather name="map-pin" size={12} color="#10B981" />
            <Text className="text-gray-800 font-bold ml-1 text-xs">{item.Distance_km || '2.5'} km</Text>
          </View>
          <Text className="text-gray-400 text-[10px] uppercase font-bold">Distance</Text>
        </View>
        <View className="w-[1px] bg-gray-200" />
        <View className="items-center">
          <View className="flex-row items-center mb-1">
            <MaterialCommunityIcons name="shield-check" size={12} color="#3B82F6" />
            <Text className="text-gray-800 font-bold ml-1 text-xs">{item.Reliability_OnTime_Score || 90}%</Text>
          </View>
          <Text className="text-gray-400 text-[10px] uppercase font-bold">Reliable</Text>
        </View>
      </View>

      <TouchableOpacity 
        className="bg-[#1A3673] py-3 rounded-xl items-center flex-row justify-center"
        onPress={() => handleHireNow(item)}
        disabled={loadingProvider === item.Provider_ID}
      >
        {loadingProvider === item.Provider_ID ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Feather name="briefcase" size={16} color="white" />
            <Text className="text-white font-bold ml-2">Hire Now</Text>
          </>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#1A3673" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#1A3673]">{displayTitle} Near You</Text>
      </View>

      <FlatList
        data={displayProviders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Feather name="search" size={48} color="#D1D5DB" className="mb-4" />
            <Text className="text-gray-500 text-base text-center mt-4">
              No specific matching ustads found for "{displayTitle}" at the moment.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
