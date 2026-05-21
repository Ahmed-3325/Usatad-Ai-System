import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function ActiveJobTracker({ job, onComplete, onDispute }) {
  if (!job) return null;

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 my-4">
      {/* Header Info */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-slate-900 font-bold text-lg">{job.serviceName}</Text>
          <Text className="text-slate-500 text-sm">Provider: {job.providerName}</Text>
        </View>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-800 text-xs font-bold uppercase tracking-wider">{job.status}</Text>
        </View>
      </View>

      {/* Visual Timeline */}
      <View className="flex-row items-center justify-between mb-6 relative">
        {/* Line behind the steps */}
        <View className="absolute top-3 left-6 right-6 h-1 bg-slate-100" />
        <View 
          className="absolute top-3 left-6 h-1 bg-emerald-500" 
          style={{ width: job.status === 'ARRIVED' ? '50%' : (job.status === 'COMPLETED' ? '100%' : '0%') }} 
        />

        {/* Step 1: En Route */}
        <View className="items-center z-10 bg-white px-2">
          <View className={`w-6 h-6 rounded-full items-center justify-center mb-1 ${job.status === 'EN_ROUTE' || job.status === 'ARRIVED' || job.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
            <Text className="text-white text-xs">✓</Text>
          </View>
          <Text className="text-xs text-slate-600 font-medium">En Route</Text>
        </View>

        {/* Step 2: Arrived */}
        <View className="items-center z-10 bg-white px-2">
          <View className={`w-6 h-6 rounded-full items-center justify-center mb-1 ${job.status === 'ARRIVED' || job.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
            <Text className="text-white text-xs">{job.status === 'ARRIVED' || job.status === 'COMPLETED' ? '✓' : '2'}</Text>
          </View>
          <Text className="text-xs text-slate-600 font-medium">Arrived</Text>
        </View>

        {/* Step 3: Done */}
        <View className="items-center z-10 bg-white px-2">
          <View className={`w-6 h-6 rounded-full items-center justify-center mb-1 ${job.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
            <Text className="text-white text-xs">{job.status === 'COMPLETED' ? '✓' : '3'}</Text>
          </View>
          <Text className="text-xs text-slate-600 font-medium">Done</Text>
        </View>
      </View>

      {/* ETA and Price Info */}
      <View className="bg-slate-50 p-3 rounded-xl mb-4 flex-row justify-between">
        <View>
          <Text className="text-slate-500 text-xs">Arrival Time</Text>
          <Text className="text-slate-900 font-semibold">{job.eta}</Text>
        </View>
        <View className="items-end">
          <Text className="text-slate-500 text-xs">Est. Total</Text>
          <Text className="text-slate-900 font-semibold">Rs. {job.estimatedPrice}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-3">
        {/* Dispute Button */}
        <Pressable 
          onPress={onDispute}
          className={({ pressed }) => `
            flex-1 bg-white border border-rose-200 rounded-xl py-3 items-center justify-center
            ${pressed ? 'opacity-70 scale-95 bg-rose-50' : 'opacity-100 scale-100'}
          `}
        >
          <Text className="text-rose-600 font-bold text-sm">Report Issue</Text>
        </Pressable>

        {/* Complete Button */}
        <Pressable 
          onPress={onComplete}
          className={({ pressed }) => `
            flex-1 bg-emerald-500 rounded-xl py-3 items-center justify-center shadow-sm
            ${pressed ? 'opacity-80 scale-95' : 'opacity-100 scale-100'}
          `}
        >
          <Text className="text-white font-bold text-sm">Complete & Rate</Text>
        </Pressable>
      </View>
    </View>
  );
}
