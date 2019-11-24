import React from 'react';
import { Text, TextInput, View } from 'react-native';
import {BarButton} from './Common';
import {styles} from './Styles';

export const createProfile = (state, updateState) => {
    if (state.screen == 'createProfile'){
        return (
            <View style={styles.createProfile}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Enter name"
                    onChangeText={(text) => {updateState('by path and value', {path: 'createProfileComponent.name', value: text});}}
                    value={state.createProfileComponent.name} 
                />
                <TextInput
                    style={styles.textInput}
                    placeholder="Birthday YYYY-MM-DD"
                    onChangeText={(text)=>{updateState('by path and value', {path: 'createProfileComponent.birthday', value: text })}}
                    value={state.createProfileComponent.birthday}  
                />
                <BarButton title="Submit" onPress={()=>{updateState('save', {root: 'createProfileComponent', keys: Object.keys(state.createProfileComponent) })}} />
                <Text></Text>
            </View>
        );
    }
}