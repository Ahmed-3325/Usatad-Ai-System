import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const mockBookings = [
  {
    id: 'BK-100293',
    service: 'AC Technician',
    providerName: 'Ahmad Hassan',
    date: 'Oct 24, 2026',
    time: '2:30 PM',
    status: 'En-Route',
    price: '1,500 PKR',
    location: 'G-13, Islamabad'
  },
  {
    id: 'BK-100292',
    service: 'Electrician',
    providerName: 'Rashid Mahmood',
    date: 'Oct 21, 2026',
    time: '10:00 AM',
    status: 'Completed',
    price: '3,400 PKR',
    location: 'G-13, Islamabad'
  },
  {
    id: 'BK-100289',
    service: 'Plumber',
    providerName: 'Sajid Ali',
    date: 'Oct 15, 2026',
    time: '4:15 PM',
    status: 'Cancelled',
    price: '0 PKR',
    location: 'F-11, Islamabad'
  }
];

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadHistory = async () => {
        try {
          const existingHistory = await AsyncStorage.getItem('@ustad_history');
          if (existingHistory) {
            setHistory(JSON.parse(existingHistory));
          } else {
            setHistory(mockBookings);
          }
        } catch (e) {
          setHistory(mockBookings);
        }
      };
      loadHistory();
    }, [])
  );
  const getStatusBadge = (status) => {
    switch (status) {
      case 'En-Route':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 border-red-200 text-red-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'En-Route':
        return <MaterialCommunityIcons name="truck-fast-outline" size={14} color="#B45309" />;
      case 'Completed':
        return <Feather name="check-circle" size={14} color="#15803D" />;
      case 'Cancelled':
        return <Feather name="x-circle" size={14} color="#B91C1C" />;
      default:
        return null;
    }
  };

  const renderBooking = ({ item }) => (
    <View className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-xs font-bold text-gray-400 mb-1">BOOKING #{item.id}</Text>
          <Text className="text-lg font-bold text-[#1A3673]">{item.service}</Text>
        </View>
        <View className={`px-2 py-1 rounded border flex-row items-center space-x-1 ${getStatusBadge(item.status)}`}>
           {getStatusIcon(item.status)}
           <Text className={`text-xs font-bold ${getStatusBadge(item.status).split(' ')[2]}`}>{item.status}</Text>
        </View>
      </View>

      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
          <Feather name="user" size={18} color="#6B7280" />
        </View>
        <View>
          <Text className="text-sm font-semibold text-gray-800">Ustad {item.providerName}</Text>
          <Text className="text-xs text-gray-500">{item.date} • {item.time}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
         <View className="flex-row items-center">
            <Feather name="map-pin" size={12} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1">{item.location}</Text>
         </View>
         <Text className="text-sm font-bold text-[#1A3673]">{item.price}</Text>
      </View>

      {item.status === 'En-Route' && (
        <TouchableOpacity 
          className="mt-4 bg-[#FFB300] py-3 rounded-xl items-center justify-center shadow-sm flex-row"
          onPress={() => navigation.navigate('Chat', { initialContext: `Where are you Ustad ${item.providerName}?` })}
        >
          <Feather name="message-circle" size={16} color="#1A3673" />
          <Text className="text-[#1A3673] font-bold ml-2">Message Ustad</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-6 pb-2 bg-white shadow-sm border-b border-gray-100">
        <Text className="text-2xl font-bold text-[#1A3673] mb-4">My Bookings</Text>
        <View className="flex-row space-x-4 mb-2">
          <TouchableOpacity className="pb-2 border-b-2 border-[#1A3673]">
            <Text className="font-bold text-[#1A3673]">Active</Text>
          </TouchableOpacity>
          <TouchableOpacity className="pb-2">
            <Text className="font-semibold text-gray-400">Past Bookings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
