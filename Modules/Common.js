import React, { Component } from 'react';
import { Text, View, TouchableHighlight } from 'react-native';
import {fadedDarkMedicalGreen, styles} from './Styles';

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
  
//Props: type = allergies, conditions, medlist // saveRoot, atKey // state // updateState //
export class NoMatchFound extends Component {
    render() {
        if (this.props.state.render[this.props.type + "NoMatch"]){
            return (
                <View style={{width: '100%'}}>
                    <Text style={{textAlign: 'center'}}>Emma doesn't recognize what you entered. Please select from the list below. If you don't see a match, try another search term or save anyway.</Text>
                    <BarButton title='Save what I entered.' onPress={()=>{ this.props.updateState('by path and value', {path: `render.${this.props.type}NoMatch`, value: false}); this.props.updateState('save', {what: this.props.type, whose: this.props.state.profileComponent.currentProfile, root: this.props.saveRoot, keys: [this.props.atKey]}); }} />
                    {this.props.state.suggestedList.map((item)=>{
                        return (
                            <TextButton 
                                key={item} 
                                title={item} 
                                onPress={()=>{  
                                    this.props.updateState('by path and value', {path: `${this.props.saveRoot}.${this.props.atKey}`, value: item});
                                    this.props.updateState('by path and value', {path: `render.${this.props.type}NoMatch`, value: false});
                                }} 
                            />
                        );
                    })}
                </View>
            );
        } else { return null; }
    }
}