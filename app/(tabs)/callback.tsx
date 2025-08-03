import { refreshTokens } from '@/hooks/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from "react-native";

export default function Callback() {
  let { error, code, state, auth_state } = useLocalSearchParams();
  const [status, setStatus] = useState('Processing authentication...');
  
  useEffect(() => {
    const handleAuth = async () => {
      if (error || !code || (!state && !auth_state)) {
        setStatus(`Authentication failed: ${error}`);
        return;
      }
      if (auth_state) {
        state = auth_state
      }

      let platform
      try {
        const decoded = JSON.parse(atob(state as string));
        platform = decoded.platform;
      } catch (e) {
        setStatus('Failed to decode state parameter.');
        return;
      }

      const tokenData = await refreshTokens(platform, code as string, undefined);

      await AsyncStorage.setItem(`${platform}TokenData`, JSON.stringify(tokenData));

      setStatus('Authentication successful! Redirecting...');

      setTimeout(() => {
        window.close()
      }, 1000);
    };

    handleAuth();
  }, [error, code]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <ActivityIndicator size="large" color="#1DB954" />
      <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color:'white' }}>
        {status}
      </Text>
    </View>
  );
}