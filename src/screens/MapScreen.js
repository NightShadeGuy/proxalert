import {
  StyleSheet,
  View,
  Text,
  Modal,
  ActivityIndicator,
  TextInput,
  FlatList,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
} from 'react-native'
import React, {
  useState,
  useEffect,
  useRef
} from 'react'
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import CustomButton from "../components/CustomButton";
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from "../config/firebase";
import { toast } from '../shared/utils';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatusModal from '../components/StatusModal';
import {
  fetchAutoComplete,
  fetchDirections,
  searchByRadius
} from '../shared/api';
import polyline from '@mapbox/polyline';

const MapScreen = ({ user, setUser }) => {
  //console.log("Current user", user);
  const [details, setDetails] = useState(null);
  const [region, setRegion] = useState({
    latitude: 14.64953000,
    longitude: 120.96788000,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    altitude: 0
  })
  const [statusButton, setStatusButton] = useState("idle");
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isRoute, setIsRoute] = useState(false);

  //Autocomplete search state
  const [search, setSearch] = useState("");
  const [autoComplete, setAutoComplete] = useState([]);
  const [selectDestination, setSelectDestination] = useState(0);
  const mapRef = useRef(null);

  //console.log("Select destination", selectDestination);

  const [routes, setRoutes] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [newCoordinates, setNewCoordinates] = useState({})
  const [decodedCoordinates, setDecodedCoordinates] = useState([]);
  console.log("routes", routes);
  console.log(decodedCoordinates);

  /*   const sampleCoordinates = [  //This is the sample data structure of decodedCoordinates
    { latitude: 14.76911, longitude: 121.03853 },
    { latitude: 14.76912, longitude: 121.03841 },
    { latitude: 14.76912, longitude: 121.03791 },
    { latitude: 14.76911, longitude: 121.03718 },
  ];
 */

  const [listOfHospitals, setListOfHospitals] = useState([]);
  const [showHospitals, setShowHospitals] = useState(false);
  const [FindingHospitals, setFindingHospitals] = useState(false);

  const fetchMyLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return;
    }

    setIsFetching(true);
    try {
      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      let address = await Location.reverseGeocodeAsync(location.coords);
      setDetails(address[0]);
      console.log("Full details", details);
      console.log('Location state:', location);
      setRegion(prevRegion => (
        {
          ...prevRegion,
          latitude: location?.coords.latitude,
          longitude: location?.coords.longitude,
        }
      ));
      console.log("Region state:", region);

      const subscription = await Location.watchPositionAsync(
        { enableHighAccuracy: true, distanceInterval: 5 },
        (newLocation) => {
          console.log("Watch new position", newLocation);
          updateLocation(newLocation);
        }
      );

    } catch (error) {
      toast(error.message);
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    fetchMyLocation();
  }, [])

  const updateLocation = (location) => {
    setRegion(prevRegion => (
      {
        ...prevRegion,
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
      }
    ));
    moveCamera(location?.coords.latitude, location?.coords.longitude);

  };

  const saveUserLocation = async () => {
    const userLocationRef = collection(db, "user-location")
    setStatusButton("submitting");
    setModalVisible(true);
    try {
      const docRef = await addDoc(userLocationRef, {
        user: user.displayName,
        uid: user.uid,
        createdAt: serverTimestamp(),
        latitude: location.latitude,
        longitude: location.longitude,
        address: { ...details }
      });

      console.log("Document written:", docRef.id);
      setIsSaved(true);
    } catch (error) {
      toast(error.message);
    } finally {
      setStatusButton("idle");
      setTimeout(() => {
        setIsSaved(false);
        setModalVisible(false);
      }, 1000)
    }
  }

  const onChangeText = async (text) => {
    setSearch(text);
    if (text.length === 0) return setAutoComplete([]);
    if (text.length >= 8) {
      fetchData();
    }
  }

  const fetchData = async () => {
    try {
      const listOfData = await fetchAutoComplete(search);
      console.log("Auto complete data", listOfData);
      setAutoComplete(listOfData);
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  };

  /*   const fetchSelectedDestination = (items) => {
    
      const selectedDestination = items.filter(marker => marker.osm_id === selectDestination);
      console.log("Selected destination", selectedDestination[0]);
      const coordinates = {
        latitude: parseFloat(selectedDestination[0]?.lat),
        longitude: parseFloat(selectedDestination[0]?.lon),
      }
      setDestination(coordinates);
      console.log("destination state", destination);
  
      return coordinates;
    } */

  const fetchSelectedDestination = (items) => {
    let selectedDestination;

    if (items && items.length > 0) {
      // Check the data structure dynamically
      if (items[0].osm_id !== undefined) {
        // Structure 1: If osm_id is present directly in the item
        selectedDestination = items.find(marker => marker.osm_id === selectDestination);
      } else if (items[0].properties && items[0].properties.datasource && items[0].properties.datasource.raw) {
        // Structure 2: If osm_id is nested inside properties.datasource.raw
        selectedDestination = items.find(marker => marker.properties.datasource.raw.osm_id === selectDestination);
      }

      
      if (selectedDestination) {
        let lat, lon;

        if (typeof selectedDestination.lat === 'string') {
          lat = parseFloat(selectedDestination.lat);
        } else {
          lat = selectedDestination.properties.lat;
        }

        if (typeof selectedDestination.lon === 'string') {
          lon = parseFloat(selectedDestination.lon);
        } else {
          lon = selectedDestination.properties.lon;
        }

        const coordinates = {
          latitude: lat,
          longitude: lon
        };
        setNewCoordinates(coordinates);
        console.log("Selected destination", selectedDestination);
        console.log(`Destination state: ${coordinates.latitude}, ${coordinates.longitude}`);
        console.log(`type of my coordinates: ${typeof coordinates.latitude}, ${typeof coordinates.longitude}`);

      } else {
        console.log("Destination not found for the given selectDestination");
      }
    } else {
      console.log("No items provided for fetching destination");
    }
  };


  const updateRoute = async () => {
    console.log("new coordinates", newCoordinates);
    setIsRoute(true);
    try {
      let originCoord = `${region.longitude},${region.latitude}`;
      let destinationCoord = `${newCoordinates.longitude},${newCoordinates.latitude}`;

      console.log("my location:", originCoord, "Selected destination:", destinationCoord);

      const directionData = await fetchDirections(originCoord, destinationCoord);
      console.log("fetch data from the direction origin & destination", directionData);
      setRoutes(directionData.routes);

      const geometry = directionData.routes[0]?.legs[0].steps;
      console.log("Steps geometry", geometry);

      // Decode the polyline and set the route coordinates
      const decode = geometry.map(step => polyline.decode(step.geometry));
      setRouteCoordinates(decode);

      // Flatten the nested arrays and create coordinate objects
      const flatCoordinates = decode.flat(1); // Flatten one level
      const decodedCoords = flatCoordinates.map(coord => ({
        latitude: coord[0],
        longitude: coord[1],
      }));
      setDecodedCoordinates(decodedCoords);
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsRoute(false);
    }
  }

  /*     useEffect(() => {
        updateRoute();
        console.log("newCoordinates change: useEffect");
      }, [newCoordinates]);
   */


  const findHospitals = async () => {
    setFindingHospitals(true);
    try {
      const hospitals = await searchByRadius(
        region.latitude,
        region.longitude,
        6000
      );
      setListOfHospitals(hospitals.features);
      console.log("List of near hospital base on the location", hospitals.features);
    } catch (error) {
      console.error(error.message);
    } finally {
      setFindingHospitals(false);
      setShowHospitals(true);
    }
  }


  const moveToRegion = (latitude, longitude, latitudeDelta, longitudeDelta) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta,
        },
        1000  //duration
      );
    }
  };

  const moveCamera = (latitude, longitude) => {
    if (mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: latitude,
          longitude: longitude
        },
        pitch: 90,
        heading: 90,   //Need to calculateDirectionAngle, 0 Camera points north. 90: Camera points east. 180: Camera points south. 270: Camera points west.
        altitude: 20,
        zoom: 30
      },
        1000  //duration
      );
    }
  };


  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        //region={region}
        initialRegion={region}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        followsUserLocation
      //showsTraffic
      >
        {details && (
          <Marker
            coordinate={region}
            title={user?.displayName ? `User: ${user?.displayName}` : "Please Edit your name in the settings"}
            description={`${details?.streetNumber} ${details?.street} ${details?.district}`}
          >
            <MaterialCommunityIcons
              name="human-handsup"
              size={40}
              color="green"
            />
          </Marker>
        )}

        {/* Display only 1 marker base on selected destination  */}
        {autoComplete.length > 0 && (
          autoComplete.filter(marker => marker.osm_id === selectDestination)
            .map(marker => (
              <Marker
                key={marker.osm_id}
                coordinate={{
                  latitude: parseFloat(marker.lat),
                  longitude: parseFloat(marker.lon),
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                title={`${marker.address.name}, ${marker.address.state}`}
                description={marker.display_address}
              />
            ))
        )}

        {listOfHospitals.length > 0 && (
          listOfHospitals.filter(marker => marker.properties.datasource.raw.osm_id === selectDestination)
            .map(marker => (
              <Marker
                key={marker.properties.datasource.raw.osm_id}
                coordinate={{
                  latitude: parseFloat(marker.properties.lat),
                  longitude: parseFloat(marker.properties.lon),
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                title={marker.properties.address_line1}
                description={marker.properties.address_line2}
              >
                <MaterialCommunityIcons
                  name="hospital-marker"
                  size={30}
                  color="#D64045"
                />
              </Marker>
            ))
        )}

        {decodedCoordinates.length > 0 && (
          <Polyline
            coordinates={decodedCoordinates}
            strokeColor="#7b64ff"
            strokeWidth={5}
          />
        )}
      </MapView>

      <CustomButton
        title={statusButton === "submitting" ? "Processing..." : "Send Location"}
        style={[styles.overlayButton, {
          bottom: 19,
          right: 115,
        }]}
        textStyle={styles.overlayButtonText}
        textColor="#D64045"
        onPress={saveUserLocation}
        statusButton={statusButton}
      />
      {listOfHospitals.length > 0 && (
        <MaterialCommunityIcons
          name="hospital-box-outline"
          size={24}
          color="#1273de"
          style={[styles.overlayButton, {
            bottom: 165,
            right: 10,
            paddingHorizontal: 10,
          }]}
          onPress={() => setShowHospitals(true)}
        />
      )}
      <FontAwesome5
        name="route"
        size={24}
        color="#1273de"
        style={[styles.overlayButton, {
          bottom: 115,
          right: 10,
          paddingHorizontal: 10,
        }]}
        onPress={updateRoute}
      />
      <MaterialIcons
        name="my-location"
        size={24}
        color="#1273de"
        style={[styles.overlayButton, {
          bottom: 65,
          right: 10,
          paddingHorizontal: 10,
        }]}
        onPress={fetchMyLocation}
      />
      <View style={{
        position: "absolute",
        left: 10,
        right: 10,
        top: 10,
        backgroundColor: "white",
        maxHeight: search.length > 8 ? 200 : 50,
        paddingVertical: 5,
        borderRadius: 20,
        shadowColor: "#000",
        shadowRadius: 5,
        shadowOpacity: 0.25,
        elevation: 5,
      }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: search.length > 8 && autoComplete.length > 0 ? 1 : 0,
            borderColor: "#c8c8c9"
          }}
        >
          <TextInput
            placeholder='Search'
            value={search}
            onChangeText={onChangeText}
            style={styles.input}
          />
          {search.length > 0 && (
            <AntDesign
              name="close"
              size={24}
              color="black"
              onPress={() => setSearch("")}
            />
          )}
          {search.length == 0 && (
            <TouchableHighlight
              activeOpacity={0.6}
              underlayColor="#DDDDDD"
              style={{ borderRadius: 20, padding: 4 }}
              onPress={findHospitals}
            >
              <MaterialCommunityIcons
                name="hospital-marker"
                size={24}
                color="#D64045"
              />
            </TouchableHighlight>
          )}
        </View>
        <FlatList
          data={autoComplete}
          keyExtractor={item => item.osm_id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.listData}
              onPress={() => {
                setSelectDestination(item.osm_id);
                fetchSelectedDestination(autoComplete);
                moveToRegion(
                  parseFloat(item.lat),
                  parseFloat(item.lon),
                  0.0922,
                  0.0421
                );
                //Alert.alert(item.type, `${item.display_name}`);
              }}
            >
              <FontAwesome5
                name={item.type == "hospital" ? "hospital" : "map-marker-alt"}
                size={24}
                color="#D64045"
              />
              <View>
                <Text style={styles.defaultFont}>
                  {item.address.name}, {item.address.state}
                </Text>
                <Text style={[styles.defaultFont, { fontSize: 10, color: "black", marginRight: 10, }]}>{item.display_address}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Temporary display the data after fetching the location */}
      {details && (
        <View style={styles.overlayContainer}>
          <ScrollView
            style={{ height: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Checking to see if the data changes when the user is moving */}
            <Text style={styles.overlayButtonText}>Latitude: {region.latitude}</Text>
            <Text style={styles.overlayButtonText}>Longitude: {region.longitude}</Text>
            <Text style={styles.overlayButtonText}>Routes: {decodedCoordinates.length}</Text>

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

      <Modal
        animationType='slide'
        transparent
        visible={showHospitals}
        onRequestClose={() => setShowHospitals(!showHospitals)}
      >
        <View style={{
          flex: 1,
          alignItems: 'center',
          backgroundColor: "rgba(0, 0, 0, 0.2)"
        }}>
          <View style={{
            backgroundColor: "white",
            position: "absolute",
            height: "50%",
            bottom: 0,
            width: "100%",
            borderTopWidth: 5,
            borderColor: "#D64045",
          }}>
            <FontAwesome
              name="arrow-down"
              size={19}
              color="white"
              style={{
                position: "absolute",
                top: -40,
                left: 110,
                backgroundColor: "#D64045",
                paddingHorizontal: 50,
                paddingVertical: 10,
                height: 40,
                borderTopLeftRadius: 100,
                borderTopRightRadius: 100
              }}
              onPress={() => setShowHospitals(!showHospitals)}
            />
            <FlatList
              data={listOfHospitals}
              keyExtractor={item => item.properties.datasource.raw.osm_id}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[styles.listData, {
                    backgroundColor: item.properties.datasource.raw.osm_id === selectDestination
                      ? "rgba(125, 205, 235, 0.3)"
                      : "transparent"
                  }]}
                  onPress={() => {
                    setSelectDestination(item.properties.datasource.raw.osm_id);
                    setShowHospitals(!showHospitals);
                    fetchSelectedDestination(listOfHospitals);
                    moveToRegion(
                      parseFloat(item.properties.lat),
                      parseFloat(item.properties.lon),
                      0.0922,
                      0.0421
                    );
                  }}
                >
                  <FontAwesome5
                    name="hospital"
                    size={24}
                    color="#D64045"
                  />
                  <View>
                    <Text style={styles.headerHospital}>{item.properties.address_line1}</Text>
                    <Text style={[styles.defaultFont, { marginBottom: 2 }]}>{item.properties.address_line2}</Text>
                    <Text style={[styles.defaultFont, styles.distance]}>
                      Distance: {item.properties.distance}m
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListHeaderComponent={() => (
                <Text
                  style={[styles.headerHospital, styles.headerTitle]}
                >
                  List of Hospital base on your Location
                </Text>
              )}
              ItemSeparatorComponent={() => (
                <View style={{ borderWidth: 1, borderColor: "gray" }}></View>
              )}
            />
          </View>

        </View>
      </Modal >

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {isSaved ? (
              <Ionicons name="md-checkmark-circle" size={30} color="#4caf50" />)
              : (<ActivityIndicator size={40} color="#0288D1" />)
            }
            <Text style={{ fontFamily: "NotoSans-SemiBold", color: "gray" }}>
              {isSaved ? "Your request has been saved." : "Processing..."}
            </Text>
          </View>
        </View>
      </Modal>

      {isFetching && (
        <StatusModal
          status={isFetching}
          setStatus={setIsFetching}
          message="We're finding your location..."
        />
      )}
      {isRoute && (
        <StatusModal
          status={isRoute}
          setStatus={setIsRoute}
          message="Creating a route..."
        />
      )}
      {FindingHospitals && (
        <StatusModal
          status={FindingHospitals}
          setStatus={setFindingHospitals}
          message="We're looking a hospitals"
        />
      )}

    </View >
  )
}

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
  input: {
    height: 40,
    marginHorizontal: 12,
    paddingHorizontal: 10,
    width: "80%"
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 90, //default  top: 50
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)"
  },
  modalView: {
    backgroundColor: "white",
    width: "85%",
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 20,
    columnGap: 20,
    borderRadius: 4,
    shadowColor: '#000',
    elevation: 5
  },
  listData: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    columnGap: 6,
  },
  defaultFont: {
    fontFamily: "NotoSans-SemiBold",
    fontSize: 12
  },
  headerHospital: {
    fontFamily: "NotoSans-Bold",
    fontSize: 14
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 16,
    paddingTop: 3,
    paddingBottom: 6,
    backgroundColor: "#D64045",
    color: "white",
  },
  distance: {
    backgroundColor: "#7b64ff",
    color: "white",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 50,
    maxWidth: 150,
    textAlign: "center"
  }

})

export default MapScreen;