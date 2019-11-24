import React, { Component } from 'react';
import { Text, View, TouchableHighlight } from 'react-native';
import {fadedDarkMedicalGreen, styles} from './Styles';

//Beginning of minor common components
export const renderMessage = (state, updateState) => {
    if (state.message){
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{state.message}</Text>
          <BarButton title="Close" onPress={()=>{updateState('by path and value', {path: 'message', value: null})}} />
        </View>
      );
    }
  }
  
export class BarButton extends Component {
    render () {
        return (
            <TouchableHighlight underlayColor={fadedDarkMedicalGreen} style={styles.barButtonStyle} onPress={this.props.onPress} ><Text style={styles.buttonTextStyle}>{this.props.title.toUpperCase()}</Text></TouchableHighlight>
        );
    }
}
  
export class TextButton extends Component {
    render () {
      return (
        <TouchableHighlight underlayColor={fadedDarkMedicalGreen} style={styles.textButtonStyle} onPress={this.props.onPress} ><Text style={styles.textButtonTextStyle}>{this.props.title.toUpperCase()}</Text></TouchableHighlight>
      );
    }
  }
  //End of common components