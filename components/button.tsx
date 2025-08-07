import { Colors } from "@/constants/Colors";
import { sources } from "@/common/detectSource";
import {
  ColorSchemeName,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

type ButtonProps = PressableProps & {
  variant: 'primary' | 'secondary' | keyof typeof sources ;
  title: string;
  icon?: ImageSourcePropType;
  iconColor?: string;
  height?: ViewStyle['height'];
  event: () => void;
  callback?: () => void;
};

export default function Button({ variant, title, icon, iconColor, height = 40, ...props }: ButtonProps) {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  return (
    <View>
      <Pressable
        {...props}
        style={[styles.button, styles[variant], {height: height}]}
        onPress={async () => {
          if (props.event.constructor.name === "AsyncFunction") {
            await props.event();
          } else {
            props.event();
          }
          if (props.callback) {
            if (props.callback.constructor.name === "AsyncFunction") {
              await props.callback();
            } else {
              props.callback();
            }
          }
        }}>
        {icon && (
          <Image
            style={[
              styles.icon,
            ]}
            source={icon}
            resizeMode="contain"
            tintColor={iconColor}
          />
        )}
        <Text style={[styles[variant], {backgroundColor: 'transparent'}]}>{title}</Text>
      </Pressable>
    </View>
  );
}

function getStyles(colorScheme: ColorSchemeName) {
  const isDark = colorScheme === 'dark';

  return StyleSheet.create({
    button: {
      minWidth: 'auto',
      maxWidth: 200,
      borderRadius: 4,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      padding: 10,
      elevation: 20,
      ...(Platform.OS === 'web' ? { boxShadow: '4px 8px 20px rgba(0, 0, 0, 0.32)' } : {}),
    },
    hover:{
      
    },
    icon: {
      width: 20,
      height: 20,
      marginRight: 5,
    },
    text: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'dark'].text,
    },
    spotify: {
      backgroundColor: Colors[colorScheme ?? 'dark'].spotify,
      borderColor: Colors[colorScheme ?? 'dark'].tintLight,
      color: isDark ? Colors.dark.textContrast : Colors.light.text,
    },
    youtube: {
      backgroundColor: Colors[colorScheme ?? 'dark'].youtube,
      borderColor: Colors[colorScheme ?? 'dark'].tintDark,
      color: isDark ? Colors.dark.text : Colors.light.textContrast,
    },
    primary: {
      backgroundColor: Colors[colorScheme ?? 'dark'].primaryButton,
      borderColor: Colors[colorScheme ?? 'dark'].tint,
      color: Colors[colorScheme ?? 'dark'].textContrast,
    },
    secondary: {
      backgroundColor: Colors[colorScheme ?? 'dark'].secondaryButton,
      borderColor: Colors[colorScheme ?? 'dark'].accent,
      color: Colors[colorScheme ?? 'dark'].text,
    }
  })
}