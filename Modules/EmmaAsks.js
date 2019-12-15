import React from 'react';
import { Text, View } from 'react-native';
import {BarButton} from './Common';
import {styles} from './Styles';
import {handleEmail, composeInteractionEmail} from './Emailer';

export const renderEmmaAsks = (state, updateState) => {
    if (state.screen == 'emmaAsks'){
        return (
            <View>
                <Text style={styles.label}>Emma thinks you should ask about...</Text>
                <Text></Text><Text></Text>
                {state.emmaAsksComponent.length > 0 ? state.emmaAsksComponent.map((message, i)=>{
                    return (
                        <View key={i}>
                            <View style={styles.messageContainer} >
                                <Text style={styles.messageText} >{message}</Text>
                            </View>
                            <Text></Text>
                        </View>
                    );
                }) : <View style={styles.messageContainer} ><Text style={styles.messageText} >Emma can't think of any questions.{'\n\n'}Also, don't forget to press the 'Update' button on the home screen to update Emma's knowledge.{'\n\n'} And please don't spam the update button. Once a month is good;)</Text></View>}
                <Text></Text>
                <BarButton title='Email your medical provider' onPress={()=>{ 
                    handleEmail(
                        {
                            subject: `Questions about ${state.profileComponent.currentProfile}'s medication therapy`, //String
                            recipients: [], //array of strings
                            ccRecipients: [], //array of strings
                            bccRecipients: [], //array of strings
                            body: composeInteractionEmail(state), //string
                            isHTML: false, //boolean
                            attachment: {}
                        }
                    );
                 }} />
                <BarButton title='Back to profile' onPress={()=>{updateState('by path and value', {path: 'screen', value: 'profile'})}} />
            </View>
        );
    }
}

