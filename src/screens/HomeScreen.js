import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ToastAndroid,
  Image,
  Pressable,
  Animated,
} from 'react-native';
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { loadFonts } from "../../utils";

const HomeScreen = ({ user, setUser }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [fontsLoaded] = loadFonts();

  const {
    container,
    button,
    text,
    image,
    sameRow,
    section,
    headerColor,
    font,
    textSection,
  } = styles;

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      navigation.navigate("Get Started");
    } catch (err) {
      ToastAndroid.showWithGravity(err.message, 300, ToastAndroid.TOP);
    }
  }

  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.timing(scaleValue, {
      toValue: 1.2,
      duration: 500, 
      useNativeDriver: true, // Set to true if possible for better performance
    }).start();
  };

  const resetScale = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };


  if (!fontsLoaded) {
    return null
  }

  return (
    <View style={container}>
      <View style={section}>
        <View style={sameRow}>
          <Text
            style={[
              headerColor,
              {
                fontSize: 24,
                fontFamily: "NotoSans-Bold"
              }
            ]}
          >
            {user?.displayName ? `Hello, ${user?.displayName}!` : "Hey, User!"}
          </Text>
          <FontAwesome
            name="gear"
            size={24}
            color="#D64045"
            onPress={() => navigation.navigate("Settings")}
          />
        </View>
        <Text
          style={[
            headerColor,
            {
              fontSize: 18,
              fontFamily: "NotoSans-Medium"
            }
          ]}
        >
          We are here for you.
        </Text>
      </View>

      <View
        style={{ alignItems: "center" }}
      >
        <Animated.View
          style={{ transform: [{ scale: scaleValue }] }}
        >
          <Pressable
            onPressIn={handlePress}
            onPressOut={resetScale}
            onLongPress={() => navigation.navigate("Map")}
          >
            <Image
              source={require("../../assets/images/request-btn.png")}
              style={image}
            />
          </Pressable>
        </Animated.View>
        <View style={textSection}>
          <Text style={[font, { fontSize: 12 }]}>TAP TO REQUEST EMERGENCY ASSISTANT</Text>
          <Text style={[font, { fontSize: 12 }]}>HOLD FOR QUICK ASSISTANCE!</Text>
        </View>
      </View>

      {/* Temporary button to sign out */}
      <CustomButton
        title="Logout"
        style={button}
        textStyle={text}
        textColor="white"
        loading={loading}
        onPress={logout}
      />
    </View>
  )
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    rowGap: 100
  },
  section: {
    width: "100%",
    paddingHorizontal: 20,
  },
  headerColor: {
    color: "#333"
  },
  font: {
    fontFamily: "NotoSans-SemiBold"
  },
  sameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  textSection: {
    alignItems: "center",
    marginVertical: 30
  },
  button: {
    width: 191,
    height: 37,
    backgroundColor: "#D64045",
    border: 1,
    borderColor: "gray",
    borderRadius: 20,
  },
  text: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 10
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    padding: 50
  },
})
