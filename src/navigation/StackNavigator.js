import { StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GetStartedScreen from "../screens/GetStartedScreen";
import BottomTabs from "./BottomTabs";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import SettingsScreen from "../screens/SettingsScreen";
import MapScreen from "../screens/map/MapScreen";
import ResponderMapScreen from "../screens/map/ResponderMapScreen";
import InboxViewDetails from "../screens/inbox/InboxViewDetails";
import {
  onSnapshot,
  updateDoc,
  doc
} from 'firebase/firestore';
import { accountsRef, showToast } from "../shared/utils";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import ChatScreen from "../screens/ChatScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const [user, setUser] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [accountDetails, setAccountDetails] = useState(null);
  const [isResponder, setIsResponder] = useState(false);

  //State for notifications
  const [expoPushToken, setExpoPushToken] = useState('');
  const [respondersToken, setRespondersToken] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userObserver) => {
      if (userObserver) {
        setUser(userObserver);
        loadAccounts(userObserver);
        console.log("USER IS STILL LOGGED IN: ", userObserver);
      } else {
        console.log("USER IS LOGGED OUT");
      }
    })

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, [user])


  const loadAccounts = async (user) => {
    try {
      onSnapshot(accountsRef, (querySnapshot) => {
        const accounts = querySnapshot.docs.map(doc => (
          { ...doc.data(), id: doc.id }
        ))
        setAllAccounts(accounts);

        const responderAccount = accounts.filter(account => account.isResponder === true);
        const responderToken = responderAccount.map(prevAccount => prevAccount.notificationToken);
        setRespondersToken(responderToken);
        console.log("Responders token:", responderToken);


        const myAccount = accounts.find(responder => responder.uid === user?.uid);
        setAccountDetails(myAccount);
        console.log("MyAccount", myAccount);

        if (myAccount?.isResponder) {
          setIsResponder(true);
        } else {
          setIsResponder(false);
        }

        if (myAccount?.uid === user?.uid) {
          registerForPushNotificationsAsync()
            .then(token => {
              console.log("token:", token);
              setExpoPushToken(token)
              updateNotificationTokenAccountToDb(token, myAccount.id);
            })
            .catch(error => console.error(error));
        }

      })
    } catch (err) {
      console.error(err.message);
    }
  }

  //console.log("Snapshot loadAccounts", allAccounts);
  //console.log("Is this current user a responder", isResponder);


  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }

      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid

      token = (await Notifications.getExpoPushTokenAsync({ projectId: '83c88c18-f9b5-4b4f-8ca1-1fc39452f124' })).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }
    return token;
  }

  const updateNotificationTokenAccountToDb = async (token, id) => {
    try {
      const accountRef = doc(db, "accounts", id)
      await updateDoc(accountRef, {
        notificationToken: token
      });
 
      showToast("Updated token successfully.", token);
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Main" : "Get Started"}
        screenOptions={{
          headerShown: false
        }}
      >
        {!user && (
          <Stack.Screen name="Get Started" component={GetStartedScreen} />
        )}
        {user && (
          <Stack.Screen name="Main">
            {() =>
              <BottomTabs
                user={user}
                setUser={setUser}
                accountDetails={accountDetails}
              />
            }
          </Stack.Screen>
        )}
        <Stack.Screen name="Register">
          {() => <RegisterScreen user={user} setUser={setUser} />}
        </Stack.Screen>
        <Stack.Screen name="Login">
          {() => <LoginScreen user={user} setUser={setUser} />}
        </Stack.Screen>
        <Stack.Screen name="Settings">
          {() =>
            <SettingsScreen
              user={user}
              setUser={setUser}
              accountDetails={accountDetails}
            />
          }
        </Stack.Screen>
        <Stack.Screen
          name="Inbox-details"
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
        >
          {() => <InboxViewDetails user={user} accountDetails={accountDetails} />}
        </Stack.Screen>
        <Stack.Screen
          name="Map"
          options={{
            headerShown: true,
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
          {
            () => isResponder
              ? (
                <ResponderMapScreen
                  user={user}
                  setUser={setUser}
                  accountDetails={accountDetails}
                  expoPushToken={expoPushToken}
                />
              )
              : (
                <MapScreen
                  user={user}
                  setUser={setUser}
                  accountDetails={accountDetails}
                  expoPushToken={expoPushToken}
                  respondersToken={respondersToken}
                />
              )
          }
        </Stack.Screen>
        <Stack.Screen name="Chat">
          {() => <ChatScreen user={user} accountDetails={accountDetails} />}
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
