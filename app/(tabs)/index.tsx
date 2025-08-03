import Match from "@/components/bestMatch";
import Button from "@/components/button";
import Header from "@/components/header";
import Input from "@/components/input";
import { Colors } from "@/constants/Colors";
import { useDynamicFlexContainer } from "@/hooks/Dimensions";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect, useRef, useState } from "react";
import { ConversionResult, SpotifyTrack, YouTubeVideo} from "@types"
import {
  Animated,
  ColorSchemeName,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";

export default function Index() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);
  const dynamicFlexContainer = useDynamicFlexContainer();

  const slideUpAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(1)).current;
  const flatListSlideAnim = useRef(new Animated.Value(350)).current;

  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 2 : 1;

  let [inputValue, setInputValue] = useState<string>('')
  const [conversionData, setConversionData] = useState<ConversionResult<SpotifyTrack | YouTubeVideo> | null>(null);

  useEffect(() => {
    if (conversionData) {
      Animated.parallel([
        Animated.timing(slideUpAnim, {
          toValue: 20,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(flatListSlideAnim, {
          toValue: 40,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeInAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideUpAnim, {
          toValue: 300,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(flatListSlideAnim, {
          toValue: 350,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeInAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [conversionData, slideUpAnim, fadeInAnim, flatListSlideAnim]);

  return (
    <SafeAreaView style={styles.page}>
        <Header />
        <Animated.View style={[styles.content, styles.animatedContainer,{transform: [{ translateY: slideUpAnim }]}]}>
            <View style={[styles.inputContainer]}>
              <Input placeholder="Paste the playlist link here" value={inputValue} onChangeText={(text) => setInputValue(text)}/>
              <Button
                variant="primary"
                title="Convert Playlist"
                height={47}
                event={() => null} 
                callback={() => console.log(conversionData)}
              icon={require('@/assets/images/convert.png')} />
            </View>
          <View style={styles.columnContainer}>
            <Text style={styles.hintText} selectable={false}>
              Paste a Spotify or YouTube playlist link above to convert it.
            </Text>
            <Text style={styles.hintText} selectable={false}>Converting...</Text>
          </View>
        </Animated.View>
        <Animated.View 
          style={[
            styles.flatListContainer,
            {transform: [{translateY: flatListSlideAnim}], opacity: fadeInAnim}
          ]}
        >
          <FlatList
            key={numColumns}
            data={conversionData?.matches ?? []}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => 
            <Match
              original={conversionData!.original}
              bestMatch={item}
              matches={conversionData?.matches ?? []}
              numColumns={numColumns}
              style={{zIndex: (-1 - index)}}
            />}
            contentContainerStyle={{ gap: 10, paddingBottom: 50 }}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between', rowGap: 10 } : undefined}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            removeClippedSubviews={false}
            keyboardShouldPersistTaps="handled"
          />
        </Animated.View>
    </SafeAreaView>
  )
}

function getStyles(colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'dark'].background,
      minHeight: '100%',
      minWidth: '100%'
    },
    animatedContainer: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      width: '95%',
      maxHeight: '20%',
      gap: 10
    },
    inputContainer: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    },
    columnContainer: {
      flexDirection: 'column',
      gap: 10,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    },
    hintText: {
      textAlign: 'center',
      color: Colors[colorScheme ?? 'dark'].textMuted,
      fontSize: Dimensions.get('window').width >= 600 ? 18 : 14 
    },
    flatListContainer: {
      position: 'relative',
      height: '80%',
      // top: 350,
      // left: 0,
      // right: 0,
      // bottom: 0,
      paddingHorizontal: '2.5%',
    }
  });
}

