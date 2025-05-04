import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import ms from '../styles/MainStyles';

/**
 * A reusable label component.
 *
 * @param {object} props - Component props.
 * @param {string} props.description - The label text
 */

const Label = ({ description }) => 
{
	return (
		<Text style={[ms.fs12, ms.cw, ms.uc, ms.mt15 ]}>{description}</Text>
	);
};

  export default Label;