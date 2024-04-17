import axios from 'axios';
import { EXPO_LOCATIONIQ_KEY, EXPO_GEOAPIFY_KEY } from "@env"

//Autocomplete api endpoint from LocationIQ
export const fetchAutoComplete = async (input) => {
    const baseUrl = 'https://us1.locationiq.com/v1/autocomplete.php';
    const apiUrl = `${baseUrl}?q=${input}&key=${EXPO_LOCATIONIQ_KEY}`;

    const response = await axios.get(apiUrl);
    return response.data;
};

//Finds the fastest route between coordinates in the supplied order.  //https://docs.locationiq.com/reference/directions  documentations
export const fetchDirections = async (origin, destination) => {
    const apiUrl = `https://us1.locationiq.com/v1/directions/driving/${origin};${destination}?key=${EXPO_LOCATIONIQ_KEY}&steps=true&geometries=polyline&overview=false`;
    const response = await axios.get(apiUrl);
    return response.data;
}

//Search places near a location with a radius filter
export const searchByRadius = async (category, latitude, longitude, radius) => {
    const apiUrl = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${longitude},${latitude},${radius}&bias=proximity:${longitude},${latitude}&limit=10&apiKey=${EXPO_GEOAPIFY_KEY}`;

    const response = await axios.get(apiUrl);
    return response.data;
}


