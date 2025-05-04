import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import ms from '../styles/MainStyles';

/**
 * A reusable input component with a label above the input field.
 *
 * @param {object} props - Component props.
 * @param {string} props.description - The label text displayed above the input.
 * @param {string} props.value - The current value of the input field.
 * @param {function(string): void} props.onChangeText - Function called when the text input's text changes.
 * @param {string} [props.placeholder] - Placeholder text for the input field.
 * @param {import('react-native').KeyboardTypeOptions} [props.keyboardType='default'] - Determines which keyboard to open.
 * @param {boolean} [props.secureTextEntry=false] - If true, obscures the text entered.
 * @param {object} [props.style] - Optional additional styles for the main container View.
 * @param {object} [props.labelStyle] - Optional additional styles for the label Text.
 * @param {object} [props.inputStyle] - Optional additional styles for the TextInput.
 */
const LabeledInput = ({
  description,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  style,
  labelStyle,
  inputStyle,
}) => {
  return (
    <View style={[styles.container]}>
      <Text style={[ms.fs12, ms.cw, ms.uc, ms.mt15 ]}>{description}</Text>
      <TextInput
        style={[styles.input, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999" // Softer placeholder color
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none" // Often useful, especially for emails/passwords
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Take full width available from parent
    marginBottom: 10, // Add some space below the input component
  },
  label: {
    fontSize: 14,
    color: '#333', // Dark gray label color
    marginBottom: 5, // Space between label and input box
  },
  input: {
    width: '100%',
    height: 45, // Standard input height
    borderWidth: 1,
	color: '#fff',
    borderColor: '#9BA8B0', // Light gray border
    borderRadius: 8,
    paddingHorizontal: 10, // Padding inside the input box
    fontSize: 16,
    backgroundColor: '#263238',
	marginTop: 10
  },
});

export default LabeledInput;