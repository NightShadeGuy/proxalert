import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  TouchableOpacity,
  Image,
  ToastAndroid,
} from 'react-native';
import { updateProfile, updatePassword, signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore"
import { db, auth } from '../config/firebase';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { defaultTheme, toast } from "../shared/utils";
import { useNavigation, useRoute } from '@react-navigation/native';
import { showToast } from '../shared/utils';

const SettingsScreen = ({ user, setUser, accountDetails }) => {
  const {
    container,
    defaultText,
    font,
    section,
    sameRow,
    input,
    button,
    buttonText
  } = styles;
  const navigation = useNavigation();
  const { params: { profilePicture } } = useRoute();
  console.log("Settings Screen", accountDetails);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitleStyle: {
        fontFamily: "NotoSans-Bold",
      },
      headerStyle: {
        backgroundColor: defaultTheme,
      },
      headerTintColor: "white",
      headerTitleAlign: "center",
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={() => navigation.navigate("Main")}
        >
          <MaterialIcons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", columnGap: 5 }}
          onPress={logout}
        >
          <MaterialIcons name="logout" size={20} color="white" />
          <Text style={[font, { color: "white" }]}>Logout</Text>
        </TouchableOpacity>
      )
    })
  }, [])

  const [showInfo, setShowInfo] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);

  const [username, setUsername] = useState(user?.displayName);
  const [photoUrl, setPhotoUrl] = useState(user?.photoURL);
  const [phoneNumber, setPhoneNumber] = useState(accountDetails?.contactNumber);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  console.log(username, phoneNumber);

  const updateUserInfo = async () => {
    try {
      await updateProfile(user, {
        displayName: username,
        photoURL: photoUrl
      });
      showToast("Successfully update user info")
    } catch (error) {
      console.error(error.message);
    }
  }

  const updateAccountInfoToDb = async (id, username, phoneNumber) => {
    try {
      const emergencyRequestRef = doc(db, "accounts", id);

      await updateDoc(emergencyRequestRef, {
        user: username,
        contactNumber: phoneNumber
      }, { merge: true });
    } catch (error) {
      console.error(error.message);
    }
  }


  const handleUpdate = async (id) => {
    try {
      await updateUserInfo(); // Wait for updateUserInfo to complete

      if (username !== undefined && phoneNumber !== undefined) {
        updateAccountInfoToDb(id, username, phoneNumber);
      }

      setShowInfo(!showInfo);
      //toast("Updated successfully");
      showToast("Updated successfully");
    } catch (error) {
      console.error(error.message);
    }
  }

  const changePassword = async () => {
    try {
      if (newPassword === confirmNewPassword) {
        if (newPassword.length >= 8) {
          updatePassword(user, newPassword);
          setShowChangePass(!showChangePass);
          showToast("Updated successfully");
        } else {
          showToast("", "There must be at least 8 characters in your password.", "error");
        }
      } else {
        showToast("", "Your new password and confirm password doesn't match", "error");
      }
    } catch (err) {
      toast(err.message);
    }
  }

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigation.navigate("Get Started");
    } catch (err) {
      ToastAndroid.showWithGravity(err.message, 300, ToastAndroid.TOP);
    }
  }

  return (
    <View style={container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            position: "relative",
            height: 100,
            backgroundColor: defaultTheme,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: profilePicture }}
            style={styles.image}
          />
        </View>

        <Text style={styles.headerTitle}>{accountDetails?.user}</Text>
        <Text style={[font, { textAlign: "center" }]}>{accountDetails?.contactNumber}</Text>

        <View style={section}>
          <Pressable
            style={sameRow}
            onPress={() => {
              setShowInfo(!showInfo);

              if (showChangePass) {
                setShowChangePass(false);
              }
            }}
          >
            <Text style={[defaultText, font]}>PERSONAL INFORMATION</Text>
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
                <Text style={[defaultText, font, { marginVertical: 10 }]}>
                  Email
                </Text>
                <TextInput
                  style={[input, font]}
                  placeholder="Email..."
                  value={user.email}
                />
              </View>

              <View>
                <Text style={[defaultText, font, { marginVertical: 10 }]}>
                  Name
                </Text>
                <TextInput
                  style={[input, font]}
                  onChangeText={value => setUsername(value)}
                  value={username}
                />
              </View>

              <View>
                <Text style={[defaultText, font, { marginVertical: 10 }]}>
                  Phone Number
                </Text>
                <TextInput
                  style={[input, font]}
                  keyboardType="numeric"
                  placeholder='Ex: 09123456789'
                  onChangeText={value => setPhoneNumber(value)}
                  value={phoneNumber}
                />
              </View>

              <View>
                <Text style={[defaultText, font, { marginVertical: 10 }]}>
                  Photo URL
                </Text>
                <TextInput
                  style={[input, font]}
                  keyboardType="url"
                  placeholder="Enter an image url..."
                  onChangeText={value => setPhotoUrl(value)}
                  value={photoUrl}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.6}
                style={button}
                onPress={() => handleUpdate(accountDetails?.id)}
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
            <Text style={[defaultText, font]}>CHANGE PASSWORD</Text>
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
                <Text style={[defaultText, font, { marginVertical: 10 }]}>
                  New Password
                </Text>
                <TextInput
                  style={[input, font]}
                  secureTextEntry
                  onChangeText={value => setNewPassword(value)}
                />
              </View>

              <View>
                <Text style={[defaultText, font, { marginVertical: 10 }]}>
                  Confirm New Password
                </Text>
                <TextInput
                  style={[input, font]}
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
    //justifyContent: "center",
    //alignItems: "center",
    backgroundColor: "white"
  },
  defaultText: {
    fontSize: 12,
    color: "white"
  },
  font: {
    fontFamily: "NotoSans-SemiBold"
  },
  headerTitle: {
    color: defaultTheme,
    fontSize: 24,
    fontFamily: "NotoSans-Bold",
    textAlign: "center",
    marginTop: 30
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 90,
    borderWidth: 5,
    borderColor: "white"
  },
  section: {
    backgroundColor: "#D64045",
    width: "90%",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginVertical: 20,
    marginHorizontal: 20
  },
  sameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10
  },
  input: {
    padding: 4,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 7,
    paddingLeft: 10,
    color: "gray"
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