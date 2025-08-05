import { Colors } from "@/constants/Colors";
import {
  TextInput,
  useColorScheme,
  ColorSchemeName,
  StyleSheet,
  TextInputProps,
  Platform
} from "react-native";

interface inputProps extends TextInputProps {
  status: 'success' | 'warning' | 'error' | 'none'
}

export default function Input({...props}: inputProps) {
  const colorScheme = useColorScheme()
  const styles = getStyles(colorScheme)

  let borderColor = {}
  let status = props.status
  if (status !== "none") {
    borderColor = {
      borderColor: Colors[colorScheme ?? "dark"][status],
      borderWidth: 2,
      // Remove default focus outline/border for web
      ...(Platform.OS === 'web' ? { outline: 'none', boxShadow: 'none' } : {}),
    };
  }

  return (
    <TextInput {...props} style={[styles.input, borderColor]}  placeholderTextColor={Colors[colorScheme ?? "dark"].textMuted}></TextInput>
  )
}

function getStyles(colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    input: {
      backgroundColor: Colors[colorScheme ?? "dark"].containerBackground,
      width: '100%',
      color: Colors[colorScheme ?? "dark"].textMuted,
      borderRadius: 4,
      padding: 15,
      elevation: 20,
      ...(Platform.OS === 'web' ? { boxShadow: '4px 8px 20px rgba(0, 0, 0, 0.32)' } : {}),
    }
  })
}