import { StyleSheet } from "react-native";
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
import InboxViewDetails from "../screens/inbox/InboxViewDetails";

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
        <Stack.Screen name="Register">
          {() => <RegisterScreen user={user} setUser={setUser} />}
        </Stack.Screen>
        <Stack.Screen name="Login">
          {() => <LoginScreen user={user} setUser={setUser} />}
        </Stack.Screen>
        <Stack.Screen name="Settings">
          {() => <SettingsScreen user={user} setUser={setUser} />}
        </Stack.Screen>
        <Stack.Screen
          name="Inbox-details"
          component={InboxViewDetails}
          options={{
            headerShown: true,
            headerTitle: "Inbox",
            headerTitleStyle: styles.standard,
            headerStyle: {
              backgroundColor: "#D64045",
            },
            headerTitleAlign: "center",
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name="Map"
          options={{
            headerShown: true,
            headerTitle: "Need Emergency Assistance?",
            headerTitleStyle: {
              fontSize: 14,
              fontFamily: "NotoSans-Bold",
            },
            headerStyle: {
              backgroundColor: "#D64045",
            },
            headerTintColor: 'white'
          }}
        >
          {() => <MapScreen user={user} setUser={setUser} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  standard: {
    color: "white",
    fontFamily: "NotoSans-Bold",
    fontSize: 21
  }
})

export default StackNavigator;
