import { mapSource } from "@/common/detectSource";
import Button from "@/components/button";
import { Colors } from "@/constants/Colors";
import { useDynamicFlexContainer } from "@/hooks/Dimensions";
import { ConversionResult, SpotifyTrack, YouTubeVideo } from "@types";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ColorSchemeName,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle
} from "react-native";
import OtherMatch from "./otherMatch";

type MatchProps = ConversionResult<SpotifyTrack | YouTubeVideo> & {
  numColumns?: number,
  style?: ViewStyle,
  index?: number,
  shouldAnimate?: boolean,
  onAnimationDone?: () => void
};

export default function BestMatch({ original, bestMatch, matches, numColumns, style, index=0, shouldAnimate = true, onAnimationDone }: MatchProps) {
  const colorScheme = useColorScheme()
  const styles = getStyles(colorScheme)

  const [showOtherMatches, setShowOtherMatches] = React.useState(false);

  const dynamicFlexContainer = useDynamicFlexContainer()

  const source = mapSource(original);

  const slideDownAnim = useRef(new Animated.Value(-50)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shouldAnimate) {
      Animated.parallel([
        Animated.timing(slideDownAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeInAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onAnimationDone && onAnimationDone();
      });
    } else {
      slideDownAnim.setValue(0);
      fadeInAnim.setValue(1);
    }
  }, [shouldAnimate]);

  return (
    <Animated.View style={[{ width: numColumns === 2 ? '49.5%' : '100%', transform: [{ translateY: slideDownAnim }],opacity: fadeInAnim}, style]}>
      <View style={styles.bestMatchContainer}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.bestMatchThumbnail}>
            <Image
              style={styles.thumbnailImage}
              source={{ uri: bestMatch?.thumbnailUrl ?? "" }}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <View style={styles.bestMatchInfo}>
            <TouchableOpacity onPress={() => bestMatch?.url && Linking.openURL(bestMatch.url)}>
              <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                {bestMatch?.title || "No match Found"}
              </Text>
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>Original on {source?.name}:</Text>
              {source?.url ? (
                <TouchableOpacity onPress={() => Linking.openURL(source.url)}>
                  <Text style={styles.url} numberOfLines={1} ellipsizeMode="tail">
                    {source?.title ? `${source.title} - ${source.author}` : "Source - Author"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.infoText}>N/A</Text>
              )}
            </View>

            {bestMatch?.scoreDetails && (
              <Text style={[styles.infoText, styles.textSubtle]}>
                Score: {bestMatch.totalScore}
              </Text>
            )}
          </View>
          {matches && matches.length > 1 && (
            <View style={styles.buttonsContainer}>
              <Button
                variant="primary"
                icon={require('@/assets/images/match.png')}
                iconColor={Colors[colorScheme ?? 'dark'].textContrast}
                title="Other Matches"
                event={() => { setShowOtherMatches((prev) => !prev); console.log(showOtherMatches); }}
              />
            </View>
          )}
        </View>
      </View>
      {showOtherMatches && (
        <ScrollView style={styles.otherMatchesContainer} nestedScrollEnabled={true}>
          {matches
            .filter(m => m.url !== bestMatch?.url)
            .map((item, index) => (
              <OtherMatch key={index} {...item} style={{ zIndex: -1 - index }} />
            ))}
        </ScrollView>
      )}
    </Animated.View>
  )
}

function getStyles(colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    bestMatchContainer: {
      width: '100%',
      borderRadius: 4,
      backgroundColor: Colors[colorScheme ?? 'dark'].containerBackground,
      gap: 15,
      justifyContent: 'space-between',
      elevation: 20,
      ...(Platform.OS === 'web' ? { boxShadow: '4px 8px 20px rgba(0, 0, 0, 0.32)' } : {}),
      maxHeight: 200,
      overflow: 'hidden'
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
    },
    bestMatchThumbnail: {
      height: '100%',
      width: '25%',
      aspectRatio: Dimensions.get("window").width > 600 ? 1 : 0.7,
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
    bestMatchInfo: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 3
    },
    buttonsContainer: {
      position: 'absolute',
      right: 0,
      top: 0,
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
      fontSize: 14,
      flexWrap: 'wrap',
      color: Colors[colorScheme ?? 'dark'].text
    },
    textSubtle: {
      color: Colors[colorScheme ?? 'dark'].textSubtle
    },
    url: {
      fontSize: 14,
      color: Colors[colorScheme ?? 'dark'].textSuccess,
      textDecorationLine: 'underline',
      maxWidth: '80%'
    },
    otherMatchesContainer: {
      maxHeight: 250,
      width: '100%',
      zIndex: -1
    }
  })
}