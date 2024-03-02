import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from "../screens/HomeScreen";
import InboxScreen from "../screens/inbox/InboxScreen";
import HotlineScreen from "../screens/HotlineScreen";
import {
    MaterialIcons,
    Ionicons,
    FontAwesome,
} from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const BottomTabs = ({ user, setUser }) => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Home"
                options={{
                    tabBarIcon: ({ focused }) =>
                        <MaterialIcons
                            name="home"
                            size={30}
                            color={focused ? "#EB5757" : "#828282"}
                        />,
                }}
            >
                {() => <HomeScreen user={user} setUser={setUser} />}
            </Tab.Screen>
            <Tab.Screen
                name="Inbox"
                component={InboxScreen}
                options={{
                    tabBarIcon: ({ focused }) =>
                        <FontAwesome
                            name="envelope"
                            size={24}
                            color={focused ? "#EB5757" : "#828282"}
                        />,
                    headerShown: true,
                    headerTitleStyle: styles.standard,
                    headerStyle: {
                        backgroundColor: "#D64045"
                    },
                    headerTitleAlign: "center",
                }}
            ></Tab.Screen>
            <Tab.Screen
                name="Hotlines"
                component={HotlineScreen}
                options={{
                    tabBarIcon: ({ focused }) =>
                        < Ionicons
                            name="call"
                            size={24}
                            color={focused ? "#EB5757" : "#828282"}
                        />
                }}
            />
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    standard: {
     color: "white",
     fontSize: 21,
     fontFamily: "NotoSans-Bold"
    }
 })

export default BottomTabs;
