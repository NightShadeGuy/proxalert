import {
  StyleSheet,
  View,
  Text,
  ScrollView
} from 'react-native'
import React, { useState, useEffect } from 'react'
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import CustomButton from "../components/CustomButton";
import { useFonts } from "expo-font";
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from "../config/firebase";
import { toast } from '../../utils';

const MapScreen = ({ user, setUser }) => {
  console.log("Current user", user);
  const [location, setLocation] = useState(null);
  const [details, setDetails] = useState(null);
  const [region, setRegion] = useState({
    latitude: 14.64953000,
    longitude: 120.96788000,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  const [statusButton, setStatusButton] = useState("idle");

  const fetchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      let address = await Location.reverseGeocodeAsync(location.coords);
      setDetails(address[0]);
      setLocation(location?.coords);
      console.log("Full details", details);
      console.log('Location state:', location);
      setRegion(prevRegion => (
        {
          ...prevRegion,
          latitude: location?.coords.latitude,
          longitude: location?.coords.longitude
        }
      ));
      console.log("Region state:", region);
    } catch (err) {
      toast(err.message);
    }
  }

  useEffect(() => {
    fetchUserLocation();
  }, [])


  const saveUserLocation = async () => {
    const userLocationRef = collection(db, "user-location")
    setStatusButton("submitting");
    try {
      await addDoc(userLocationRef, {
        user: user.displayName,
        uid: user.uid,
        createdAt: serverTimestamp(),
        latitude: location.latitude,
        longitude: location.longitude,
        address: { ...details }
      });
      toast("Your request has been saved.");
    } catch (err) {
      toast(err.message);
    } finally {
      setStatusButton("idle");
    }
  }


  const [fontsLoaded] = useFonts({
    "NotoSans-Medium": require("../../assets/fonts/NotoSans-Medium.ttf"),
    "NotoSans-SemiBold": require("../../assets/fonts/NotoSans-SemiBold.ttf"),
  })

  if (!fontsLoaded) {
    return undefined
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        provider={PROVIDER_GOOGLE}
        followsUserLocation
        showsUserLocation
        showsTraffic
      >
        <Marker
          coordinate={region}
          title={user?.displayName ? `User: ${user?.displayName}` : "Please Edit your name in the settings"}
          description={`${details?.streetNumber} ${details?.street} ${details?.district}`}
        />
      </MapView>

      <CustomButton
        title="SEE DETAILS"
        style={[styles.overlayButton, {
          top: 10,
          left: 50,
        }]}
        textStyle={styles.overlayButtonText}
        textColor="#D64045"
        onPress={fetchUserLocation}
      />

      <CustomButton
        title={statusButton === "submitting" ? "PROCESSING..." : "SEND LOCATION"}
        style={[styles.overlayButton, {
          bottom: 25,
          right: 105,
        }]}
        textStyle={styles.overlayButtonText}
        textColor="#D64045"
        onPress={saveUserLocation}
        statusButton={statusButton}
      />

      {/* Temporary display the data after fetching the location */}
      {details && (
        <View style={styles.overlayContainer}>
          <ScrollView
            style={{ height: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.overlayButtonText}>Country: {details?.country}</Text>
            <Text style={styles.overlayButtonText}>Country Code: {details?.isoCountryCode}</Text>
            <Text style={styles.overlayButtonText}>Region: {details?.region}</Text>
            <Text style={styles.overlayButtonText}>City: {details?.city}</Text>
            <Text style={styles.overlayButtonText}>District: {details?.district}</Text>
            <Text style={styles.overlayButtonText}>Street: {details?.street}</Text>
            <Text style={styles.overlayButtonText}>Street Number: {details?.streetNumber}</Text>
          </ScrollView>
        </View>
      )}
    </View>
  )
}

export default MapScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  overlayButton: {
    position: 'absolute',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.25,
    elevation: 5,
  },
  overlayButtonText: {
    color: "green",
    fontSize: 12,
    fontFamily: "NotoSans-SemiBold"
  },
  overlayContainer: {
    position: 'absolute',
    top: 50,
    left: 15,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 5,
    elevation: 5,
  },

})