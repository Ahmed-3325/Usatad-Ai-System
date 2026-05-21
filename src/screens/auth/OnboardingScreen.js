import React from 'react';
import { View, Text, Pressable, SafeAreaView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function OnboardingScreen({ navigation }) {
  return (
    <View className="flex-1 bg-[#1A3673]">
      {/* Top Section - Blue Background */}
      <SafeAreaView className="flex-1 justify-center items-center pt-8">
        <View className="bg-white p-4 rounded-3xl shadow-lg mb-4">
          <MaterialCommunityIcons name="tools" size={42} color="#1A3673" />
        </View>
        <Text className="text-white text-4xl font-extrabold tracking-wide">
          Ustad <Text className="text-[#FFB800]">AI</Text>
        </Text>
        <Text className="text-blue-200 text-xs tracking-[0.25em] mt-2 uppercase font-bold">
          Agentic Service Platform
        </Text>
      </SafeAreaView>

      {/* Bottom Section - White Card (Padding aur Margin set kiya hai taake button upar aaye) */}
      <View className="flex-[1.6] bg-white rounded-t-[40px] px-6 pt-10 pb-16 justify-between shadow-2xl">

        <View>
          {/* Trust Badge */}
          <View className="bg-slate-50 rounded-2xl p-4 items-center border border-slate-100 mb-6">
            <MaterialCommunityIcons name="monitor-dashboard" size={38} color="#059669" />
            <Text className="text-[#1A3673] font-extrabold mt-2 text-sm tracking-widest uppercase">Trust & Technology</Text>
          </View>

          {/* Heading (Center aligned for professional look) */}
          <Text className="text-3xl font-black text-[#1A3673] leading-tight text-center">
            Your AI-Powered{'\n'}<Text className="text-[#FFB800]">Ustad</Text> Finder
          </Text>
          <Text className="text-gray-500 mt-4 text-center text-base font-medium px-2">
            Trusted technicians at your doorstep. AI-verified, transparent pricing, zero hassle.
          </Text>

          {/* 3 Features Icons */}
          <View className="flex-row justify-around mt-8">
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-green-50 justify-center items-center border border-green-100 mb-2 shadow-sm">
                <Feather name="shield" size={26} color="#059669" />
              </View>
              <Text className="text-gray-700 font-bold text-xs">Verified</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-amber-50 justify-center items-center border border-amber-100 mb-2 shadow-sm">
                <Feather name="zap" size={26} color="#D97706" />
              </View>
              <Text className="text-gray-700 font-bold text-xs">Instant</Text>
            </View>
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-blue-50 justify-center items-center border border-blue-100 mb-2 shadow-sm">
                <Feather name="star" size={26} color="#2563EB" />
              </View>
              <Text className="text-gray-700 font-bold text-xs">Top Rated</Text>
            </View>
          </View>
        </View>

        {/* CTA Button & Footer (Is block ko margin de kar screen mein upar uthaya hai) */}
        <View className="mt-8 mb-6">
          <Pressable
            onPress={() => navigation.navigate('Login')}
            className={({ pressed }) => `
              bg-[#FFB800] rounded-2xl py-4 flex-row justify-center items-center shadow-lg
              ${pressed ? 'opacity-80 scale-95' : 'opacity-100 scale-100'}
            `}
          >
            <Text className="text-[#1A3673] text-xl font-extrabold mr-2 tracking-wide">Get Started</Text>
            <Feather name="arrow-right" size={24} color="#1A3673" />
          </Pressable>
          <Text className="text-center text-gray-400 text-xs mt-5 font-semibold tracking-wider uppercase">
            Serving Nawabshah & Sindh
          </Text>
        </View>

      </View>
    </View>
  );
}