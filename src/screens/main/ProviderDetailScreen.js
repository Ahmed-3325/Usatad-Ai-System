import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

export default function ProviderDetailScreen({ route, navigation }) {
  const { provider } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header Profile Section */}
        <View className="bg-white rounded-b-[40px] pt-8 pb-10 px-6 shadow-sm border-b border-gray-100 items-center">
          <View className="flex-row w-full justify-between items-start absolute top-6 left-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
               <Feather name="arrow-left" size={24} color="#1A3673" />
            </TouchableOpacity>
          </View>
          
          <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm mt-8">
            <Feather name="user" size={40} color="#9CA3AF" />
            {provider.Availability_Status === 'Available' && (
              <View className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white" />
            )}
          </View>
          
          <Text className="text-2xl font-bold text-[#1A3673]">{provider.Name}</Text>
          <Text className="text-gray-500 text-base mt-1">{provider.Profession} • {provider.Skill_Specialization}</Text>
          
          <View className="flex-row items-center mt-4 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
            <Feather name="star" size={14} color="#F59E0B" />
            <Text className="text-orange-700 font-bold ml-2">{provider.Rating} <Text className="font-normal text-orange-600/70">({provider.Review_Recency} Reviews)</Text></Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <View className="flex-row justify-between px-6 mt-6">
           <View className="bg-white p-4 rounded-2xl w-[31%] items-center shadow-sm border border-gray-100">
              <FontAwesome5 name="medal" size={20} color="#3B82F6" className="mb-2" />
              <Text className="text-sm font-bold text-[#1A3673] mt-2">{provider.Complexity_Handling}</Text>
              <Text className="text-[10px] text-gray-400 text-center uppercase tracking-widest mt-1">Tier</Text>
           </View>
           <View className="bg-white p-4 rounded-2xl w-[31%] items-center shadow-sm border border-gray-100">
              <Feather name="clock" size={20} color="#10B981" className="mb-2" />
              <Text className="text-sm font-bold text-[#1A3673] mt-2">{provider.Reliability_OnTime_Score}%</Text>
              <Text className="text-[10px] text-gray-400 text-center uppercase tracking-widest mt-1">On-Time</Text>
           </View>
           <View className="bg-white p-4 rounded-2xl w-[31%] items-center shadow-sm border border-gray-100">
              <Feather name="map-pin" size={20} color="#EF4444" className="mb-2" />
              <Text className="text-sm font-bold text-[#1A3673] mt-2">{provider.Distance_km} km</Text>
              <Text className="text-[10px] text-gray-400 text-center uppercase tracking-widest mt-1">Distance</Text>
           </View>
        </View>

        {/* Pricing Info */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-[#1A3673] mb-3">Service Details</Text>
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
             <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                   <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                      <Feather name="dollar-sign" size={16} color="#3B82F6" />
                   </View>
                   <Text className="text-gray-600 font-semibold">Base Rate</Text>
                </View>
                <Text className="text-[#1A3673] font-bold">{provider.Base_Price_PKR} PKR/hr</Text>
             </View>
             
             <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                   <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mr-3">
                      <Feather name="alert-triangle" size={16} color="#F59E0B" />
                   </View>
                   <Text className="text-gray-600 font-semibold">Cancellation Risk</Text>
                </View>
                <Text className="text-[#1A3673] font-bold">{provider.Cancellation_Risk}%</Text>
             </View>
             
             <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                   <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-3">
                      <Feather name="navigation" size={16} color="#10B981" />
                   </View>
                   <Text className="text-gray-600 font-semibold">Est. Travel Time</Text>
                </View>
                <Text className="text-[#1A3673] font-bold">{provider.Travel_Time_mins} mins</Text>
             </View>
          </View>
        </View>

        {/* CTA Button */}
        <View className="px-6 mt-8">
          <TouchableOpacity 
            className="w-full bg-[#FFB300] py-4 rounded-xl flex-row justify-center items-center shadow-md"
            onPress={() => navigation.navigate('Chat', { initialContext: `I would like to hire ${provider.Name} for ${provider.Skill_Specialization}.` })}
          >
            <Text className="text-[#1A3673] text-lg font-bold mr-2">Hire Ustad Now</Text>
            <Feather name="arrow-right" size={20} color="#1A3673" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
