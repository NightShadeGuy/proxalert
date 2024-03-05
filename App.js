import { StatusBar } from 'expo-status-bar';
import StackNavigator from "./src/navigation/StackNavigator";
import Toast from 'react-native-toast-message'

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <StackNavigator />
      <Toast />
    </>
  );
}

