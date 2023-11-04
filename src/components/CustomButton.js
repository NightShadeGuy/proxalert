import React from "react";
import { Text, TouchableOpacity } from "react-native";

const CustomButton = ({ title, style, textStyle, onPress }) => {
  return (
    <TouchableOpacity
      style={style}
      activeOpacity={0.6}
      onPress={onPress}
    >
      <Text style={[textStyle, { color: "#D64045" }]}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default CustomButton;