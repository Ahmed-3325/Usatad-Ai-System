import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import MapView, { Marker } from 'react-native-maps';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';

// IMPORTANT: Replace with your actual backend URL for Expo Go
const API_URL = "https://ustad-ai-orchestrator-404848705226.us-central1.run.app";

export default function ChatScreen({ route, navigation }) {
  const { language, t } = useLanguage();
  const initialContext = route.params?.initialContext || '';
  const scrollViewRef = useRef();

  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: t('ai_intro') }
  ]);
  const [inputText, setInputText] = useState(initialContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const QUICK_CHIPS = [
    { label: '❄️ Emergency AC', text: 'Mera AC cooling nahi kar raha, emergency repair chahiye.' },
    { label: '🚰 Plumber', text: 'Kitchen ka pipe leak kar raha hai.' },
    { label: '🧹 Deep Clean', text: 'Ghar ki deep cleaning karwani hai.' }
  ];

  // Hacker UI State
  const [showDevOverlay, setShowDevOverlay] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [currentProviderId, setCurrentProviderId] = useState(null);
  const [expandedTraceId, setExpandedTraceId] = useState(null);

  const addMessage = (type, text, trace = null, isLifecycleSimulation = false) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), type, text, trace, isLifecycleSimulation }]);
  };

  const handleTraceHireNow = async (msg) => {
    try {
      const provider = msg.trace.trace.matched_provider.raw_data;
      const bookingId = msg.trace.booking_confirmation.booking_id;
      
      setExpandedTraceId(null);

      // Step 1: Immediate confirmation
      addMessage('ai', `✅ Booking Confirmed for ${provider.Name}. WhatsApp simulation sent.`);
      
      // Silent backend call
      axios.post(`${API_URL}/simulate-booking`, {
        booking_id: bookingId,
        provider_id: provider.Provider_ID
      }).catch(e => console.log(e));

      // Step 2: En-Route simulation (2 seconds)
      setTimeout(() => {
        addMessage('ai', `📍 Follow-up: Ustad is En-Route to your location. ETA: 15 mins.`);
        
        // Step 3: Service Completed (another 2 seconds)
        setTimeout(() => {
          addMessage('ai', `🛠️ Service Completed. Please leave your Feedback or click here to Raise a Dispute.`, null, true);
        }, 2000);
      }, 2000);

      const newBooking = {
        id: bookingId,
        service: provider.Profession,
        providerName: provider.Name,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        status: 'En-Route',
        price: `PKR ${msg.trace.booking_confirmation.pricing_summary.estimated_total_pkr}`,
        location: provider.City || 'Your Location'
      };

      const existingHistory = await AsyncStorage.getItem('@ustad_history');
      const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
      await AsyncStorage.setItem('@ustad_history', JSON.stringify([newBooking, ...historyArray]));

    } catch (error) {
      console.log(error);
    }
  };

  const handleTraceCancel = (msg) => {
    setExpandedTraceId(null);
    const pId = msg.trace.trace.matched_provider?.raw_data?.Provider_ID;
    handleSend("No, please cancel this and suggest the next best provider.", pId);
  };

  const handleSend = async (overrideText = null, excludedProviderId = null) => {
    const userMsg = typeof overrideText === 'string' ? overrideText : inputText.trim();
    if (!userMsg) return;

    addMessage('user', userMsg);
    if (typeof overrideText !== 'string') setInputText('');
    setIsLoading(true);

    try {
      const payload = { message: userMsg, language: language };
      if (excludedProviderId) payload.excluded_provider_id = excludedProviderId;

      const response = await axios.post(`${API_URL}/orchestrate`, payload);
      const data = response.data;

      if (data.status === "CLARIFICATION_REQUIRED") {
        addMessage('ai', data.message);
      } else {
        setCurrentBookingId(data.booking_confirmation.booking_id);
        setCurrentProviderId(data.booking_confirmation.provider_details.provider_id);

        addMessage('ai', data.message, data);
      }
    } catch (error) {
      console.log(error);
      addMessage('ai', "Maazrat, I couldn't reach the server right now. Ensure your API_URL in ChatScreen is set to your computer's local IP address.");
    } finally {
      setIsLoading(false);
    }
  };

  const simulateBooking = async () => {
    if (!currentBookingId) return alert("No active booking");
    try {
      await axios.post(`${API_URL}/simulate-booking`, { booking_id: currentBookingId, provider_id: currentProviderId });
      addMessage('ai', "✅ Simulation: WhatsApp notification sent & Calendar blocked.");
    } catch (e) { }
  };

  const simulateEnRoute = async () => {
    if (!currentBookingId) return;
    try {
      await axios.post(`${API_URL}/service-quality-loop`, { booking_id: currentBookingId, provider_id: currentProviderId, status: "EN_ROUTE" });
      addMessage('ai', "📍 Ustad is En-Route to your location.");
    } catch (e) { }
  };

  const simulateDispute = async () => {
    if (!currentBookingId) return;
    try {
      const res = await axios.post(`${API_URL}/raise-dispute`, { booking_id: currentBookingId, user_id: "demo", issue_type: "NO_SHOW", description: "test" });
      addMessage('ai', `⚠️ Dispute Raised: ${res.data.resolution.message}`);
    } catch (e) { }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#1A3673" />
        </TouchableOpacity>
        <View className="items-center flex-row">
          <View className="w-8 h-8 bg-[#FFB300] rounded-full items-center justify-center mr-2">
            <MaterialCommunityIcons name="robot-outline" size={20} color="#1A3673" />
          </View>
          <View>
            <Text className="font-bold text-[#1A3673] text-lg">Ustad AI Assistant</Text>
            <Text className="text-green-500 text-xs font-semibold">● Online</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowDevOverlay(!showDevOverlay)}>
          <Feather name="terminal" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Dev Overlay */}
      {showDevOverlay && (
        <View className="bg-gray-900 p-4 border-b border-gray-800">
          <Text className="text-green-400 font-mono mb-2 text-xs">{t('dev_hacks')}</Text>
          <View className="flex-row flex-wrap space-x-2">
            <TouchableOpacity onPress={simulateBooking} className="bg-gray-800 px-3 py-2 rounded mb-2 border border-gray-700">
              <Text className="text-gray-300 text-xs">Simulate Dispatch</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={simulateEnRoute} className="bg-gray-800 px-3 py-2 rounded mb-2 border border-gray-700">
              <Text className="text-gray-300 text-xs">Simulate En-Route</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={simulateDispute} className="bg-red-900/30 px-3 py-2 rounded mb-2 border border-red-800">
              <Text className="text-red-400 text-xs">Simulate No-Show (Dispute)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        className="flex-1 bg-gray-50 px-4 py-4"
        contentContainerStyle={Platform.OS === 'web' ? { paddingBottom: 100 } : { paddingBottom: 20 }}
      >
        {messages.map((msg) => (
          <View key={msg.id} className={`mb-4 max-w-[85%] ${msg.type === 'user' ? 'self-end' : 'self-start'}`}>
            <View className={`p-4 ${msg.type === 'user' ? 'bg-gray-200 rounded-t-[20px] rounded-bl-[20px]' : 'bg-[#FFB300] rounded-t-[20px] rounded-br-[20px] shadow-sm'}`}>
              <Text className={`text-base ${msg.type === 'user' ? 'text-gray-800' : 'text-[#1A3673]'}`}>
                {msg.text}
              </Text>
              
              {/* Map UI for En-Route */}
              {msg.isLifecycleSimulation && msg.text.includes('En-Route') && Platform.OS !== 'web' && (
                <View className="mt-3 h-32 rounded-xl overflow-hidden border border-blue-200 shadow-sm">
                  <MapView 
                    style={{ flex: 1 }}
                    initialRegion={{ latitude: 33.6844, longitude: 73.0479, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                  >
                     <Marker coordinate={{ latitude: 33.6844, longitude: 73.0479 }} title="Ustad Location" description="En-Route to your location" />
                  </MapView>
                </View>
              )}

              {/* Feedback and Lottie for Completed */}
              {msg.isLifecycleSimulation && msg.text.includes('Completed') && (
                <View className="mt-2 pt-2 border-t border-yellow-500/30">
                   <View className="h-16 w-16 self-center mb-2">
                     <LottieView 
                        source={{ uri: "https://assets9.lottiefiles.com/packages/lf20_rc5d0f61.json" }} 
                        autoPlay 
                        loop={false} 
                        style={{ width: '100%', height: '100%' }} 
                     />
                   </View>
                   <View className="flex-row space-x-2">
                     <TouchableOpacity className="flex-1 bg-white px-2 py-2 rounded items-center" onPress={() => addMessage('user', 'Feedback: Excellent Service! 5 Stars.')}>
                       <Text className="text-green-700 text-xs font-bold">Leave Feedback</Text>
                     </TouchableOpacity>
                     <TouchableOpacity className="flex-1 bg-red-100 px-2 py-2 rounded items-center border border-red-200" onPress={simulateDispute}>
                       <Text className="text-red-700 text-xs font-bold">Raise a Dispute</Text>
                     </TouchableOpacity>
                   </View>
                </View>
              )}
            </View>

            {/* Trace UI Visualization (Glassmorphism) */}
            {msg.trace && msg.trace.trace && (
              <BlurView intensity={80} tint="light" className="mt-2 p-4 rounded-xl border border-white/60 shadow-sm overflow-hidden w-full bg-white/50">
                <Text className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{t('agentic_trace')}</Text>

                <View className="flex-row space-x-2 mb-2">
                  <View className="flex-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <Text className="text-[10px] text-gray-500 font-bold">{t('confidence')}</Text>
                    <Text className="text-sm font-mono font-bold text-green-600">{(msg.trace.trace.confidence_score * 100).toFixed(0)}%</Text>
                  </View>
                  <View className="flex-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <Text className="text-[10px] text-gray-500 font-bold">{t('match_score')}</Text>
                    <Text className="text-sm font-mono font-bold text-blue-600">{msg.trace.trace.matched_provider?.total_score}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  className="bg-blue-50 p-3 rounded-lg mb-2 border border-blue-100"
                  onPress={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-white rounded-full items-center justify-center mr-3 shadow-sm">
                        <Feather name="check" size={16} color="#1A3673" />
                      </View>
                      <View>
                        <Text className="text-[10px] font-bold text-blue-800 uppercase">{t('selected_ustad')}</Text>
                        <Text className="text-sm font-bold text-[#1A3673]">{msg.trace.booking_confirmation.provider_details.name}</Text>
                      </View>
                    </View>
                    <Feather name={expandedTraceId === msg.id ? "chevron-up" : "chevron-down"} size={16} color="#1A3673" />
                  </View>

                  {expandedTraceId === msg.id && msg.trace.trace.matched_provider && (
                    <View className="mt-3 pt-3 border-t border-blue-100">
                      <View className="flex-row justify-between mb-4 bg-white p-2 rounded shadow-sm">
                        <View className="items-center">
                          <Text className="text-[10px] text-gray-400 font-bold uppercase">Distance</Text>
                          <Text className="text-xs font-bold text-gray-800">{msg.trace.trace.matched_provider.raw_data.Distance_km} km</Text>
                        </View>
                        <View className="items-center">
                          <Text className="text-[10px] text-gray-400 font-bold uppercase">Rating</Text>
                          <Text className="text-xs font-bold text-amber-500">{msg.trace.trace.matched_provider.raw_data.Rating}★</Text>
                        </View>
                        <View className="items-center">
                          <Text className="text-[10px] text-gray-400 font-bold uppercase">Reliable</Text>
                          <Text className="text-xs font-bold text-green-600">{msg.trace.trace.matched_provider.raw_data.Reliability_OnTime_Score}%</Text>
                        </View>
                        <View className="items-center">
                          <Text className="text-[10px] text-gray-400 font-bold uppercase">Skill</Text>
                          <Text className="text-xs font-bold text-blue-600">{msg.trace.trace.matched_provider.raw_data.Complexity_Handling}</Text>
                        </View>
                      </View>
                      <View className="flex-row space-x-2">
                        <TouchableOpacity className="flex-1 bg-white border border-gray-300 py-2 rounded-lg items-center" onPress={() => handleTraceCancel(msg)}>
                          <Text className="text-gray-600 font-bold text-xs">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-green-600 py-2 rounded-lg items-center" onPress={() => handleTraceHireNow(msg)}>
                          <Text className="text-white font-bold text-xs">Confirm Booking</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>

                <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs font-bold text-yellow-800">{t('dynamic_quote')}</Text>
                    <Text className="text-xs font-mono text-yellow-700">x{msg.trace.booking_confirmation.pricing_summary.breakdown.surge_multiplier} {t('surge')}</Text>
                  </View>
                  <Text className="text-lg font-bold text-yellow-900">PKR {msg.trace.booking_confirmation.pricing_summary.estimated_total_pkr}</Text>
                </View>
              </BlurView>
            )}
          </View>
        ))}
        {isLoading && (
          <View className="self-start bg-[#FFB300] p-4 rounded-t-[20px] rounded-br-[20px] shadow-sm mb-4">
            <ActivityIndicator color="#1A3673" size="small" />
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={Platform.OS === 'web' ? {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          zIndex: 9999,
          borderTopWidth: 1,
          borderColor: '#e5e7eb'
        } : {}}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white px-4 py-2 border-t border-gray-100 max-h-14">
          {QUICK_CHIPS.map((chip, index) => (
            <TouchableOpacity 
              key={index} 
              className="bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mr-2"
              onPress={() => setInputText(chip.text)}
            >
              <Text className="text-[#1A3673] font-semibold text-xs">{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="p-4 bg-white border-t border-gray-100 flex-row items-center">
          <TouchableOpacity className="mr-2 p-2">
            <Feather name="paperclip" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-base outline-none"
            placeholder={t('type_issue')}
            value={inputText}
            onChangeText={setInputText}
            multiline
            style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}}
          />
          <TouchableOpacity
            className={`ml-2 w-12 h-12 rounded-full items-center justify-center ${inputText.trim() ? 'bg-[#FFB300]' : (isListening ? 'bg-red-500' : 'bg-gray-200')}`}
            onPress={() => {
              if (inputText.trim()) {
                handleSend(null, null);
              } else {
                setIsListening(true);
                setTimeout(() => {
                   setIsListening(false);
                   setInputText('Mere kitchen ka pipe leak kar raha hai plumber bhejein.');
                }, 1500);
              }
            }}
          >
            {inputText.trim() ? (
              <Feather name="arrow-up" size={24} color="#1A3673" />
            ) : (
              <Feather name="mic" size={20} color={isListening ? 'white' : '#6B7280'} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
