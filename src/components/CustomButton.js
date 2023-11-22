import React from "react";
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from "react-native";

const CustomButton = ({
  title,
  style,
  textStyle,
  textColor,
  onPress,
  loading,
  statusButton
}) => {
  const { loader } = styles;

  return (
    <TouchableOpacity
      style={style}
      activeOpacity={0.6}
      onPress={onPress}
      disabled={statusButton === "submitting"}
    >
      {loading ? (
        <ActivityIndicator
          style={loader}
          size={22}
          color="white"
        />)
        : (
          <Text style={[textStyle, { color: textColor }]}>
            {title}
          </Text>)
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 7
  }
})

export default CustomButton;