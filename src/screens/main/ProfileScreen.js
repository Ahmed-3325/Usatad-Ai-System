import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useFirebase } from '../../context/FirebaseProvider';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileScreen({ navigation }) {
  const { auth, db, user } = useFirebase();
  const { language, toggleLanguage, t } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [profileLocation, setProfileLocation] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            if (userDoc.data().location) {
              setProfileLocation(userDoc.data().location);
            }
          } else {
            setUserData({ name: user.displayName || user.email?.split('@')[0] || 'User' });
          }
        } catch (e) {
          console.log("Error fetching profile", e);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // BYPASS FIREBASE STATE WAIT FOR DEMO
      navigation.replace('SplashScreen'); // Or wherever they should go
    } catch (e) {
      console.log(e);
    }
  }

  const ProfileItem = ({ icon, label, value }) => (
    <View className="flex-row items-center bg-white p-4 rounded-2xl shadow-sm mb-3 border border-gray-100">
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
        <Feather name={icon} size={18} color="#1A3673" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</Text>
        <Text className="text-gray-800 text-base font-semibold">{value || 'Loading...'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-8 pb-4">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-3xl font-bold text-[#1A3673]">{t('profile_title')}</Text>
          <TouchableOpacity onPress={toggleLanguage} className="h-10 px-3 rounded-full bg-gray-100 items-center justify-center border border-gray-200">
             <Text className="text-[#1A3673] font-bold text-xs">{language === 'en' ? 'EN / اردو' : 'اردو / EN'}</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center mb-10">
          <View className="w-24 h-24 bg-[#FFB300] rounded-full justify-center items-center mb-4 border-4 border-white shadow-md">
             <Text className="text-4xl text-[#1A3673] font-bold">{userData?.name ? userData.name.charAt(0) : 'U'}</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800">{userData?.name || 'Loading...'}</Text>
          <Text className="text-gray-500">{user?.email}</Text>
        </View>

        <View className="mb-8">
          <ProfileItem icon="map-pin" label={t('city_location')} value={profileLocation || 'Location not set'} />
          <ProfileItem icon="mail" label={t('email_address')} value={user?.email} />
          <ProfileItem icon="shield" label={t('account_status')} value={t('verified_customer')} />
        </View>

        <TouchableOpacity 
          onPress={handleLogout} 
          className="bg-white border border-red-200 p-4 rounded-2xl flex-row justify-center items-center shadow-sm"
        >
          <Feather name="log-out" size={20} color="#EF4444" className="mr-2" />
          <Text className="text-red-500 font-bold text-lg ml-2">{t('logout')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
