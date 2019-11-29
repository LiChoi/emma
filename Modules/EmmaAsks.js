import React, { Component } from 'react';
import { Text, TextInput, Image, View, ScrollView, Button } from 'react-native';
import {BarButton, TextButton} from './Common';
import {styles} from './Styles';

export const renderEmmaAsks = (state, updateState) => {
    if (state.screen == 'emmaAsks'){
        return (
            <View>
                <Text style={styles.label}>Emma thinks you should ask about...</Text>
                <Text></Text><Text></Text>
                {state.emmaAsksComponent.map((message, i)=>{
                    return (
                        <View key={i}>
                            <View style={styles.messageContainer} >
                                <Text style={styles.messageText} >{message}</Text>
                            </View>
                            <Text></Text>
                        </View>
                    );
                })}
                <Text></Text>
                <BarButton title='Back to profile' onPress={()=>{updateState('by path and value', {path: 'screen', value: 'profile'})}} />
            </View>
        );
    }
}

