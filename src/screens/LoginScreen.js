import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ToastAndroid,
} from "react-native";
import React, { useState } from "react";
import { useFonts } from "expo-font";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../components/CustomButton";

const LoginScreen = () => {
  const {
    container,
    headerText,
    text,
    font,
    input,
    button,
    section
  } = styles;

  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    "NotoSans-Medium": require("../../assets/fonts/NotoSans-Medium.ttf"),
    "NotoSans-SemiBold": require("../../assets/fonts/NotoSans-SemiBold.ttf"),
  })

  if (!fontsLoaded) {
    return undefined
  }

  const logIn = async () => {
    setLoading(true);
    try {
      // check if both input have characters
      if (email && password) {
        await signInWithEmailAndPassword(auth, email, password);
        navigation.navigate("Main");
        console.log(auth?.currentUser);
      } else {
        ToastAndroid.showWithGravity("Email and password must have any character.", 300, ToastAndroid.TOP);
      }
    } catch (err) {
      ToastAndroid.showWithGravity(err.message, 300, ToastAndroid.TOP);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={container}>
      <View style={[section, { flexDirection: "row" }]}>
        <Text
          style={[headerText, {
            fontFamily: "NotoSans-SemiBold",
            marginLeft: 10
          }]}
        >
          LOGIN
        </Text>
      </View>

      <View style={[section, { justifyContent: "center" }]}>
        <View>
          <Text style={[text, font]}>EMAIL</Text>
          <TextInput
            style={[input, text]}
            keyboardType="email-address"
            onChangeText={value => setEmail(value)}
          />
          <View>

          </View>
        </View>
        <View>
          <Text style={[text, font]}>PASSWORD</Text>
          <TextInput
            style={input}
            secureTextEntry={true}
            onChangeText={value => setPassword(value)}
          />
        </View>
      </View>

      <View style={[section, { justifyContent: "flex-end", rowGap: 10 }]}>
        <CustomButton
          title="LOGIN"
          style={button}
          textStyle={[text, font, { textAlign: "center", marginTop: 7 }]}
          textColor="white"
          loading={loading}
          onPress={logIn}
        />
        <Pressable
          onPress={() => navigation.navigate("Register")}
        >
          <Text
            style={[text, font, {
              marginBottom: 30,
              color: "#D64045",
              textDecorationLine: "underline"
            }]}
          >
            I dont have an account.
          </Text>
        </Pressable>
      </View>

    </View>
  )
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 24,
    color: "#D64045",
    textAlign: "left"
  },
  text: {
    color: "#000000",
    marginVertical: 10,
    fontSize: 12,
    paddingLeft: 10
  },
  font: {
    fontFamily: "NotoSans-Medium"
  },
  input: {
    padding: 10,
    width: 320,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
  },
  section: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    width: 191,
    height: 37,
    backgroundColor: "#D64045",
    borderRadius: 20,
    flexShrink: 0
  },
})

