import Mailer from 'react-native-mail';

export const handleEmail = (data) => {
    Mailer.mail({
        subject: data.subject, //String
        recipients: data.recipients, //array of strings
        ccRecipients: data.ccRecipients, //array of strings
        bccRecipients: data.bccRecipients, //array of strings
        body: data.body, //string
        isHTML: data.isHTML, //boolean
        attachment: {
            path: data.attachment.path,  // The absolute path of the file from which to read data.
            type: data.attachment.type,   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
            name: data.attachment.name,   // Optional: Custom filename for attachment
        }
    }, (error, event) => {
        Alert.alert(
            error,
            event,
            [
                {text: 'Ok', onPress: () => console.log('OK: Email Error Response')},
                {text: 'Cancel', onPress: () => console.log('CANCEL: Email Error Response')}
            ],
            { cancelable: true }
        )
    });
}
  
export const composeEmail = (state) => {
    let body = "";
    let patient = state.profileComponent.currentProfile;
    let profile = state.realm.objects('User').filtered(`name='${patient}'`)[0];
    let profileKeys = Object.keys(profile);
    profileKeys.forEach((key)=>{
        if (profile[key] instanceof Date && profile.hasOwnProperty(key)){
            body = body + `${key.toUpperCase()}: ${profile[key].toDateString().slice(4)} \n`;
        } else if (profile[key] instanceof Object && profile.hasOwnProperty(key)){
            body = body + `${key.toUpperCase()}: \n`;
            profile[key].forEach((item)=>{
                let subKeys = Object.keys(item);
                subKeys.forEach((subKey,i)=>{
                    body = ( item.hasOwnProperty(subKey) && subKey !== 'imageLocation' ) ? body + `${subKey.toUpperCase()}: ${item[subKey]} \n` : body;
                    if (i == subKeys.length - 1){ body = body + '\n'; }
                });
            });
        } else {
            body = body + `${key.toUpperCase()}: ${profile[key]} \n`;
        }
    });
    return body;
}