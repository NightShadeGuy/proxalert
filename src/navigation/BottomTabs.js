import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from "../screens/HomeScreen";
import ContactScreen from "../screens/ContactScreen";
import HotlineScreen from "../screens/HotlineScreen";
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

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
            <Tab.Screen
                name="Contact"
                component={ContactScreen}
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
