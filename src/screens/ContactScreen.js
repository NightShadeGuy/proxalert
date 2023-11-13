import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { db } from "../config/firebase";
import { addDoc, collection } from "firebase/firestore";

const ContactScreen = () => {
  useEffect(() => {
  addDoc(collection(db, 'contacts'), { name: 'Tets', number: '0909'})
  }, [])
  return (
    <View style={styles.container}>
      <Text>ContactScreen</Text>
    </View>
  )
}

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

})