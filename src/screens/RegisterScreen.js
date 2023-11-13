import { StyleSheet, Text, View, TextInput, Pressable } from "react-native";
import React, { useState } from "react";
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import CustomButton from "../components/CustomButton";
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = () => {
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setLoading(true);
    try {
        if (password===confirmPass){
          await createUserWithEmailAndPassword(auth, email, password);
          navigation.navigate("Login")
        } else {alert("Pass not match")}
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

      <Text style={headerText}>REGISTER</Text>

      </View>

    
    <View style={[section, { justifyContent: "center" }]}>

      <View>
        <Text style={text}>Name</Text>
        <TextInput style={input} onChangeText={(text) =>setName(text)}></TextInput>
      </View>
      <View>
        <Text style={text}>Email</Text>
        <TextInput style={input} onChangeText={(text) =>setEmail(text)}></TextInput>
      </View>
      <View>
        <Text style={text}>Phone</Text>
        <TextInput style={input} onChangeText={(text) =>setPhone(text)}></TextInput>
      </View>
      <View>
        <Text style={text}>Password</Text>
        <TextInput secureTextEntry={true} value={password} style={input} onChangeText={text =>setPassword(text)}></TextInput>
      </View>
      <View>
        <Text style={text}>Confirm Password</Text>
        <TextInput secureTextEntry={true} value={confirmPass} style={input} onChangeText={text =>setConfirmPass(text)}></TextInput>
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
              fontWeight:"bold",
            }]}
          >
            I already have an account.
          </Text>
        </Pressable>
        </View>
    </View>
  )
}

export default RegisterScreen

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
    margin:10,
    marginLeft:50,
    fontWeight:"bold",
  },
  text: {
    color: "#000000",
    marginVertical: 10,
    fontSize: 12,
    paddingLeft: 10,
    textTransform:"uppercase",
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
    marginTop:50,
  },
})