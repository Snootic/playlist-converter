import Button from "@/components/button";
import { Colors } from "@/constants/Colors";
import { useEffect, useState } from "react";
import { ColorSchemeName, Image, Platform, Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "@/hooks/auth";

export default function Header() {
  const colorScheme = useColorScheme()
  const styles = getStyles(colorScheme)
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);
  const [isYouTubeAuthenticated, setIsYouTubeAuthenticated] = useState(false);

  return (
    <SafeAreaView style={[styles.safeArea, styles.header]}>
      <Pressable >
        <Image
          style={styles.logo}
          resizeMode="contain"
          source={require("@/assets/images/spotitube3.png")}
        />
      </Pressable>
      <View style={styles.buttonGrid}>
        {isSpotifyAuthenticated ? (
          <Button 
            variant="spotify" 
            title={'Logout'} 
            icon={require('@/assets/images/spotify-black-logo.png')} 
            event={() => null}
          />
        ) : (
          <Button 
            variant="spotify" 
            title={'Login'} 
            icon={require('@/assets/images/spotify-black-logo.png')}
            event={() => login('Spotify')}
          />
        )}
        {isYouTubeAuthenticated ? (
          <Button
            variant="youtube"
            title={'Logout'}
            icon={require('@/assets/images/youtube-logo-white.png')}
            event={() => null}
          />
        ): (
          <Button
            variant="youtube"
            title={'Login'}
            icon={require('@/assets/images/youtube-logo-white.png')}
            event={() => login('Youtube')}
          />
        )}
      </View>
    </SafeAreaView>
  )
};

function getStyles(colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    safeArea: {
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    header: {
      width: '100%',
      backgroundColor: Colors[colorScheme ?? 'dark'].containerBackground,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 5,
      paddingBottom: Platform.select({
        android: -35,
        ios: -35,
        default: 10,
      }),
      paddingHorizontal: 10,
      elevation: 20,
      ...(Platform.OS === 'web' ? { boxShadow: '4px 8px 20px rgba(0, 0, 0, 0.32)' } : {}),
    },
    logo: {
      height: 40,
      width: 150
    },
    buttonGrid: {
      flexDirection: 'row',
      gap: 10
    }
  })
}