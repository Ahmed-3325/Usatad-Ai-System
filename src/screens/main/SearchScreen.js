import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import providersData from '../../providers.json';

export default function SearchScreen({ navigation }) {
  const { language, toggleLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter logic
  const filteredProviders = providersData.filter(provider => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    
    const nameMatch = provider.Name?.toLowerCase().includes(query);
    const professionMatch = provider.Profession?.toLowerCase().includes(query);
    const skillMatch = provider.Skill_Specialization?.toLowerCase().includes(query);
    
    return nameMatch || professionMatch || skillMatch;
  });

  const renderProvider = ({ item }) => (
    <TouchableOpacity 
      className="bg-white p-4 rounded-2xl flex-row items-center mb-3 shadow-sm border border-gray-100"
      onPress={() => navigation.navigate('ProviderDetail', { provider: item })}
    >
      <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center mr-4">
        <Feather name="user" size={24} color="#1A3673" />
        {item.Availability_Status === "Available" && (
           <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>
      <View className="flex-1">
        <Text className="font-bold text-[#1A3673] text-lg">{item.Name}</Text>
        <Text className="text-gray-500 text-sm">{item.Profession} • {item.Skill_Specialization}</Text>
      </View>
      <View className="items-end">
        <View className="flex-row items-center mb-1 bg-orange-50 px-2 py-1 rounded">
          <Feather name="star" size={12} color="#F59E0B" />
          <Text className="text-orange-600 font-bold ml-1 text-xs">{item.Rating}</Text>
        </View>
        <Text className="text-gray-400 text-xs font-semibold">{item.Base_Price_PKR} PKR/hr</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-6 pb-4 bg-white shadow-sm border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-[#1A3673]">{t('search_title')}</Text>
          <TouchableOpacity onPress={toggleLanguage} className="h-10 px-3 rounded-full bg-gray-100 items-center justify-center border border-gray-200">
             <Text className="text-[#1A3673] font-bold text-xs">{language === 'en' ? 'EN / اردو' : 'اردو / EN'}</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-800 text-base"
            placeholder={t('search_input')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-1 px-6 pt-4">
        {!searchQuery.trim() ? (
          <View className="flex-1 items-center justify-center pb-20">
             <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Feather name="search" size={32} color="#9CA3AF" />
             </View>
             <Text className="text-gray-500 text-base text-center">{t('search_empty')}</Text>
          </View>
        ) : filteredProviders.length === 0 ? (
          <View className="flex-1 items-center justify-center pb-20">
             <Text className="text-gray-500 text-base">No Ustads found matching "{searchQuery}"</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProviders}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderProvider}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
