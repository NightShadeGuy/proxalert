import {
  StyleSheet,
  View,
  Dimensions,
  Alert,
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { toast } from "../../utils";
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import CustomButton from "../components/CustomButton";
import { useFonts } from "expo-font";

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [details, setDetails] = useState(null);
  const [region, setRegion] = useState({
    latitude: 14.64953,
    longitude: 120.96788,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })

  const fetchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    try {
      let currLocation = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      const position = {
        latitude: currLocation.coords?.latitude,
        longitude: currLocation.coords?.longitude
      }
      const address = await Location.reverseGeocodeAsync(position);
      setDetails(address[0]);
      console.log("Full details", details);

      console.log('Current location before state update:', currLocation);
      setLocation(currLocation?.coords);
      setRegion(prevRegion => (
        {
          ...prevRegion,
          latitude: location?.latitude,
          longitude: location?.longitude
        }
      ));

      // Log the state to ensure it's set correctly
      console.log('Location state:', location);
      console.log("Region state:", region);
    } catch (err) {
      toast(err.message);
    }
  }

  useEffect(() => {
    fetchUserLocation();
  }, [location])

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
        showsUserLocation
        showsTraffic
        showsCompass
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location?.latitude,
              longitude: location?.longitude
            }}
            title={`${details?.region}, ${details?.city} City`}
            description={`${details?.streetNumber} ${details?.street} ${details?.district}`}
          />
        )}
      </MapView>
     
      <CustomButton
        title="SEND LOCATION"
        style={styles.overlayButton}
        textStyle={styles.overlayButtonText}
        textColor="#D64045"
        onPress={() => Alert.alert("Alert", "Send location is currently not working.")}
      />
    </View>
  )
}

export default MapScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  overlayButton: {
    position: 'absolute',
    bottom: 25,
    right: 110,
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
    color: "#D64045",
    fontSize: 12,
    fontFamily: "NotoSans-SemiBold"
  },
})