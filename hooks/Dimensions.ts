import { useWindowDimensions } from "react-native";

export function useDynamicFlexContainer() {
  const { width } = useWindowDimensions();
  return {
    flexDirection: (width > 800 ? "row" : "column") as "row" | "column",
  };
}

export function useDynamicHeightContainer() {
  const { width } = useWindowDimensions();
  return {
    height: (width > 800 ? "100%" : "50%") as "100%" | "50%",
  };
}

export function useDynamicWidthContainer() {
  const { width } = useWindowDimensions();
  return {
    width: (width > 1200 ? '30%' : width > 800 ? '50%' : '80%') as '30%' | '50%' | '80%',
  }
}