import React from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native"; 
import CustomButton from "../components/CustomButton";
import { loadFonts } from "../shared/utils";

const GetStartedScreen = () => {
  const navigation = useNavigation();
  const { container, buttonContainer, button, text } = styles;
  const [fontsLoaded] = loadFonts();

  if(!fontsLoaded) {
    return null
  }
  
  return (
    <View style={container}>
      <View style={buttonContainer}>
        <CustomButton
          title="Register"
          style={button}
          textStyle={text}
          textColor="#D64045"
          onPress={() => navigation.navigate("Register")}
        />
        <CustomButton
          title="Login"
          style={button}
          textStyle={text}
          textColor="#D64045"
          onPress={() => navigation.navigate("Login")}
        />
      </View>
      <Text style={[text, { color: "white" }]}>THESIS APP | 2024</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#D64045",
  },
  buttonContainer: {
    height: Dimensions.get("window").height - 200,
    justifyContent: "flex-end",
    alignItems: "center",
    rowGap: 15
  },
  button: {
    width: 191,
    height: 37,
    backgroundColor: "#F8F5F1",
    borderRadius: 20,
    flexShrink: 0
  },
  text: {
    textAlign: "center",
    fontFamily: "NotoSans-Medium",
    fontSize: 17,
    textTransform: "uppercase",
    paddingTop: 2
  },
})


export default GetStartedScreen;