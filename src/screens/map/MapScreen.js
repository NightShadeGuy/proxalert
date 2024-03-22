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
  Pressable,
  Image
} from 'react-native'
import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect
} from 'react'
import * as Location from 'expo-location';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE
} from 'react-native-maps';
import { db, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import {
  toast,
  defaultTheme,
  sendNotification
} from '../../shared/utils';
import {
  AntDesign,
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
  Feather
} from '@expo/vector-icons';
import StatusModal from '../../components/StatusModal';
import {
  fetchAutoComplete,
  fetchDirections,
  searchByRadius
} from '../../shared/api';
import polyline from '@mapbox/polyline';
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from '@react-navigation/native';
import { emergencyRequestRef, emergencyTypes } from "../../shared/utils";
import EmergencyRequestCard from '../../components/EmergencyRequestCard';
import AcceptRequestCard from '../../components/AcceptRequestCard';
import CompletedRequestModal from '../../components/CompletedRequestModal';

const MapScreen = ({
  user,
  setUser,
  accountDetails,
  expoPushToken,
  respondersToken
}) => {
  const navigation = useNavigation();
  //console.log("Current user", user);
  //console.log("accounts details", accountDetails);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  useLayoutEffect(() => {  //use for UI loads
    navigation.setOptions({
      headerTitle: "Need Emergency Asistance?",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowProfileDetails(!showProfileDetails)}
        >
          <MaterialCommunityIcons
            name={showProfileDetails ? "account-details" : "account-details-outline"}
            size={25}
            color="white"
          />
        </TouchableOpacity>
      )
    })
  }, [showProfileDetails])


  const [details, setDetails] = useState(null);
  const [region, setRegion] = useState({
    latitude: 14.64953000,
    longitude: 120.96788000,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    altitude: 0
  })
  const [isRoute, setIsRoute] = useState(false);

  //Request Emergency state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [reportLocation, setReportLocation] = useState("");
  const [selectEmergencyType, setSelectEmergencyType] = useState(null);
  const [selectResponderNeed, setSelectResponderNeed] = useState(null);
  const [message, setMessage] = useState("");
  const [emergencyStatus, setEmergencyStatus] = useState("waiting");
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  //Onsnaphot state
  const [emergencyRequest, setEmergencyRequest] = useState([]);
  const [acceptedRequest, setAcceptedRequest] = useState(null);

  const [completedRequestShowModal, setCompletedRequestShowModal] = useState(false);

  //emergency profile state
  const [showRequestModal, setShowRequestModal] = useState(false);



  //Autocomplete search state
  const [search, setSearch] = useState("");
  const [autoComplete, setAutoComplete] = useState([]);
  const [selectDestination, setSelectDestination] = useState(0);
  const mapRef = useRef(null);

  //console.log("Select destination", selectDestination);

  const [routes, setRoutes] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [newCoordinates, setNewCoordinates] = useState(null)
  console.log("New coordinates", newCoordinates);
  const [decodedCoordinates, setDecodedCoordinates] = useState([]);
  console.log("routes", routes);
  console.log("decoded", decodedCoordinates);

  const [listOfHospitals, setListOfHospitals] = useState([]);
  const [showHospitals, setShowHospitals] = useState(false);
  const [FindingHospitals, setFindingHospitals] = useState(false);

  const [image, setImage] = useState(null);

  const fetchMyLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      let address = await Location.reverseGeocodeAsync(location.coords);
      setDetails(address[0]);
      setReportLocation(`${address[0].city}, ${address[0].region} ${address[0].streetNumber} ${address[0].street} ${address[0].district}`)
      //console.log("address", details);
      //console.log('Location state:', location);
      setRegion(prevRegion => (
        {
          ...prevRegion,
          latitude: location?.coords.latitude,
          longitude: location?.coords.longitude,
        }
      ));

      const subscription = await Location.watchPositionAsync(
        {
          enableHighAccuracy: true,
          distanceInterval: 5
        },
        (newLocation) => {
          updateLocation(newLocation);
        }
      );

    } catch (error) {
      toast(error.message);
    }
  }

  useEffect(() => {
    fetchMyLocation();
  }, [])

  const updateLocation = async (location) => {
    let newAddress = await Location.reverseGeocodeAsync(location?.coords);
    setDetails(newAddress[0]);
    setRegion(prevRegion => (
      {
        ...prevRegion,
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
      }
    ));
    moveCamera(location?.coords.latitude, location?.coords.longitude);
    updateRoute(location?.coords.latitude, location?.coords.longitude);

    console.log("Watch new position", location);
    console.log("New address", newAddress[0]);

    if (acceptedRequest && (region.latitude !== location.coords.latitude || region.longitude !== location.coords.longitude)) {
      updateUserLocationToDB(
        location.coords.latitude,
        location.coords.longitude,
        acceptedRequest.id
      );
    }
  };

  const requestEmergency = async () => {
    try {
      if (selectEmergencyType && selectResponderNeed && reportLocation) {
        setShowEmergencyModal(false);
        setModalVisible(true);

        const docRef = await addDoc(emergencyRequestRef, {
          user: user.displayName,
          uid: user.uid,
          contactNumber: accountDetails.contactNumber,
          photoUrl: user.photoURL,
          proofPhotoUrl: image ? await uploadMedia() : null,
          emergencyType: selectEmergencyType,
          requestedResponder: selectResponderNeed,
          message: message ? message : null,
          emergencyStatus: emergencyStatus,
          createdAt: serverTimestamp(),
          latitude: region.latitude,
          longitude: region.longitude,
          fullAddress: reportLocation,
          address: { ...details },
          notificationToken: expoPushToken ? expoPushToken : null,
          showCompletedModal: false
        });

        console.log("Document written:", docRef.id);
        setIsSaved(true);

        sendNotification(
          respondersToken,
          `An assistance request has been made by ${user.displayName}.`,
          `The sort of emergency is ${selectEmergencyType}.`
        )
      } else {
        toast("You need to select your emergency, location and your responder");
      }
    } catch (error) {
      toast(error.message);
    } finally {
      setTimeout(() => {
        setIsSaved(false);
        setModalVisible(false);

        if (selectEmergencyType && reportLocation) {
          setShowRequestModal(true); // state for emergency request modal
        }

        setSelectEmergencyType(null);
        setImage(null);
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

  const updateUserLocationToDB = async (latitude, longitude, documentId) => {
    try {
      const emergencyRequestRef = doc(db, "emergency-request", documentId);
      const docSnapshot = await getDoc(emergencyRequestRef);

      if (docSnapshot.exists()) {
        const existingData = docSnapshot.data();

        console.log("existingdata", existingData);

        await updateDoc(emergencyRequestRef, {
          ...existingData,
          latitude,
          longitude
        });

        console.log("Successfully updated the coordinates of user in DB");
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  const fetchSelectedDestination = (items, selectDestination) => {
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
      }
    }
  };

  const createRoute = async (myLocationLat, myLocationLong, destinationLat, destinationLong) => {
    console.log("new coordinates", newCoordinates);
    setIsRoute(true);
    try {
      let originCoord = `${myLocationLong},${myLocationLat}`;
      let destinationCoord = `${destinationLong},${destinationLat}`;

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

  // Function to calculate distance between two points
  function distance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180; // Convert degrees to radians
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }


  const updateRoute = (myLatitude, myLongitude) => {
    console.log("UpdateRoute current loc latitude:", myLatitude, " longitude:", myLongitude);
    const distanceThreshold = 0.05; // Adjust as needed
    const direction = [...decodedCoordinates];

    // Calculate distance between current location and the first coordinate
    const dist = distance(
      myLatitude,
      myLongitude,
      direction[0]?.latitude,
      direction[0]?.longitude
    );
    console.log("dist", dist);

    // If the distance is less than the threshold, remove the first coordinate
    if (dist <= distanceThreshold) {
      direction.shift();
      setDecodedCoordinates(direction);
      console.log("Updated route:", direction);
    } else {
      console.log("Still on track.");
    }
  };

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
        heading: 0,
        altitude: 20,
        zoom: 20
      },
        1000  //duration
      );
    }
  };

  const loadEmergencyRequest = async () => {
    const q = query(emergencyRequestRef,
      where("uid", "==", user.uid),
      where("emergencyStatus", "==", "waiting"),
      orderBy("createdAt", "desc")
    );

    onSnapshot(q, (querySnapshot) => {
      const requestEmergency = querySnapshot.docs.map(doc => (
        { ...doc.data(), id: doc.id }
      ))
      setEmergencyRequest(requestEmergency);

      console.log("User emergency request snapshot", requestEmergency);
    })
  }

  const loadAcceptedRequest = async () => {
    const q = query(emergencyRequestRef,
      where("uid", "==", user.uid),
      where("emergencyStatus", "==", "accepted"),
      orderBy("createdAt", "desc")
    );

    onSnapshot(q, (querySnapshot) => {
      const acceptedEmergencyRequest = querySnapshot.docs.map(doc => (
        { ...doc.data(), id: doc.id }
      ))
      console.log("User accepted request snapshot", acceptedEmergencyRequest);

      const getUserInfo = acceptedEmergencyRequest.find(info => info.uid === user.uid);
      if (getUserInfo) {
        setAcceptedRequest(getUserInfo);
        setShowRequestModal(false); //this will the hide the modal when responder accept the request
      } else {
        setAcceptedRequest(null);
      }
    })
  }

  useEffect(() => {
    loadEmergencyRequest();
    loadAcceptedRequest();
  }, [])


  useEffect(() => {
    console.log("Your accepted request", acceptedRequest);
  }, [acceptedRequest]);


  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Check if assets array is not empty
      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setImage(imageUri);
      } else {
        // Handle case when assets array is empty
        console.log('No image selected');
      }
    }
  };

  const uploadMedia = async () => {
    // Create a reference to the path in Firebase Storage
    const storageRef = ref(storage, 'images/' + new Date().toISOString());

    // Convert image URI to Blob
    const response = await fetch(image);
    const blob = await response.blob();

    try {
      // Upload blob to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Image uploaded:', downloadURL);

      return downloadURL;

    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }


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
            title={`Me: ${user?.displayName}`}
            description={`${details?.streetNumber} ${details?.street} ${details?.district}`}
          >
            {user.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 20,
                }}
              />
            ) : (
              <MaterialCommunityIcons
                name="human-handsup"
                size={40}
                color="green"
              />
            )}
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
                  color={defaultTheme}
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

        {/* Responder coordinates */}
        {acceptedRequest && acceptedRequest.latitude && acceptedRequest.longitude && (
          <Marker
            coordinate={{
              latitude: acceptedRequest.responder.latitude,
              longitude: acceptedRequest.responder.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            title={`Responder: ${acceptedRequest.responder.name}`}
            description={`Contact number: ${acceptedRequest.responder.contactNumber}`}
          >
            <Image
              source={{ uri: acceptedRequest.responder.photoUrl }}
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
              }}
            />
          </Marker>
        )}

        {acceptedRequest && acceptedRequest.direction && acceptedRequest.direction.length > 0 && (
          <Polyline
            coordinates={acceptedRequest.direction}
            strokeColor="#7b64ff"
            strokeWidth={5}
          />
        )}
      </MapView>

      <TouchableOpacity
        activeOpacity={0.5}
        style={[styles.overlayButton, {
          bottom: 19,
          right: 100,
          backgroundColor: emergencyRequest.length > 0 ? "rgb(240, 240, 240)" : "white"
        }]}
        onPress={() => setShowEmergencyModal(!showEmergencyModal)}
        disabled={emergencyRequest.length > 0}
      >
        <Text style={[styles.overlayButtonText, {
          color: emergencyRequest.length > 0 ? "silver" : defaultTheme
        }]}
        >Request Emergency</Text>
      </TouchableOpacity>


      <TouchableOpacity
        activeOpacity={0.3}
        style={[styles.overlayButton, {
          bottom: acceptedRequest ? 220 : 215,
          right: 10,
          paddingHorizontal: 10,
          backgroundColor: listOfHospitals.length <= 0 ? "rgb(240, 240, 240)" : "white"
        }]}
        onPress={() => setShowHospitals(true)}
        disabled={listOfHospitals.length <= 0}
      >
        <MaterialCommunityIcons
          name="hospital-box-outline"
          size={24}
          color={listOfHospitals.length <= 0 ? "silver" : defaultTheme}
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.3}
        style={[styles.overlayButton, {
          bottom: acceptedRequest ? 170 : 165,
          right: 10,
          paddingHorizontal: 10,
          backgroundColor: !newCoordinates ? "rgb(240, 240, 240)" : "white"
        }]}
        onPress={() => {
          const start = async () => {
            await createRoute(
              region.latitude,
              region.longitude,
              newCoordinates.latitude,
              newCoordinates.longitude
            )
            moveCamera(region.latitude, region.longitude);
          }
          start();
        }}
        disabled={!newCoordinates}
      >
        <FontAwesome5
          name="route"
          size={24}
          color={!newCoordinates ? "silver" : defaultTheme}
        />
      </TouchableOpacity>


      {!acceptedRequest && (  //If my request is accepted hide this
        <TouchableOpacity
          activeOpacity={0.3}
          style={[styles.overlayButton, {
            bottom: 115,
            right: 10,
            paddingHorizontal: 10,
          }]}
          onPress={() => setShowRequestModal(!showRequestModal)}
        >
          <AntDesign name="caretup" size={24} color={defaultTheme} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        activeOpacity={0.3}
        style={[styles.overlayButton, {
          bottom: acceptedRequest ? 120 : 65,
          right: 10,
          paddingHorizontal: 10,
        }]}
        onPress={fetchMyLocation}
      >
        <MaterialIcons
          name="my-location"
          size={24}
          color={defaultTheme}
        />
      </TouchableOpacity>
      <View style={{
        position: "absolute",
        left: 10,
        right: 10,
        top: 10,
        backgroundColor: "white",
        maxHeight: search.length > 8 ? 200 : 50,
        paddingVertical: 5,
        borderRadius: 20,
        borderBottomLeftRadius: search.length > 8 ? 8 : 20,
        borderBottomRightRadius: search.length > 8 ? 8 : 20,
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
            borderColor: "#c8c8c9",
          }}
        >
          <TextInput
            placeholder='Search destination'
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
                color={defaultTheme}
              />
            </TouchableHighlight>
          )}
        </View>
        <FlatList
          data={autoComplete}
          keyExtractor={item => item.osm_id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.listData, {
                backgroundColor: item.osm_id === selectDestination ? "rgb(240, 240, 240)" : "white",
              }]}
              onPress={() => {
                setSelectDestination(item.osm_id);
                fetchSelectedDestination(autoComplete, item.osm_id);
                moveToRegion(
                  parseFloat(item.lat),
                  parseFloat(item.lon),
                  0.0922,
                  0.0421
                );
              }}
            >
              <FontAwesome5
                name={item.type == "hospital" ? "hospital" : "map-marker-alt"}
                size={24}
                color={defaultTheme}
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
      {showProfileDetails && (
        <View
          style={[styles.overlayContainer, {
            bottom: acceptedRequest ? 120 : 90,
          }]}
        >
          <ScrollView
            style={{ height: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.overlayButtonText, styles.details]}>Current Details</Text>
            <Text style={styles.overlayButtonText}>Latitude: {region.latitude}</Text>
            <Text style={styles.overlayButtonText}>Longitude: {region.longitude}</Text>
            {/* <Text style={styles.overlayButtonText}>Routes: {decodedCoordinates.length}</Text> */}

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
        <Pressable
          style={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: "rgba(0, 0, 0, 0.2)"
          }}
          onPress={() => setShowHospitals(!showHospitals)}
        >
          <View style={{
            backgroundColor: "white",
            position: "absolute",
            height: "50%",
            bottom: 0,
            width: "100%",
          }}
          >
            <Text style={[styles.headerHospital, styles.headerTitle]}>
              List of Hospital base on your Location
            </Text>
            <FlatList
              data={listOfHospitals}
              keyExtractor={item => item.properties.datasource.raw.osm_id}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[styles.listData, {
                    backgroundColor: item.properties.datasource.raw.osm_id === selectDestination
                      ? "#ffecb3"
                      : "transparent"
                  }]}
                  onPress={() => {
                    setSelectDestination(item.properties.datasource.raw.osm_id);
                    setShowHospitals(!showHospitals);
                    fetchSelectedDestination(listOfHospitals, item.properties.datasource.raw.osm_id);
                    moveToRegion(
                      parseFloat(item.properties.lat),
                      parseFloat(item.properties.lon),
                      0.0922,
                      0.0421
                    );
                  }}
                >
                  <FontAwesome5 name="hospital" size={24} color={defaultTheme} />

                  <View>
                    <Text style={styles.headerHospital}>{item.properties.address_line1}</Text>
                    <Text style={[styles.defaultFont, { marginBottom: 2 }]}>{item.properties.address_line2}</Text>
                    <Text style={[styles.defaultFont, styles.distance]}>
                      Distance: {item.properties.distance}m
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={{ borderWidth: 1, borderColor: "gray" }}></View>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {FindingHospitals && (
        <StatusModal
          status={FindingHospitals}
          setStatus={setFindingHospitals}
          message="We're looking a hospitals"
        />
      )}

      {isRoute && (
        <StatusModal
          status={isRoute}
          setStatus={setIsRoute}
          message="Creating a route..."
        />
      )}


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
              {isSaved ? "Your request has been submitted." : "Processing..."}
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showEmergencyModal}
        onRequestClose={() => setShowEmergencyModal(!showEmergencyModal)}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: "rgba(0, 0, 0, 0.2)"
          }}
        >
          <View
            showsVerticalScrollIndicator={false}
            style={{
              position: "absolute",
              bottom: 0,
              height: "55%",
              width: "100%",
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderBottomWidth: 1,
                borderColor: "silver"
              }}
            >
              <Text
                style={{
                  fontFamily: "NotoSans-Bold",
                  fontSize: 20,
                  color: defaultTheme
                }}
              >
                Send report
              </Text>
              <TouchableOpacity
                activeOpacity={0.2}
                onPress={() => {
                  setShowEmergencyModal(!showEmergencyModal);
                  setSelectEmergencyType(null);
                  setSelectResponderNeed(null);
                  setImage(null);
                  setMessage(null);
                }}
              >
                <Feather name="x" size={30} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{
                fontFamily: "NotoSans-SemiBold",
                paddingHorizontal: 20,
                marginTop: 3,
                color: "gray"
              }}>
                Whats your emergency?
              </Text>


              <View style={{ height: 80, paddingHorizontal: 20, justifyContent: "center", alignItems: "center" }}>
                <FlatList
                  data={emergencyTypes}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => index}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={{
                        alignItems: "center",
                        columnGap: 5,
                        paddingTop: 5,
                        paddingHorizontal: 5,
                      }}
                      onPress={() => {
                        setSelectEmergencyType(item.type);
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: selectEmergencyType === item.type ? item.color : "gray",
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingHorizontal: 10,
                          width: 50,
                          height: 50,
                          borderRadius: 25,
                        }}
                      >
                        <FontAwesome5 name={item.iconName} size={24} color="black" />
                      </View>
                      <Text style={styles.categoryText}>{item.type}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {selectEmergencyType && (
                <>
                  <Text style={styles.boldText}> Select a responder</Text>
                  <View
                    style={[styles.rectangle, {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }]}
                  >
                    <Pressable
                      android_ripple={{ color: "#e57373", borderless: true }}
                      style={[styles.categoryButton, {
                        backgroundColor: selectResponderNeed === "Medical" ? defaultTheme : "transparent"
                      }]}
                      onPress={() => setSelectResponderNeed("Medical")}
                    >
                      <Text style={[styles.categoryText, {
                        color: selectResponderNeed === "Medical" ? "white" : "gray"
                      }]}>Ambulance</Text>
                    </Pressable>

                    <Pressable
                      android_ripple={{ color: "#e57373", borderless: true }}
                      style={[styles.categoryButton, {
                        backgroundColor: selectResponderNeed === "Police" ? defaultTheme : "transparent"
                      }]}
                      onPress={() => setSelectResponderNeed("Police")}
                    >
                      <Text style={[styles.categoryText, {
                        color: selectResponderNeed === "Police" ? "white" : "gray"
                      }]}>Police</Text>
                    </Pressable>

                    <Pressable
                      android_ripple={{ color: "#e57373", borderless: true }}
                      style={[styles.categoryButton, {
                        backgroundColor: selectResponderNeed === "Fire fighter" ? defaultTheme : "transparent"
                      }]}
                      onPress={() => setSelectResponderNeed("Fire fighter")}
                    >
                      <Text style={[styles.categoryText, {
                        color: selectResponderNeed === "Fire fighter" ? "white" : "gray"
                      }]}>Fire fighter</Text>
                    </Pressable>
                  </View>
                </>
              )}

              <Text style={styles.boldText}>Location</Text>
              <View style={styles.rectangle}>
                <TextInput
                  placeholder='My location'
                  value={reportLocation}
                  onChangeText={text => setReportLocation(text)}
                  style={[styles.input, {
                    color: "gray",
                    fontFamily: "NotoSans-SemiBold"
                  }]}
                />
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 7
                  }}
                  onPress={() => {
                    setShowEmergencyModal(!showEmergencyModal);
                    fetchMyLocation()
                  }}
                >
                  <MaterialIcons
                    name="my-location"
                    size={24}
                    color={defaultTheme}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.boldText}>
                Upload Photo
                <Text style={{ color: "silver", fontSize: 11 }}> (optional)</Text>
              </Text>

              <View style={styles.rectangle}>
                <TouchableOpacity style={{ alignItems: "center", paddingVertical: 10 }} onPress={pickMedia}>
                  {!image && (
                    <>
                      <MaterialCommunityIcons name="upload" size={24} color="gray" />
                      <Text style={{ fontFamily: "NotoSans-Medium", color: defaultTheme, fontSize: 12 }}>Upload photo</Text>
                    </>
                  )}
                  {image && (
                    <Image source={{ uri: image }} style={{ width: 150, height: 70 }} />
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.boldText}>
                Message
                <Text style={{ color: "silver", fontSize: 11 }}> (optional)</Text>
              </Text>
              <View
                style={{
                  backgroundColor: "rgba(240, 240, 240, 0.5)",
                  marginHorizontal: 20,
                  height: 70,
                  borderRadius: 6
                }}
              >
                <TextInput
                  multiline
                  placeholder='Enter your message...'
                  style={[styles.defaultFont, {
                    padding: 10
                  }]}
                  onChangeText={(text) => setMessage(text)}
                />
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: defaultTheme,
                  marginHorizontal: 20,
                  marginVertical: 10,
                  borderRadius: 4,
                }}
                onPress={requestEmergency}
              >
                <Text style={{
                  color: "white",
                  textAlign: "center",
                  fontFamily: "NotoSans-Medium",
                  paddingVertical: 7
                }}
                >Send report
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <EmergencyRequestCard
        title="My Emergency Request"
        emptyTitle="You don't have emergency request yet"
        showRequestModal={showRequestModal}
        setShowRequestModal={setShowRequestModal}
        accountDetails={accountDetails}
        emergencyRequest={emergencyRequest}
        moveToRegion={moveToRegion}
      />

      {acceptedRequest && acceptedRequest.responder && acceptedRequest.responder.name && (
        <AcceptRequestCard
          name={acceptedRequest.responder.name}
          contactNumber={acceptedRequest.responder.contactNumber}
          accountDetails={accountDetails}
          latitude={acceptedRequest.responder.latitude}
          longitude={acceptedRequest.responder.longitude}
          moveToRegion={moveToRegion}
          moveCamera={moveCamera}
          documentId={acceptedRequest.id}
          photoUrl={acceptedRequest.responder.photoUrl}
          expoPushToken={expoPushToken}
          responderExpoPushToken={acceptedRequest.responder.notificationToken}
          acceptedRequest={acceptedRequest}
        />
      )}

      {acceptedRequest && acceptedRequest.responder && acceptedRequest.responder.name && (
        <CompletedRequestModal
          showModal={acceptedRequest.showCompletedModal}
          setShowModal={setCompletedRequestShowModal}
          name={acceptedRequest.responder.name}
          photoUrl={acceptedRequest.responder.photoUrl}
          documentId={acceptedRequest.id}
          accountDetails={accountDetails}
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
    color: "gray",
    fontSize: 12,
    fontFamily: "NotoSans-SemiBold"
  },
  details: {
    fontSize: 15,
    borderBottomWidth: 1,
    borderColor: "silver",
    color: defaultTheme,
    fontFamily: "NotoSans-Bold"
  },
  input: {
    height: 40,
    marginHorizontal: 12,
    paddingHorizontal: 10,
    width: "80%"
  },
  overlayContainer: {
    position: 'absolute',
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
    paddingVertical: 10,
    backgroundColor: defaultTheme,
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
  },
  categoryText: {
    fontFamily: "NotoSans-SemiBold",
    color: "gray",
    textAlign: "center"
  },
  categoryButton: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "white",
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: "silver"
  },
  boldText: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    color: "gray",
    fontFamily: "NotoSans-SemiBold"
  },
  rectangle: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "silver",
    borderRadius: 4,
    //position: "relative"
  }
})

export default MapScreen;