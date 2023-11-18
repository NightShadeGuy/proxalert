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

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("Effect run");
    const unsubscribe = onAuthStateChanged(auth, (userObserver) => {
      if (userObserver) {
        // User is signed in,
        console.log("USER IS STILL LOGGED IN: ", user);
        setUser(userObserver);
      } else {
        // User is signed out
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
      >
        {!user && (
          <Stack.Screen
            name="Get Started"
            component={GetStartedScreen}
            options={{
              headerShown: false,
            }}
          />
        )}
        {user && (
          <Stack.Screen
            name="Main"
            options={{
              headerShown: false,
            }}
          >
            {() => <BottomTabs user={user} setUser={setUser} />}
          </Stack.Screen>
        )}
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Login"
          options={{
            headerShown: false,
          }}
        >
          {() => <LoginScreen user={user} setUser={setUser} />}
        </Stack.Screen>
        <Stack.Screen
          name="Settings"
          options={{
            headerShown: false,
          }}
        >
          {() => <SettingsScreen user={user} setUser={setUser} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default StackNavigator;
