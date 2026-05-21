import React from 'react';
import { View, Text, Pressable } from 'react-native';

export default function ProviderCard({ provider, onPress }) {
  if (!provider) return null;

  return (
    <Pressable 
      onPress={onPress}
      className={({ pressed }) => `
        bg-white rounded-2xl p-4 my-2 border border-slate-200 shadow-sm w-64
        ${pressed ? 'opacity-90 scale-95 bg-slate-50' : 'opacity-100 scale-100'}
      `}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-slate-900 font-bold text-lg">{provider.name}</Text>
          <Text className="text-slate-500 text-sm">{provider.category}</Text>
        </View>
        <View className="bg-emerald-100 px-2 py-1 rounded-md flex-row items-center">
          <Text className="text-emerald-700 text-xs font-bold mr-1">Trust:</Text>
          <Text className="text-emerald-800 text-xs font-black">{provider.reliability_score}/100</Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <Text className="text-amber-400 text-sm mr-1">★</Text>
        <Text className="text-slate-700 text-sm font-semibold">{provider.rating} / 5</Text>
        <Text className="text-slate-400 text-xs ml-1">({provider.reviews} reviews)</Text>
      </View>

      <View className="bg-blue-50 p-3 rounded-xl flex-row justify-between items-center">
        <Text className="text-blue-900 text-xs font-medium">Est. Price</Text>
        <Text className="text-blue-900 font-bold">Rs. {provider.estimated_price}</Text>
      </View>
      
      <View className="mt-3 bg-blue-900 rounded-lg py-2 items-center">
        <Text className="text-white font-bold text-sm">Book Now</Text>
      </View>
    </Pressable>
  );
}
