import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  LayoutAnimation
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
  accountsRef,
  defaultTheme,
  showToast,
  toast
} from "../shared/utils";

const RegisterScreen = ({ user, setUser }) => {
  const {
    headerText,
    row,
    text,
    font,
    optional,
    input,
    button,
    section
  } = styles;
  console.log("Register Screen", user);

  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [selectTypeResponder, setSelectTypeResponder] = useState(null);
  const [registerAsResponder, setRegisterAsResponder] = useState(false);
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setLoading(true);
    try {
      if (password === confirmPass) {
        await createUserWithEmailAndPassword(auth, email, password);
        await logInForASeconds();
        navigation.navigate("Login");

        showToast("You successfully created an account.");
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
      showToast("Error", err.message, "error");
    } finally {
      signOut(auth);
    }
  }

  const updateUserInfo = async () => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoUrl
      });
      console.log("update profile sucessfully");
    } catch (error) {
      console.error(error.message);
      showToast("Error", error.message, "error");
    }
  }

  const addAccountToDB = async (user) => {
    try {
      const docRef = await addDoc(accountsRef, {
        user: name,
        uid: user.uid,
        contactNumber: phone,
        createAt: serverTimestamp(),
        isResponder: registerAsResponder,
        sortResponder: registerAsResponder ? selectTypeResponder : null
      })
      console.log("New account has been uploaded to db", docRef.id);
    } catch (error) {
      console.error(error.message);
      showToast("Error", error.message, "error");
    }
  }


  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[headerText, { fontFamily: "NotoSans-SemiBold" }]}>REGISTER</Text>

      <View style={section}>
        <View>
          <View style={row}>
            <Text style={[text, font]}>Name</Text>
            <Text style={[[text, font, optional]]}>
              (required)
            </Text>
          </View>
          <TextInput
            style={[input, font]}
            onChangeText={(text) => setName(text)} />
        </View>
        <View>
          <View style={row}>
            <Text style={[text, font]}>Email</Text>
            <Text style={[[text, font, optional]]}>
              (required)
            </Text>
          </View>
          <TextInput
            style={[input, font]}
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text)}
          />
        </View>
        <View>
          <View style={row}>
            <Text style={[text, font]}>Phone</Text>
            <Text style={[[text, font, optional]]}>
              (required)
            </Text>
          </View>
          <TextInput
            style={[input, font]}
            keyboardType="numeric"
            onChangeText={(text) => setPhone(text)}
          />
        </View>
        <View>
          <View style={row}>
            <Text style={[text, font]}>Photo URL</Text>
            <Text style={[[text, font, optional]]}>
              (Optional)
            </Text>
          </View>
          <TextInput
            style={[input, font]}
            onChangeText={(text) => setPhotoUrl(text)}
          />
        </View>
        <View>
          <View style={row}>
            <Text style={[text, font]}>Password</Text>
            <Text style={[[text, font, optional]]}>
              (required)
            </Text>
          </View>
          <TextInput
            value={password}
            style={[input, font]}
            secureTextEntry={true}
            onChangeText={text => setPassword(text)}
          />
        </View>
        <View>
          <View style={row}>
            <Text style={[text, font]}>Confirm Password</Text>
            <Text style={[[text, font, optional]]}>
              (required)
            </Text>
          </View>
          <TextInput
            value={confirmPass}
            style={[input, font]}
            secureTextEntry={true}
            onChangeText={text => setConfirmPass(text)}
          />
        </View>


        <View>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              columnGap: 5,
              paddingHorizontal: 20,
            }}
            onPress={() => {
              setRegisterAsResponder(!registerAsResponder)
              LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
              setSelectTypeResponder(null);
            }}
          >
            <Octicons
              name={registerAsResponder ? "dot-fill" : "dot"}
              size={40}
              color={registerAsResponder ? defaultTheme : "gray"}
            />
            <Text style={font}>Would you like to register as a responder?</Text>
          </TouchableOpacity>
        </View>

        {registerAsResponder && (
          <>
            <Text style={[font, { color: "gray" }]}>What sort of responder are you?</Text>
            <ScrollView
              style={{ marginVertical: 20 }}
              contentContainerStyle={{ flexDirection: "row", columnGap: 10 }}
              showsHorizontalScrollIndicator={false}
            >
              <TouchableOpacity
                style={[styles.card, {
                  backgroundColor: selectTypeResponder === "Medical" ? "#E0E0E0" : "transparent",
                  opacity: selectTypeResponder === "Medical" ? 1 : 0.5
                }]}
                onPress={() => setSelectTypeResponder("Medical")}
              >
                <Image
                  source={require("../.././assets/images/nurse.png")}
                  style={styles.responderImage}
                />
                <Text style={[font, { color: "gray" }]}>Medical</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.card, {
                  backgroundColor: selectTypeResponder === "Police" ? "#E0E0E0" : "transparent",
                  opacity: selectTypeResponder === "Police" ? 1 : 0.5
                }]}
                onPress={() => setSelectTypeResponder("Police")}
              >
                <Image
                  source={require("../.././assets/images/policeman.png")}
                  style={styles.responderImage}
                />
                <Text style={[font, { color: "gray" }]}>Police</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.card, {
                  backgroundColor: selectTypeResponder === "Fire fighter" ? "#E0E0E0" : "transparent",
                  opacity: selectTypeResponder === "Fire fighter" ? 1 : 0.5
                }]}
                onPress={() => setSelectTypeResponder("Fire fighter")}
              >
                <Image
                  source={require("../.././assets/images/firefighter.png")}
                  style={styles.responderImage}
                />
                <Text style={[font, { color: "gray" }]}>Fire Fighter</Text>
              </TouchableOpacity>
            </ScrollView>
          </>
        )}

        <CustomButton
          title="Register"
          style={button}
          textColor="white"
          loading={loading}
          textStyle={[text, font, { textAlign: "center", marginTop: 7 }]}
          onPress={handleRegister}
        />
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            setRegisterAsResponder(false);
            setSelectTypeResponder(null);
            navigation.navigate("Login")
          }}
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
        </TouchableOpacity>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: -5
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
  optional: {
    color: "gray",
    fontSize: 11,
    textTransform: "lowercase"
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
    marginTop: 10
  },
  card: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 10
  },
  responderImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  }
})

export default RegisterScreen;