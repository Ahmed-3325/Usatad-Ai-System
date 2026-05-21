import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useFirebase } from '../../context/FirebaseProvider';
import { doc, getDoc } from 'firebase/firestore';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import providersData from '../../providers.json';

export default function DashboardScreen({ navigation }) {
  const { user, db } = useFirebase();
  const { language, toggleLanguage, t } = useLanguage();
  const [userName, setUserName] = useState('');
  const [location, setLocation] = useState('');
  const [stats, setStats] = useState({ verified: 0, rating: 0, response: 0 });
  const [onlineUstads, setOnlineUstads] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // 1. Fetch user doc from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (userDoc.exists()) {
            setUserName(userDoc.data().name || user.displayName || user.email?.split('@')[0] || 'User');
            if (userDoc.data().location) {
              setLocation(userDoc.data().location);
            }
          } else {
            setUserName(user.displayName || user.email?.split('@')[0] || 'User');
          }
        } catch (e) {
          console.log("Error reading Firestore:", e);
          setUserName(user.displayName || user.email?.split('@')[0] || 'User');
        }
      }
    };

    fetchUserData();
    fetchProviders();
  }, [user]);

  const fetchProviders = () => {
    try {
      const providers = providersData;
      const verified = providers.length;
      const avgRating = providers.reduce((acc, p) => acc + (p.Rating || 4), 0) / (verified || 1);

      setStats({
        verified: verified,
        rating: avgRating.toFixed(1),
        response: 15
      });

      const online = providers.filter(p => p.Availability_Status !== "Offline").slice(0, 5);
      setOnlineUstads(online);

    } catch (error) {
      console.log('Error parsing providers array:', error);
    }
  };

  const ServiceIcon = ({ name, id, icon, bg }) => (
    <TouchableOpacity
      className="items-center w-[30%] mb-4"
      onPress={() => navigation.navigate('FilteredUstads', { category: id, title: name })}
    >
      <View className={`w-16 h-16 rounded-2xl items-center justify-center mb-2 ${bg} shadow-sm`}>
        {icon}
      </View>
      <Text className="text-gray-800 font-semibold text-center text-xs">{name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Deep Blue Header Background (now scrolls with content) */}
        <View className="absolute top-0 left-0 right-0 h-[280px] bg-[#1A3673] rounded-b-[40px]" />

          {/* Header Content */}
          <View className="px-6 pt-6">
            <View className="flex-row justify-between items-center mb-2">
              <View>
                <Text className="text-gray-300 text-sm">{t('greeting')} 🧑‍💻</Text>
                <Text className="text-white text-2xl font-bold">{userName || 'Loading...'}</Text>
              </View>
              <View className="flex-row space-x-3">
                <TouchableOpacity onPress={toggleLanguage} className="h-10 px-3 rounded-full bg-white/20 items-center justify-center border border-white/30">
                  <Text className="text-white font-bold text-xs">{language === 'en' ? 'EN / اردو' : 'اردو / EN'}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-[#FFB300] items-center justify-center shadow-sm">
                  <Text className="text-[#1A3673] font-bold">{userName ? userName.charAt(0) : 'U'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center mb-6">
              <Feather name="map-pin" size={14} color="#FFB300" />
              <Text className="text-[#FFB300] ml-1 text-sm font-semibold">{location || 'Locating...'}</Text>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-[#2B4B8E] rounded-2xl px-4 py-3 mb-8 shadow-sm">
              <Feather name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder={t('search_placeholder') || "Search services..."}
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-white text-base"
              />
              <View className="bg-white/20 px-2 py-1 rounded-md flex-row items-center">
                <MaterialCommunityIcons name="robot-outline" size={14} color="#FFB300" />
                <Text className="text-[#FFB300] text-xs font-bold ml-1">AI</Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-between px-6 mb-8">
            <View className="bg-white p-4 rounded-2xl w-[31%] shadow-sm items-center border border-gray-100">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mb-2">
                <Feather name="shield" size={16} color="#10B981" />
              </View>
              <Text className="text-xl font-bold text-[#1A3673]">{stats.verified}</Text>
              <Text className="text-[10px] text-gray-500 text-center">{t('verified_ustads')}</Text>
            </View>
            <View className="bg-white p-4 rounded-2xl w-[31%] shadow-sm items-center border border-gray-100">
              <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mb-2">
                <Feather name="trending-up" size={16} color="#F59E0B" />
              </View>
              <Text className="text-xl font-bold text-[#1A3673]">{stats.rating}</Text>
              <Text className="text-[10px] text-gray-500 text-center">{t('avg_rating')}</Text>
            </View>
            <View className="bg-white p-4 rounded-2xl w-[31%] shadow-sm items-center border border-gray-100">
              <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mb-2">
                <Feather name="clock" size={16} color="#3B82F6" />
              </View>
              <Text className="text-xl font-bold text-[#1A3673]">{stats.response}m</Text>
              <Text className="text-[10px] text-gray-500 text-center">{t('avg_response')}</Text>
            </View>
          </View>

          {/* Services Section */}
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="text-xl font-bold text-[#1A3673]">{t('services')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AllServices')}>
                <Text className="text-[#D97706] text-sm font-semibold">{t('view_all')}</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap justify-between">
              <ServiceIcon name={t('ac_repair')} id="ac_repair" bg="bg-blue-500" icon={<MaterialCommunityIcons name="snowflake" size={32} color="white" />} />
              <ServiceIcon name={t('plumber')} id="plumber" bg="bg-indigo-600" icon={<MaterialCommunityIcons name="water-outline" size={32} color="white" />} />
              <ServiceIcon name={t('electrician')} id="electrician" bg="bg-orange-500" icon={<MaterialCommunityIcons name="lightning-bolt" size={32} color="white" />} />
              <ServiceIcon name={t('painter')} id="painter" bg="bg-purple-500" icon={<MaterialCommunityIcons name="palette" size={32} color="white" />} />
              <ServiceIcon name={t('carpenter')} id="carpenter" bg="bg-amber-600" icon={<MaterialCommunityIcons name="hammer" size={32} color="white" />} />
              <ServiceIcon name={t('home_clean')} id="home_clean" bg="bg-emerald-500" icon={<MaterialCommunityIcons name="home-outline" size={32} color="white" />} />
            </View>
          </View>

          {/* Ustads Online Now */}
          <View className="px-6">
            <Text className="text-xl font-bold text-[#1A3673] mb-4">{t('online_now')}</Text>
            {onlineUstads.map((p, index) => (
              <TouchableOpacity key={index} className="bg-white p-4 rounded-2xl flex-row items-center mb-3 shadow-sm border border-gray-100" onPress={() => navigation.navigate('ProviderDetail', { provider: p })}>
                <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-4">
                  <Feather name="user" size={24} color="#9CA3AF" />
                  <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-[#1A3673] text-base">{p.Name}</Text>
                  <Text className="text-gray-500 text-xs">{p.Profession} • {p.Complexity_Handling || 'Basic'}</Text>
                </View>
                <View className="items-end">
                  <View className="flex-row items-center mb-1">
                    <Feather name="star" size={12} color="#F59E0B" />
                    <Text className="text-[#1A3673] font-bold ml-1 text-sm">{p.Rating}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs">{p.Distance_km} km</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

      </ScrollView>
    </SafeAreaView>
  );
}