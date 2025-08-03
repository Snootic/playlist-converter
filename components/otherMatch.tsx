import { Match } from '@types';
import Button from "@/components/button";
import { Colors } from "@/constants/Colors";
import {
  ColorSchemeName,
  Dimensions,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewProps
} from "react-native";

type MatchProps = Match & ViewProps & {}

export default function OtherMatch({ thumbnailUrl, title, url, totalScore, scoreDetails, style }: MatchProps) {
  const colorScheme = useColorScheme()
  const styles = getStyles(colorScheme)

  return (
    <View style={[styles.matchesContainer, style]}>
      <View style={[styles.row]}>
        <TouchableOpacity style={styles.matchThumbnail}>
          <Image
            style={styles.thumbnailImage}
            source={{ uri: thumbnailUrl ?? "" }}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View style={styles.matchInfo}>
          <TouchableOpacity onPress={() => url && Linking.openURL(url)}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {title || "Unknown Title"}
            </Text>
          </TouchableOpacity>

          {scoreDetails && (
            <Text style={[styles.infoText, styles.textSubtle]}>
              Score: {totalScore}
            </Text>
          )}
          <View style={styles.buttonsContainer}>
            <Button
              variant="secondary"
              icon={require('@/assets/images/usematch.png')}
              iconColor={Colors[colorScheme ?? 'dark'].text}
              title="Use This"
              event={() => null }
            />
          </View>
        </View>
      </View>
    </View>
  )
}

function getStyles(colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    matchesContainer: {
      position: 'relative',
      width: '98%',
      alignSelf: 'center',
      borderRadius: 4,
      borderTopEndRadius: 0,
      borderTopStartRadius: 0,
      backgroundColor: Colors[colorScheme ?? 'dark'].containerBackgroundLight,
      paddingTop: 10,
      marginTop: -5,
      justifyContent: 'space-between',
      elevation: 20,
      ...(Platform.OS === 'web' ? { boxShadow: '4px 8px 20px rgba(0, 0, 0, 0.32)' } : {}),
      maxHeight: 140,
    },
    matchThumbnail: {
      height: '100%',
      width: '25%',
      aspectRatio: Dimensions.get("window").width > 600 ? 1.5 : 1.3,
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: '#222',
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnailImage: {
      width: '100%',
      height: '100%',
      borderRadius: 4,
    },
    matchInfo: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
    },
    buttonsContainer: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      padding: 15,
      alignSelf: 'flex-end',
      maxWidth: '60%'
    },
    title: {
      fontSize: 20,
      color: Colors[colorScheme ?? 'dark'].text,
      fontWeight: 'bold',
      textDecorationLine: 'underline',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 16,
      flexWrap: 'wrap',
      color: Colors[colorScheme ?? 'dark'].text
    },
    textSubtle: {
      color: Colors[colorScheme ?? 'dark'].textSubtle
    },
    url: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].textSuccess,
      textDecorationLine: 'underline'
    }
  })
}