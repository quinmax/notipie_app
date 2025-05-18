import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

/**
 * A custom button component that displays an SVG icon and text.
 *
 * @param {object} props - Component props.
 * @param {function} props.onPress - Function to call when the button is pressed.
 * @param {string} props.text - The text label for the button.
 * @param {React.ComponentType<import('react-native-svg').SvgProps>} props.SvgIcon - The SVG component to display.
 * @param {number} [props.svgWidth=20] - The width of the SVG icon.
 * @param {number} [props.svgHeight=20] - The height of the SVG icon.
 * @param {object} [props.style] - Optional additional styles for the button container.
 * @param {object} [props.textStyle] - Optional additional styles for the text.
 * @param {string} [props.svgFill='white'] - Optional fill color for the SVG icon.
 */
const ButtonOutline = ({
  onPress,
  text,
  svgWidth = 20,
  svgHeight = 20,
  style,
  textStyle,
  svgFill = 'white', // Default SVG fill to white
}) => {
  return (
    <TouchableOpacity
      style={[styles.buttonContainer, style]}
      onPress={onPress}
      activeOpacity={0.7} // Standard opacity feedback
    >
      <Text style={[styles.buttonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row', // Arrange icon and text horizontally
    alignItems: 'center', // Center items vertically
    justifyContent: 'flexStart', // Center items horizontally
    borderColor: '#03A9F4', // Specific border color
    borderWidth: 1, // Specific border width
    borderRadius: 10, // Specific border radius
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 20, // Horizontal padding
    elevation: 2, // Add a slight shadow on Android
	  minWidth: 200, // Minimum width for the button
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  iconWrapper: {
    marginRight: 8, // Space between icon and text
  },
  buttonText: {
    color: '#000000',
    fontSize: 15,
    textTransform: 'uppercase', // Uppercase text
  },
});

export default ButtonOutline;