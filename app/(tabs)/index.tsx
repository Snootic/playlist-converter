import Match from "@/components/bestMatch";
import Button from "@/components/button";
import Select from "@/components/select";
import Header from "@/components/header";
import Input from "@/components/input";
import { Colors } from "@/constants/Colors";
import { convert } from "@/hooks/convert";
import { useDynamicFlexContainer } from "@/hooks/Dimensions";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ConversionResult, SpotifyTrack, YouTubeVideo } from "@types";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ColorSchemeName,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Image,
} from "react-native";
import { parseUrl, sources } from "@/common/detectSource";

export default function Index() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);
  const dynamicFlexContainer = useDynamicFlexContainer();
  const imageSourceMap: Record<string, any> = {
    Spotify: require('@/assets/images/spotify-black-logo.png'),
    YouTube: require('@/assets/images/youtube-logo-white.png'),
  };

  const slideUpAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(1)).current;
  const flatListSlideAnim = useRef(new Animated.Value(350)).current;

 
  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 2 : 1;

  let [status, setStatus] = useState<string>('')
  let [inputStatus, setInputStatus] = useState<'none' | 'success' | 'warning' | 'error'>('none')

  let [inputValue, setInputValue] = useState<string>('')
  let [source, setSource] = useState<string>('')


  const [conversionData, setConversionData] = useState<ConversionResult<SpotifyTrack | YouTubeVideo>[] | null>(null);
  const [animatedRows, setAnimatedRows] = useState<Record<string, boolean>>({});

  let result: Response | undefined = undefined;

  let [selectedDestination, setSeletecDestination] = useState<string>("")
  const destinationOptions = Object.entries(sources).map(([key, label]) => ({
    label,
    value: label
  }));

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

  const handleAnimationDone = (key: string) => {
    setAnimatedRows(prev => ({ ...prev, [key]: true }));
  };

  return (
    <SafeAreaView style={styles.page}>
        <Header />
        <Animated.View style={[styles.content, styles.animatedContainer,{transform: [{ translateY: slideUpAnim }]}]}>
            <View style={[styles.inputContainer, dynamicFlexContainer]}>
              {source && (
                <Image
                  source={imageSourceMap[source]}
                  style={{width: 40, height: 40}}
                  resizeMode="contain"
                />
              )}
              <Input
              placeholder="Paste the playlist link here"
              value={inputValue}
              onChangeText={(text) => { 
                setInputValue(text); 
                const detectedSource = parseUrl(text, 'playlist')!;
                setSource(detectedSource); 
                if (text.trim() === "") {
                setInputStatus("none");
                } else if (detectedSource) {
                setInputStatus("success");
                } else {
                setInputStatus("warning");
                };
              }}
              status={inputStatus}
              />
              <View style={{flexDirection: 'row', gap: 10}}>
                <Select
                  options={destinationOptions.filter(o => o.label !== source)}
                  value={selectedDestination}
                  placeholder="Choose a destination"
                  onSelect={setSeletecDestination}
                />
                <Button
                  variant="primary"
                  title="Convert Playlist"
                  height={47}
                  event={async () => {
                    for await (const item of convert(inputValue, selectedDestination)) {
                      setConversionData(prev => prev ? [...prev, item] : [item]);
                    }
                    setStatus('Finished conversion!')
                  }}
                  callback={() => setStatus('Converting...')}
                  icon={require('@/assets/images/convert.png')}
                />
              </View>
            </View>
          <View style={styles.columnContainer}>
            <Text style={styles.hintText} selectable={false}>
              Paste a playlist link above to convert it.
            </Text>
            <Text style={styles.hintText} selectable={false}>{status}</Text>
          </View>
        </Animated.View>
        <Animated.View 
          style={[
            styles.flatListContainer,
            {transform: [{translateY: flatListSlideAnim}], opacity: fadeInAnim}
          ]}
        >
          <FlatList
            data={conversionData}
            keyExtractor={(item, index) => item.original.url || index.toString()}
            renderItem={({ item, index }) => (
              <Match
                original={item.original}
                bestMatch={item.bestMatch}
                matches={item.matches ?? []}
                numColumns={numColumns}
                style={{zIndex: (-1 - index)}}
                index={index}
                shouldAnimate={!animatedRows[item.original.url || index.toString()]}
                onAnimationDone={() => handleAnimationDone(item.original.url || index.toString())}
              />
            )}
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

