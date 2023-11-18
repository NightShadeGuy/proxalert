import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  Pressable,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import { auth } from "../config/firebase";
import { updateProfile, updatePassword } from "firebase/auth";
import { useFonts } from "expo-font";
import { AntDesign } from '@expo/vector-icons';
import { StatusBar } from 'react-native';

const SettingsScreen = ({ user, setUser }) => {
  const {
    container,
    headerText,
    defaultText,
    font,
    section,
    sameRow,
    input,
    button,
    buttonText
  } = styles;
  const [showInfo, setShowInfo] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);

  const [username, setUsername] = useState(user.displayName);
  const [photoUrl, setPhotoUrl] = useState(user.photoURL);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  console.log(newPassword, confirmNewPassword);

  const [fontsLoaded] = useFonts({
    "NotoSans-Medium": require("../../assets/fonts/NotoSans-Medium.ttf"),
    "NotoSans-SemiBold": require("../../assets/fonts/NotoSans-SemiBold.ttf"),
  })

  if (!fontsLoaded) {
    return undefined
  }

  const updateUserInfo = async () => {
    try {
      await updateProfile(user, {
        displayName: username,
        photoURL: photoUrl
      });
      setShowInfo(!showInfo);
      ToastAndroid.showWithGravity("Successfully updated", 300, ToastAndroid.BOTTOM);
    } catch (err) {
      console.error(err.message);
    }
  }

  const changePassword = async () => {
    try {
      if(newPassword === confirmNewPassword) {
        updatePassword(user, newPassword);
        setShowChangePass(!showChangePass);
        ToastAndroid.showWithGravity("Successfully updated", 300, ToastAndroid.BOTTOM);
      } else {
        ToastAndroid.showWithGravity("Your new password and confirm password doesn't match.", 300, ToastAndroid.TOP);
      }
    } catch(err) {
      ToastAndroid.showWithGravity(err.message, 300, ToastAndroid.TOP);
    }
  }

  return (
    <View style={container}>
      <ScrollView>
        <View>
          <Text style={[headerText, font]}>SETTINGS</Text>
        </View>
        <View style={section}>
          <Text
            style={{
              fontSize: 18,
              color: "white"
            }}
          >
            ACCOUNT
          </Text>
          <Pressable
            style={sameRow}
            onPress={() => {
              setShowInfo(!showInfo);

              if (showChangePass) {
                setShowChangePass(false);
              }
            }}
          >
            <Text style={defaultText}>PERSONAL INFORMATION</Text>
            <AntDesign
              name="right"
              size={12}
              color="white"
              style={{
                transform: [{ rotate: showInfo ? "90deg" : "0deg" }],
              }}
            />
          </Pressable>

          {/* Display Personal Info */}
          {showInfo && (
            <View>
              <View>
                <Text style={[defaultText, { marginVertical: 10 }]}>
                  Email
                </Text>
                <TextInput
                  style={input}
                  placeholder="Email..."
                  value={user.email}
                />
              </View>

              <View>
                <Text style={[defaultText, { marginVertical: 10 }]}>
                  Name
                </Text>
                <TextInput
                  style={input}
                  onChangeText={value => setUsername(value)}
                  value={username}
                />
              </View>

              <View>
                <Text style={[defaultText, { marginVertical: 10 }]}>
                  Phone Number
                </Text>
                <TextInput
                  style={input}
                  placeholder='Ex: 123456'
                  keyboardType="numeric"
                  onChangeText={value => setPhoneNumber(value)}
                  value={phoneNumber}
                />
              </View>

              <View>
                <Text style={[defaultText, { marginVertical: 10 }]}>
                  Photo URL
                </Text>
                <TextInput
                  style={input}
                  placeholder="Enter an image url..."
                  onChangeText={value => setPhotoUrl(value)}
                  value={photoUrl}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.6}
                style={button}
                onPress={updateUserInfo}
              >
                <Text style={[buttonText, font]}>Save</Text>
              </TouchableOpacity>

            </View>
          )}

          <Pressable
            style={sameRow}
            onPress={() => {
              setShowChangePass(!showChangePass);

              if (showInfo) {
                setShowInfo(false);
              }
            }}
          >
            <Text style={defaultText}>CHANGE PASSWORD</Text>
            <AntDesign
              name="right"
              size={12}
              color="white"
              style={{
                transform: [{ rotate: showChangePass ? "90deg" : "0deg" }],
              }}
            />
          </Pressable>

          {/* Displayed input for password */}
          {showChangePass && (
            <View>
              <View>
                <Text style={[defaultText, { marginVertical: 10 }]}>
                  New Password
                </Text>
                <TextInput
                  style={input}
                  secureTextEntry
                  onChangeText={value => setNewPassword(value)}
                />
              </View>

              <View>
                <Text style={[defaultText, { marginVertical: 10 }]}>
                  Confirm New Password
                </Text>
                <TextInput
                  style={input}
                  secureTextEntry
                  onChangeText={value => setConfirmNewPassword(value)}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.6}
                style={button}
                onPress={changePassword}
              >
                <Text style={[buttonText, font]}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  headerText: {
    color: "#D64045",
    fontSize: 24,
    marginTop: StatusBar.currentHeight + 40,
    marginBottom: 20
  },
  defaultText: {
    fontSize: 12,
    color: "white"
  },
  font: {
    fontFamily: "NotoSans-SemiBold"
  },
  section: {
    backgroundColor: "#D64045",
    width: Dimensions.get("window").width - 50,
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
  },
  sameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10
  },

  image: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  input: {
    padding: 4,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 7,
    paddingLeft: 10
  },
  button: {
    backgroundColor: "white",
    marginVertical: 15,
    borderRadius: 6,
    paddingVertical: 5
  },
  buttonText: {
    textAlign: "center",
    marginTop: 0,
    color: "#D64045"
  }

})

export default SettingsScreen;