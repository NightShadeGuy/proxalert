import { StatusBar } from 'expo-status-bar';
import StackNavigator from "./src/navigators/StackNavigator";

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <StackNavigator />
    </>
  );
}

