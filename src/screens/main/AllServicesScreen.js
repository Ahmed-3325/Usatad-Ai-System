import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

export default function AllServicesScreen({ navigation }) {
  const { t } = useLanguage();

  const services = [
    { id: 1, name: t('ac_repair') || 'AC Repair', bg: 'bg-blue-500', icon: 'snowflake' },
    { id: 2, name: t('plumber') || 'Plumber', bg: 'bg-indigo-600', icon: 'water-outline' },
    { id: 3, name: t('electrician') || 'Electrician', bg: 'bg-orange-500', icon: 'lightning-bolt' },
    { id: 4, name: t('painter') || 'Painter', bg: 'bg-purple-500', icon: 'palette' },
    { id: 5, name: t('carpenter') || 'Carpenter', bg: 'bg-amber-600', icon: 'hammer' },
    { id: 6, name: t('home_clean') || 'Home Clean', bg: 'bg-emerald-500', icon: 'home-outline' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="arrow-left" size={24} color="#1A3673" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#1A3673]">All Services</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="flex-row flex-wrap justify-between">
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              className="w-[48%] bg-white rounded-2xl p-4 mb-4 items-center shadow-sm border border-gray-100"
              onPress={() => navigation.navigate('Search', { category: service.name })}
            >
              <View className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${service.bg}`}>
                <MaterialCommunityIcons name={service.icon} size={32} color="white" />
              </View>
              <Text className="text-gray-800 font-semibold text-center">{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
