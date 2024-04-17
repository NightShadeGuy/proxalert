import {
    StyleSheet,
    View,
    Text,
    Modal,
    TextInput,
    FlatList,
    TouchableOpacity,
    TouchableHighlight,
    ScrollView,
    Image,
    Pressable,
    LayoutAnimation,
    Dimensions
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
import CustomButton from "../../components/CustomButton";
import { db } from '../../config/firebase';
import {
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
    emergencyRequestRef,
    useDefaultPhoto,
} from '../../shared/utils';
import {
    AntDesign,
    FontAwesome,
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
import { useNavigation } from '@react-navigation/native';
import EmergencyRequestCard from '../../components/EmergencyRequestCard';
import AcceptRequestCard from '../../components/AcceptRequestCard';
import CompletedRequestModal from '../../components/CompletedRequestModal';

const ResponderMapScreen = ({
    user,
    setUser,
    accountDetails,
    expoPushToken
}) => {
    const navigation = useNavigation();
    //console.log("Current user", user);
    //console.log("responderDetails", responderDetails);
    const [showProfileDetails, setShowProfileDetails] = useState(false);

    useLayoutEffect(() => {  //use for UI loads
        navigation.setOptions({
            headerTitle: "Help Someone in Need",
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => {
                        setShowProfileDetails(!showProfileDetails);
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    }}
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
    //const [modalVisible, setModalVisible] = useState(false);
    //const [isSaved, setIsSaved] = useState(false);
    const [isRoute, setIsRoute] = useState(false);


    //Emergency state
    const [showRequestModal, setShowRequestModal] = useState(false);

    //Onsnapshot state
    const [emergencyRequest, setEmergencyRequest] = useState([]);
    const [acceptedRequest, setAcceptedRequest] = useState(null);

    const [completedRequestShowModal, setCompletedRequestShowModal] = useState(false);

    //Autocomplete search state
    const [search, setSearch] = useState("");
    const [autoComplete, setAutoComplete] = useState([]);
    const [selectDestination, setSelectDestination] = useState(0);
    const [showCategory, setShowCategory] = useState(false);
    const [selectCategory, setSelectCategory] = useState("");
    const mapRef = useRef(null);

    //console.log("Select destination", selectDestination);

    const [routes, setRoutes] = useState([]);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [newCoordinates, setNewCoordinates] = useState(null)  // use for destination
    const [decodedCoordinates, setDecodedCoordinates] = useState([]);
    //console.log("New coordinates", newCoordinates);
    //console.log("routes", routes);
    console.log("decoded", decodedCoordinates);

    //Hospital and Police state 
    const [listOfCategory, setListOfCategory] = useState([]);
    const [showListOfCategory, setShowListOfCategory] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(false);

    const fetchMyLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            return;
        }

        try {
            let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
            let address = await Location.reverseGeocodeAsync(location.coords);
            setDetails(address[0]);
            //console.log("address", address[0]);
            //console.log('Location state:', location);
            setRegion(prevRegion => (
                {
                    ...prevRegion,
                    latitude: location?.coords.latitude,
                    longitude: location?.coords.longitude,
                }
            ));
            console.log("Region state:", region);

            const subscription = await Location.watchPositionAsync(
                {
                    enableHighAccuracy: true,
                    distanceInterval: 10
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
            updateResponderLocationToDB(
                location.coords.latitude,
                location.coords.longitude,
                acceptedRequest.id
            );
        }
    };

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

    const updateResponderLocationToDB = async (latitude, longitude, documentId) => {
        try {
            const emergencyRequestRef = doc(db, "emergency-request", documentId);
            const docSnapshot = await getDoc(emergencyRequestRef);

            if (docSnapshot.exists()) {
                const existingData = docSnapshot.data();
                const updatedResponder = {
                    ...existingData.responder,
                    latitude,
                    longitude
                };

                await updateDoc(emergencyRequestRef, {
                    responder: updatedResponder
                });
                console.log("Successfully updated the coordinates of responder in DB");
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

            /*   const sampleCoordinates = [  //Here's a sample data of the end result decodedCoordinates
              { latitude: 14.76911, longitude: 121.03853 },
              { latitude: 14.76912, longitude: 121.03841 },
              { latitude: 14.76912, longitude: 121.03791 },
              { latitude: 14.76911, longitude: 121.03718 },
            ];
           */

            return decodedCoords

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

    const getRequestedCategory = async (category) => {
        setLoadingCategory(true);
        try {
            const hospitals = await searchByRadius(
                category,
                region.latitude,
                region.longitude,
                6000
            );
            setListOfCategory(hospitals.features);
            console.log("List of near hospital base on the location", hospitals.features);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoadingCategory(false);
            setShowListOfCategory(true);
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

    //DirectionAngle for heading, 0 Camera points north. 90: Camera points east. 180: Camera points south. 270: Camera points west.
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
                3000  //duration
            );
        }
    };

    const createRouteForResponderAndUserToDB = async (documentId) => {
        try {
            const emergencyRequestRef = doc(db, "emergency-request", documentId);
            const routeForUserAndResponder = await createRoute(
                region.latitude,
                region.longitude,
                acceptedRequest.latitude,
                acceptedRequest.longitude
            )
            await updateDoc(emergencyRequestRef, {
                direction: routeForUserAndResponder
            });

            moveCamera(region.latitude, region.longitude)

        } catch (error) {
            console.error(error.message);
        }
    }


    /* Display all the request of users */
    const loadEmergencyRequest = async () => {
        const q = query(emergencyRequestRef,
            where("emergencyStatus", "==", "waiting"),
            where("requestedResponder", "==", accountDetails.sortResponder),
            orderBy("createdAt", "asc")
        );

        onSnapshot(q, (querySnapshot) => {
            const requestEmergency = querySnapshot.docs.map(doc => (
                { ...doc.data(), id: doc.id }
            ))
            setEmergencyRequest(requestEmergency);
            console.log("Responder load emergency request", requestEmergency);
        })
    }

    const loadAcceptedRequest = async () => {
        const q = query(emergencyRequestRef,
            where("responderUid", "==", user.uid),
            where("emergencyStatus", "==", "accepted"),
            orderBy("createdAt", "desc")
        );

        onSnapshot(q, (querySnapshot) => {
            const acceptedEmergencyRequest = querySnapshot.docs.map(doc => (
                { ...doc.data(), id: doc.id }
            ))
            console.log("Responder accepted request snapshot", acceptedEmergencyRequest);

            const getUserInfo = acceptedEmergencyRequest.find(info => info.responderUid === user.uid);
            if (getUserInfo) {
                setAcceptedRequest(getUserInfo);
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
                        title={`Me: ${user.displayName}`}
                        description={`Contact Number: ${accountDetails.contactNumber}`}
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
                            <Image
                                source={{ uri: useDefaultPhoto(accountDetails.isResponder, accountDetails.sortResponder).vehicleIcon }}
                                style={{
                                    height: 40,
                                    width: 40,
                                    borderRadius: 20,
                                }}
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

                {listOfCategory.length > 0 && (
                    listOfCategory.filter(marker => marker.properties.datasource.raw.osm_id === selectDestination)
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
                                {selectCategory === "hospital" && (
                                    <MaterialCommunityIcons
                                        name="hospital-marker"
                                        size={30}
                                        color={defaultTheme}
                                    />
                                )}

                                {selectCategory === "police" && (
                                    <MaterialIcons name="local-police" size={24} color="#01579b" />
                                )}
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

                {/* Accepted user request */}
                {acceptedRequest && acceptedRequest.latitude && acceptedRequest.longitude && (
                    <Marker
                        coordinate={{
                            latitude: acceptedRequest.latitude,
                            longitude: acceptedRequest.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        title={`Name: ${acceptedRequest.user}`}
                        description={`Emergency type: ${acceptedRequest.emergencyType}`}
                    >
                        {acceptedRequest.photoUrl ? (
                            <Image
                                source={{ uri: acceptedRequest.photoUrl }}
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

                {acceptedRequest && acceptedRequest.direction && acceptedRequest.direction.length > 0 && (
                    <Polyline
                        coordinates={acceptedRequest.direction}
                        strokeColor="#7b64ff"
                        strokeWidth={5}
                    />
                )}
            </MapView>

            {acceptedRequest && !acceptedRequest.direction && (
                <TouchableOpacity
                    activeOpacity={0.4}
                    style={[styles.overlayButton, {
                        position: "absolute",
                        bottom: 120,
                        left: 10,
                        paddingHorizontal: 30,
                        backgroundColor: defaultTheme,
                    }]}
                    onPress={() => createRouteForResponderAndUserToDB(acceptedRequest.id)}
                >
                    <Text style={{ color: "white", fontFamily: "NotoSans-SemiBold", }} >Start</Text>
                </TouchableOpacity>
            )}

            <CustomButton
                title="View emergency request"
                style={[styles.overlayButton, {
                    bottom: 19,
                    left: '50%',
                    transform: [{ translateX: -Dimensions.get("window").width / 4 }],
                    right: 'auto', // Ensure 'right' is 'auto' to prevent conflicts
                }]}
                textStyle={styles.overlayButtonText}
                textColor={defaultTheme}
                onPress={() => setShowRequestModal(!showRequestModal)}
            />

            <TouchableOpacity
                activeOpacity={0.3}
                style={[styles.overlayButton, {
                    bottom: acceptedRequest ? 220 : 165,
                    right: 10,
                    paddingHorizontal: 10,
                    backgroundColor: listOfCategory.length <= 0 ? "rgb(240, 240, 240)" : "white"
                }]}
                onPress={() => setShowListOfCategory(true)}
                disabled={listOfCategory.length <= 0}
            >
                <Feather name="list" size={24} color={listOfCategory.length <= 0 ? "silver" : defaultTheme} />
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={0.3}
                style={[styles.overlayButton, {
                    bottom: acceptedRequest ? 170 : 115,
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
                        position: "relative"
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
                        <View>
                            <View>
                                <TouchableHighlight
                                    activeOpacity={0.6}
                                    underlayColor="#DDDDDD"
                                    style={{ borderRadius: 20, padding: 4 }}
                                    onPress={() => {
                                        setShowCategory(!showCategory)
                                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    }}
                                >
                                    <MaterialIcons name="category" size={20} color="#00d084" />
                                </TouchableHighlight>

                                <View
                                    style={{
                                        display: showCategory ? "flex" : "none",
                                        position: "absolute",
                                        top: 50,
                                        alignItems: "center",
                                        rowGap: 6,
                                    }}>
                                    <TouchableOpacity
                                        activeOpacity={0.4}
                                        onPress={() => {
                                            setShowCategory(false);
                                            setSelectCategory("healthcare.hospital".replace(/healthcare./gi, ""));
                                            getRequestedCategory("healthcare.hospital");
                                        }}
                                    >
                                        <MaterialCommunityIcons name="hospital-marker" size={30} color={defaultTheme} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.4}
                                        onPress={() => {
                                            setShowCategory(false);
                                            setSelectCategory("service.police".replace(/service./gi, ""));
                                            getRequestedCategory("service.police");
                                        }}
                                    >
                                        <MaterialIcons name="local-police" size={26} color="#01579b" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
                <FlatList
                    data={autoComplete}
                    keyExtractor={item => item.osm_id}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={[styles.listData, {
                                backgroundColor: item.osm_id === selectDestination ? "rgb(240, 240, 240)" : "white"
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
                visible={showListOfCategory}
                onRequestClose={() => setShowListOfCategory(!showListOfCategory)}
            >
                <Pressable
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        backgroundColor: "rgba(0, 0, 0, 0.2)"
                    }}
                    onPress={() => setShowListOfCategory(!showListOfCategory)}
                >
                    <View
                        style={{
                            backgroundColor: "white",
                            position: "absolute",
                            height: "50%",
                            bottom: 0,
                            width: "100%"
                        }}
                    >
                        <Text style={[styles.headerHospital, styles.headerTitle]}>
                            List of {selectCategory === "hospital" && "hospitals"} {selectCategory === "police" && "police stations"} base on your location
                        </Text>
                        <FlatList
                            data={listOfCategory}
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
                                        setShowListOfCategory(!showListOfCategory);
                                        fetchSelectedDestination(listOfCategory, item.properties.datasource.raw.osm_id);
                                        moveToRegion(
                                            parseFloat(item.properties.lat),
                                            parseFloat(item.properties.lon),
                                            0.0922,
                                            0.0421
                                        );
                                    }}
                                >
                                    {selectCategory === "hospital" && (
                                        <FontAwesome5 name="hospital" size={24} color={defaultTheme} />
                                    )}

                                    {selectCategory === "police" && (
                                        <MaterialIcons name="local-police" size={24} color="#01579b" />
                                    )}
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
            </Modal >


            {isRoute && (
                <StatusModal
                    status={isRoute}
                    setStatus={setIsRoute}
                    message="Creating a route..."
                />
            )}

            {loadingCategory && (
                <StatusModal
                    status={loadingCategory}
                    setStatus={setLoadingCategory}
                    message={selectCategory === "hospital"
                        ? "We're looking a hospitals"
                        : selectCategory === "police"
                            ? "Were looking a police station"
                            : ""
                    }
                />
            )}

            <EmergencyRequestCard
                title="People in need of assistance"
                emptyTitle="Currently no one has asked for assistance"
                showRequestModal={showRequestModal}
                setShowRequestModal={setShowRequestModal}
                emergencyRequest={emergencyRequest}
                setEmergencyRequest={setEmergencyRequest}
                accountDetails={accountDetails}
                latitude={region.latitude}
                longitude={region.longitude}
                moveToRegion={moveToRegion}
                photoUrl={user.photoURL}
                currentCity={details?.city}
                loadEmergencyRequest={loadEmergencyRequest}
                expoPushToken={expoPushToken}
            />

            {acceptedRequest && (
                <AcceptRequestCard
                    name={acceptedRequest.user}
                    contactNumber={acceptedRequest.contactNumber}
                    emergencyType={acceptedRequest.emergencyType}
                    fullAddress={acceptedRequest.fullAddress}
                    accountDetails={accountDetails}
                    latitude={acceptedRequest.latitude}
                    longitude={acceptedRequest.longitude}
                    moveToRegion={moveToRegion}
                    moveCamera={moveCamera}
                    documentId={acceptedRequest.id}
                    photoUrl={acceptedRequest.photoUrl}
                    setCompletedRequestShowModal={setCompletedRequestShowModal}
                    expoPushToken={expoPushToken}
                    responderExpoPushToken={acceptedRequest.notificationToken}
                    acceptedRequest={acceptedRequest}
                />
            )}

            {acceptedRequest && (
                <CompletedRequestModal
                    showModal={completedRequestShowModal}
                    setShowModal={setCompletedRequestShowModal}
                    name={acceptedRequest.user}
                    photoUrl={acceptedRequest.photoUrl}
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
        fontSize: 14,
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
        bottom: 90,
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
        paddingVertical: 12,
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
    }
})

export default ResponderMapScreen;