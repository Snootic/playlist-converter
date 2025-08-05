import { Colors } from "@/constants/Colors";
import { useState } from "react";
import {
  ColorSchemeName,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
}

export default function Select({ options, value, placeholder, onSelect }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.select} 
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.text, !selectedOption && styles.placeholder]}>
          {selectedOption?.label || placeholder || "Select an option"}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function getStyles(colorScheme: ColorSchemeName) {
  return StyleSheet.create({
    select: {
      backgroundColor: Colors[colorScheme ?? "dark"].containerBackground,
      // maxWidth: '80%',
      // minWidth: '60%',
      borderRadius: 4,
      padding: 15,
      elevation: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...(Platform.OS === 'web' ? { boxShadow: '4px 8px 20px rgba(0, 0, 0, 0.32)' } : {}),
    },
    text: {
      color: Colors[colorScheme ?? "dark"].text,
      flex: 1,
    },
    placeholder: {
      color: Colors[colorScheme ?? "dark"].textMuted,
    },
    arrow: {
      color: Colors[colorScheme ?? "dark"].textMuted,
      marginLeft: 10,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdown: {
      backgroundColor: Colors[colorScheme ?? "dark"].containerBackground,
      borderRadius: 4,
      maxWidth: '80%',
      minWidth: '60%',
      maxHeight: 200,
      elevation: 30,
      ...(Platform.OS === 'web' ? { boxShadow: '4px 8px 20px rgba(0, 0, 0, 0.4)' } : {}),
    },
    option: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme ?? "dark"].textMuted + '20',
    },
    optionText: {
      color: Colors[colorScheme ?? "dark"].text,
    },
  });
}