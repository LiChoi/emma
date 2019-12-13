import React from 'react';
import { View, TouchableHighlight, Image, Text } from 'react-native';
import {FadeInText, ResizeText, FadeInView} from './Animations';
import {styles, lightMedicalGreen} from './Styles';

export const renderWelcome = (state, updateState) => {
    if (state.screen == 'welcome'){
        return (
            <TouchableHighlight underlayColor={lightMedicalGreen} style={styles.welcomeScreen} onPress={()=>{updateState('by path and value', {path: 'screen', value: 'home'})}}>
                <View>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        <FadeInText style={styles.welcomeText} delay={1000}><ResizeText initial={20} final={30} delay={5000} duration={1000}>E</ResizeText><ResizeText initial={20} final={0} delay={5000} duration={1500}>lectronic </ResizeText></FadeInText>
                        <FadeInText style={styles.welcomeText} delay={2000}><ResizeText initial={20} final={30} delay={5000} duration={1000} >M</ResizeText><ResizeText initial={20} final={0} delay={5000} duration={1500}>edical </ResizeText></FadeInText>
                        <FadeInText style={styles.welcomeText} delay={3000}><ResizeText initial={20} final={30} delay={5000} duration={1000} >M</ResizeText><ResizeText initial={20} final={0} delay={5000} duration={1500}>obile </ResizeText></FadeInText>
                        <FadeInText style={styles.welcomeText} delay={4000}><ResizeText initial={20} final={30} delay={5000} duration={1000} >A</ResizeText><ResizeText initial={20} final={0} delay={5000} duration={1500}>ssistant</ResizeText></FadeInText>
                        <FadeInText style={styles.welcomeText} initial={0} final={1} duration={100} delay={7000}><ResizeText initial={20} final={30} delay={5000} duration={100}>!</ResizeText></FadeInText>
                    </View>
                    <FadeInView delay={7000} duration={100}><Image style={{flex: 1, alignSelf: 'flex-end', aspectRatio: 1/1.05, height: 150}} source={require('./Assets/Emma.png')} /></FadeInView>
                </View>
            </TouchableHighlight>
        );
    }
}
