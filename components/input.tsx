import { Colors } from "@/constants/Colors";
import {
  TextInput,
  useColorScheme,
  ColorSchemeName,
  StyleSheet,
  TextInputProps,
  Platform
} from "react-native";

interface inputProps extends TextInputProps {}

export default function Input({...props}: inputProps) {
  const colorScheme = useColorScheme()
  const styles = getStyles(colorScheme)

  return (
    <TextInput style={styles.input} {...props} placeholderTextColor={Colors[colorScheme ?? "dark"].textMuted}></TextInput>
  )
}

function getStyles(colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    input: {
      backgroundColor: Colors[colorScheme ?? "dark"].containerBackground,
      maxWidth: '80%',
      minWidth: '60%',
      color: Colors[colorScheme ?? "dark"].textMuted,
      borderRadius: 4,
      padding: 15,
      elevation: 20,
      ...(Platform.OS === 'web' ? { boxShadow: '4px 8px 20px rgba(0, 0, 0, 0.32)' } : {}),
    }
  })
}