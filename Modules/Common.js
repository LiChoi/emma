import React, { Component } from 'react';
import { Text, View, TouchableHighlight } from 'react-native';
import {fadedDarkMedicalGreen, styles} from './Styles';
import { LoadingSpin } from './Animations';

export const renderMessage = (state, updateState) => {
    if (state.message == 'Emma is learning...') {
        return (
            <View style={styles.messageScreenCover}>
                <View style={{height: 100}}></View>
                <View style={{height: 100}}></View>
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>{state.message}</Text>
                </View>
                <LoadingSpin />
                <View style={{height: 100}}></View>
                <View style={{height: 100}}></View>
            </View>
        );
    } else if (state.message){
        return (
            <View style={styles.messageScreenCover}>
                <View></View>
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>{state.message}</Text>
                    <BarButton title="Close" onPress={()=>{updateState('by path and value', {path: 'message', value: null})}} />
                </View>
                <View></View>
                <View></View>
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
                    <Text style={{textAlign: 'justify'}}>Emma doesn't recognize this word. Please select from the list below or try another search term.</Text>
                    <BarButton title='Save what I entered.' onPress={()=>{ this.props.updateState('by path and value', {path: `render.${this.props.type}NoMatch`, value: false}); this.props.updateState('save', {what: this.props.type, whose: this.props.state.profileComponent.currentProfile, root: this.props.saveRoot, keys: [this.props.atKey]}); }} />
                    {this.props.state[`suggested${this.props.atKey}List`].map((item, i)=>{  
                        return (
                            <TextButton 
                                key={item+i} 
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