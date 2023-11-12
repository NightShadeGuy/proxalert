import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ToastAndroid,
} from 'react-native';
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const {
    container,
    button,
    text
  } = styles;

  const logout = () => {
    setLoading(true);
    try {
      signOut(auth);
      ToastAndroid.showWithGravity("Successfully logged out", 300, ToastAndroid.TOP);
      navigation.navigate("Get Started");
    } catch(err) {
      ToastAndroid.showWithGravity(err.message, 300, ToastAndroid.TOP);
    }
  }

  return (
    <View style={container}>
      <Text>Profile Screen</Text>

      {/* Temporary button to sign out the user */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
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
  }
})

export default Profile;