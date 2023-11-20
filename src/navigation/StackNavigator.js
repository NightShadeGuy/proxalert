import React, { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GetStartedScreen from "../screens/GetStartedScreen";
import BottomTabs from "./BottomTabs";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import SettingsScreen from "../screens/SettingsScreen";
import MapScreen from "../screens/MapScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("Effect run");
    const unsubscribe = onAuthStateChanged(auth, (userObserver) => {
      if (userObserver) {
        setUser(userObserver);
        console.log("USER IS STILL LOGGED IN: ", user);
      } else {
        console.log("USER IS LOGGED OUT");
      }
    })

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, [user])

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Main" : "Get Started"}
        screenOptions={{
          headerShown: false
        }}
      >
        {!user && (
          <Stack.Screen
            name="Get Started"
            component={GetStartedScreen}
          />
        )}
        {user && (
          <Stack.Screen name="Main">
            {() => <BottomTabs user={user} setUser={setUser} />}
          </Stack.Screen>
        )}
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />
        <Stack.Screen name="Login">
          {() => <LoginScreen user={user} setUser={setUser} />}
        </Stack.Screen>
        <Stack.Screen name="Settings">
          {() => <SettingsScreen user={user} setUser={setUser} />}
        </Stack.Screen>
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            headerShown: true,
            headerTitle: "NEED EMERGENCY ASSISTANCE?",
            headerTitleStyle: {
              color: "white",
              fontSize: 16
            },
            headerStyle: {
              backgroundColor: "#D64045",
            },
            headerTintColor: 'white'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default StackNavigator;
