import { StyleSheet, Text, View, SafeAreaView, FlatList } from 'react-native'
import React from 'react'

const HotlineScreen = () => {
    const {
        headerText,
        text,
        container,
        list,
        subtext
    } = styles;

    const data = [
        {
            id: 1,
            name: "Jake the Dog",
            phone: "09267896141",
            imgUrl: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fseeklogo.com%2Fvector-logo%2F108432%2Fphilippine-national-police&psig=AOvVaw3H1C2-g9N4S9IIUlaD65cR&ust=1699995604230000&source=images&cd=vfe&ved=0CBIQjRxqFwoTCMius6bvwYIDFQAAAAAdAAAAABAJ"
        }, 
        {
            id: 2,
            name: "Finn the Human",
            phone: "0953256579",
        }, 
        {
            id: 3,
            name: "Steven Universe",
            phone: "0901148397",
        }, 
        {
            id: 4,
            name: "Princess Bubblegum",
            phone: "0934347841",
        }, 
        {
            id: 5,
            name: "Ben Tennyson",
            phone: "0951237700",
        }, 
        {
            id: 6,
            name: "Dipper Pines",
            phone: "09254784441",
        }, 
    ];

  return (
    <View style={container}>
        <Text style={headerText}>Hotlines and Emergency Contacts</Text>
        <View>
        <FlatList 
            data={data} 
            renderItem = {
                ({item}) => 
                <View style={list}>
                    <View>
                        <Text style={text}>{item.name}</Text>
                        <Text style={subtext}>{item.phone}</Text>
                    </View>
                </View>}/>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding:10,
      },
    headerText: {
        fontSize: 24,
        color: "#D64045",
        textAlign: "center",
        fontWeight:"bold",
        marginBottom: 50,
      },
      text: {
        color: "#000000",
        fontSize: 12,
      },
      subtext: {
        color: "#000000",
        opacity:0.6,
        fontSize: 10,
      },
      font: {
        fontFamily: "NotoSans-Medium"
      },
      list: {
        padding:10,
        borderBottomColor: "#000",
        borderBottomWidth: 1,
      }
})

export default HotlineScreen;