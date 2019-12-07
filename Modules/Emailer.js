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
            body = body + `${key.toUpperCase()}: ${profile[key].toDateString().slice(4)} \n\n`;
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

export const composeInteractionEmail = (state) => {
    let patient = state.profileComponent.currentProfile;
    let body = `My Electronic Medical Mobile Assistant (Emma) has a few questions about ${patient}'s drug therapy.\n\n${patient}'s current medications are:\n\n`;
    let medlist = state.realm.objects('User').filtered(`name='${patient}'`)[0].medlist;
    let emmaAsks = state.emmaAsksComponent;
    medlist.forEach((drug, i)=>{
        body = i !== medlist.length - 1 ? body.concat(`${drug.tradeName}, `) : body.concat(`and ${drug.tradeName}.\n\nEmma is wondering if ${patient} should be...\n\n`);
    });
    emmaAsks.forEach((question)=>{
        body = body.concat(`${question}\n\n`);
    });
    body = body.concat(`Thank you so much for taking the time to answer these questions.\n\nRegards,\n\n ${patient}'s care provider.`);
    return body;
}