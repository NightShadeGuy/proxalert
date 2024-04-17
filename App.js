import { StatusBar } from 'expo-status-bar';
import { UIManager, Platform } from "react-native";
import StackNavigator from "./src/navigation/StackNavigator";
import Toast from 'react-native-toast-message'

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <StackNavigator />
      <Toast />
    </>
  );
}

