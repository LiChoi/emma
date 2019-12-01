import React from 'react';
import { Text, View } from 'react-native';
import {FadeInView} from './Animations';
import {styles} from './Styles';

export const renderWelcome = (state, updateState) => {
    if (state.screen == 'welcome'){
        return (
            <FadeInView>
                <View>
                    <Text style={styles.name}>Emma!</Text>
                </View>
            </FadeInView>
        );
    }
}