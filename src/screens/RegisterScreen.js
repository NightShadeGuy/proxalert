import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable
} from "react-native";
import React, { useState } from "react";
import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from "firebase/auth";
import CustomButton from "../components/CustomButton";
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = ({ user, setUser }) => {
  const {
    container,
    headerText,
    text,
    font,
    input,
    button,
    section
  } = styles;
  console.log("Register Screen", user);

  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false)

  const updateUserInfo = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      console.log("Updated sucessfully");
    } catch (err) {
      console.error(err.message);
    }
  }

  //Need the user to be signed in in order to change the name
  const logInForASeconds = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Currently logged in");
      updateUserInfo();
    } catch (err) {
      console.error(err.message);
    } finally {
      signOut(auth);
    }
  }


  const handleRegister = async () => {
    setLoading(true);
    try {
      if (password === confirmPass) {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("Successfully registered");
        logInForASeconds();
        navigation.navigate("Login");

      } else { alert("Pass not match") }
    } catch (error) {
      console.log(error);
      alert('Failed: ' + error.message)
    } finally {
      setLoading(false);
    }
  }


  return (
    <View style={container}>
      <View>
        <Text style={[headerText, { fontFamily: "NotoSans-SemiBold" }]}>REGISTER</Text>
      </View>


      <View style={[section, { justifyContent: "center" }]}>
        <View>
          <Text style={[text, font]}>Name</Text>
          <TextInput
            style={[input, font]}
            onChangeText={(text) => setName(text)} />
        </View>
        <View>
          <Text style={[text, font]}>Email</Text>
          <TextInput
            style={[input, font]}
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text)}
          />
        </View>
        <View>
          <Text style={[text, font]}>Phone</Text>
          <TextInput
            style={[input, font]}
            keyboardType="numeric"
            onChangeText={(text) => setPhone(text)}
          />
        </View>
        <View>
          <Text style={[text, font]}>Password</Text>
          <TextInput
            value={password}
            style={[input, font]}
            secureTextEntry={true}
            onChangeText={text => setPassword(text)}
          />
        </View>
        <View>
          <Text style={[text, font]}>Confirm Password</Text>
          <TextInput
            value={confirmPass}
            style={[input, font]}
            secureTextEntry={true}
            onChangeText={text => setConfirmPass(text)}
          />
        </View>

        <CustomButton
          title="Register"
          style={button}
          textColor="white"
          loading={loading}
          textStyle={[text, font, { textAlign: "center", marginTop: 7 }]}
          onPress={handleRegister}
        />
        <Pressable
          onPress={() => navigation.navigate("Login")}
        >
          <Text
            style={[text, font, {
              color: "#D64045",
              textDecorationLine: "underline",
              textTransform: "capitalize",
              fontFamily: "NotoSans-SemiBold"
            }]}
          >
            I already have an account.
          </Text>
        </Pressable>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 24,
    color: "#D64045",
    textAlign: "left",
    top: -50,
    margin: 10,
    marginLeft: 50,
  },
  text: {
    color: "#000000",
    marginVertical: 10,
    fontSize: 12,
    paddingLeft: 10,
    textTransform: "uppercase",
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
    alignItems: "center",
  },
  button: {
    width: 191,
    height: 37,
    backgroundColor: "#D64045",
    borderRadius: 20,
    flexShrink: 0,
    marginTop: 50,
  },
})

export default RegisterScreen;