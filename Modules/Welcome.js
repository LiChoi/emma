import React from 'react';
import { View, TouchableHighlight } from 'react-native';
import {FadeInText} from './Animations';
import {styles} from './Styles';

export const renderWelcome = (state, updateState) => {
    if (state.screen == 'welcome'){
        return (
            <TouchableHighlight style={styles.welcomeScreen} onPress={()=>{updateState('by path and value', {path: 'screen', value: 'home'})}}>
                <View>
                    <FadeInText style={styles.welcomeText} delay={1000}>Electronic</FadeInText>
                    <FadeInText style={styles.welcomeText} delay={2000}>Medical</FadeInText>
                    <FadeInText style={styles.welcomeText} delay={3000}>Mobile</FadeInText>
                    <FadeInText style={styles.welcomeText} delay={4000}>Assistant</FadeInText>
                </View>
            </TouchableHighlight>
        );
    }
}