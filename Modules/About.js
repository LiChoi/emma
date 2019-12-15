import React from 'react';
import { Text, View } from 'react-native';
import {styles} from './Styles';

export const renderAbout = (state) => {
    if (state.screen == 'about'){
        return (
            <View>
                <Text style={styles.name}>All About Emma!</Text>
                <Text style={styles.textButtonTextStyle}>Electronic. Medical. Mobile. Assistant.</Text>
                <Text></Text>
                <Text style={styles.label}>Overview</Text>
                <Text></Text>
                <Text>Emma helps organize your family's medical information, which you can conveniently access from your phone.</Text>
                <Text></Text>
                <Text style={styles.label}>Features</Text>
                <Text></Text>
                <Text>Keep a handy list of your children's medical allergies.</Text>
                <Text></Text>
                <Text>Keep a list of your spouse's medical conditions.</Text>
                <Text></Text>
                <Text>Keep a list of your parent's medications, including details such as dose, directions, and even a picture of what the pill looks like. Neat!</Text>
                <Text></Text>
                <Text style={styles.label}>Emma Asks</Text>
                <Text></Text>
                <Text>Emma isn't merely a humble keeper-of-lists. She's also quite smart!</Text>
                <Text></Text>
                <Text>She can analyze the information you provide and suggest questions for you to ask of your medical provider - just to make extra sure that your medicines are safe and effective*.</Text>
                <Text></Text>
                <Text>If you need to send this information to a medical provider, Emma can prepare a draft of the email body so you don't have to type it all out. Convenient!</Text>
                <Text></Text>
                <Text>*Emma is not a substitute for a licensed medical practicioner. Her medical knowledge is far from complete, and her analytical capabilities require further refinement. Ideally, your medical provider(s) should already be aware of any issues that Emma might raise, but there's no harm in asking anyway. Do not make any decision to alter your medication therapy based on Emma's questions without first consulting with a medical practitioner.</Text>
                <Text></Text>
                <Text style={styles.label}>Privacy Policy</Text>
                <Text></Text>
                <Text>Emma stores all the information you provide to her on your phone. Therefore, this information is only as secure as your phone. It is your responsibility to keep your phone safe.</Text>
                <Text></Text>
                <Text>Emma does not transmit this information anywhere else except when you ask her to open up your phone's gmail account to pre-fill the email body. Even then, you must input the email address and hit 'send' before any information is sent.</Text>
                <Text></Text>
                <Text>Emma does not communicate with external devices except when you touch the 'Update' button to update her clinical knowledge. This sends a request to pull information from a server. No health information is transmitted from your phone in this request.</Text>
                <Text></Text>
            </View>
        );
    }
}