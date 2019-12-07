import React from 'react';
import { Text, View } from 'react-native';
import {BarButton} from './Common';
import {styles} from './Styles';

export const renderHome = (state, updateState) => {
    if (state.screen == 'home'){
        return (
            <View style={styles.home}>
                {loadProfiles(state, updateState)}
                <BarButton title="Create new profile" onPress={()=>{updateState('by path and value', {path: 'screen', value: 'createProfile'})}} />
                <Text></Text><Text></Text><Text></Text><Text></Text>
            </View>
        );
    }
}

export const loadProfiles = (state, updateState) => {
    if (state.realm){
        let users = state.realm.objects('User');
        if (users.length > 0){
            return (
                <View style={{width: '100%'}}>
                    {
                        users.map((user, i)=>{
                            return(
                                <BarButton 
                                    key={"username "+i} 
                                    title={user.name} 
                                    onPress={()=>{
                                        clearPreviousProfileState(state, updateState);
                                        updateState('by path and value', {path: 'screen', value: 'profile'}); updateState('by path and value', {path: 'profileComponent.currentProfile', value: user.name});
                                    }} 
                                />
                            );
                        })
                    }
                </View>
            );
        } 
    } else {
        return (
            <Text>Loading...</Text>
        );
    }
}

const clearPreviousProfileState = (state, updateState) => {
    let renderPaths = Object.keys(state.render).map((key) => {
        return `render.${key}`;
    });
    let pathsToFalse = [...renderPaths, 'profileComponent.allergyField', 'profileComponent.conditionField', 'medlistComponent.tradeNameField'];
    console.log(pathsToFalse);
    pathsToFalse.forEach((path)=>{
        updateState('by path and value', {path: path, value: null});
    });
}
