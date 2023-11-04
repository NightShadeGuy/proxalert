import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from "../screens/HomeScreen";
import ContactScreen from "../screens/ContactScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused }) =>
                        <MaterialIcons
                            name="home"
                            size={30}
                            color={focused ? "#EB5757" : "#828282"}
                        />,
                }}
            />
            <Tab.Screen
                name="Contact"
                component={ContactScreen}
                options={{
                    tabBarIcon: ({ focused }) =>
                        < Ionicons
                            name="call"
                            size={24}
                            color={focused ? "#EB5757" : "#828282"}
                        />
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) =>
                        <FontAwesome5
                            name="user-alt"
                            size={22}
                            color={focused ? "#EB5757" : "#828282"}
                        />
                }}
            />
        </Tab.Navigator>
    )
}

export default BottomTabs;
