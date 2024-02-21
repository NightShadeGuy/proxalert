import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  TouchableOpacity,
  Alert
} from "react-native";
import React, { useState } from "react";
import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import CustomButton from "../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { Octicons } from '@expo/vector-icons';
import {
  clientAccountRef,
  responderAccountRef,
  defaultTheme,
  toast
} from "../shared/utils";

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [registerAsResponder, setRegisterAsResponder] = useState(false);
  const [loading, setLoading] = useState(false)


  const handleRegister = async () => {
    setLoading(true);
    try {
      if (password === confirmPass) {
        await createUserWithEmailAndPassword(auth, email, password);
        await logInForASeconds();
        navigation.navigate("Login");

        toast("You can now login your account");
      } else {
        alert("Password doesn't match")
      }
    } catch (error) {
      console.log(error);
      alert('Failed: ' + error.message)
    } finally {
      setLoading(false);
    }
  }

  //User need to be signed in in order to change the name
  const logInForASeconds = async () => {
    try {
      const docs = await signInWithEmailAndPassword(auth, email, password);
      await addAccountToDB(docs.user);
      await updateUserInfo();

      console.log("logInForASeconds", docs.user);
    } catch (err) {
      console.error(err.message);
    } finally {
      signOut(auth);
    }
  }

  const updateUserInfo = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      console.log("update profile sucessfully");
    } catch (error) {
      console.error(error.message);
    }
  }

  const addAccountToDB = async (user) => {
    try {
      const useCollection = registerAsResponder ? responderAccountRef : clientAccountRef;
      const docRef = await addDoc(useCollection, {
        user: name,
        uid: user.uid,
        /* email: email, */
        contactNumber: phone,
        /* password: password, */
        createAt: serverTimestamp(),
        isResponder: registerAsResponder
      })
      console.log("New account has been uploaded to db", docRef.id);
    } catch (error) {
      console.error(error.message);
    }
  }


  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[headerText, { fontFamily: "NotoSans-SemiBold" }]}>REGISTER</Text>

      <View style={section}>
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


        <View>
          <Text
            style={{
              justifyContent: "flex-start",
              color: "gray",
              marginVertical: 10,
              marginLeft: 10
            }}
          >
            (Optional)
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              columnGap: 5,
              paddingHorizontal: 20,
            }}
            onPress={() => setRegisterAsResponder(!registerAsResponder)}
          >
            <Octicons
              name={registerAsResponder ? "dot-fill" : "dot"}
              size={40}
              color={registerAsResponder ? defaultTheme : "gray"}
            />
            <Text style={[font]}>Do you want to register as responder?</Text>
          </TouchableOpacity>
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
              color: defaultTheme,
              textDecorationLine: "underline",
              textTransform: "capitalize",
              fontFamily: "NotoSans-SemiBold"
            }]}
          >
            I already have an account.
          </Text>
        </Pressable>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 24,
    color: defaultTheme,
    textAlign: "left",
    margin: 10,
    marginLeft: 30,
    paddingTop: 20
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
    backgroundColor: defaultTheme,
    borderRadius: 20,
    flexShrink: 0,
    marginTop: 50,
  },
})

export default RegisterScreen;