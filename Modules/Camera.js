import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { RNCamera } from 'react-native-camera';
import {BarButton} from './Common';
import {styles} from './Styles';

const RNFS = require('react-native-fs');

export const renderTakePicture = (state, updateState) =>{
    if (state.screen == 'takePicture'){
        return (
            <View style={styles.cameraContainer}>
            <RNCamera
                style={styles.preview}
                type={RNCamera.Constants.Type.back}
                flashMode={RNCamera.Constants.FlashMode.on}
                androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
                }}
                captureAudio={false}
            >
                {({ camera, status }) => {
                    if (status !== 'READY') return <PendingView />;
                    return (
                        <View>
                            <TouchableOpacity onPress={() => takePicture(state, updateState, camera)} style={styles.capture}>
                                <Text style={{ fontSize: 14 }}> SNAP </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            </RNCamera>
            <BarButton title='Back to medlist' onPress={()=>{updateState('by path and value', {path: 'screen', value: 'medlist'})}} />
            </View>
        );
    }
}
  
const takePicture = async function(state, updateState, camera) {
    const options = { quality: 0.5, base64: true };
    const data = await camera.takePictureAsync(options);
    if (state.medlistComponent.imageLocationField !== state.realm.objects('User').filtered(`name='${state.profileComponent.currentProfile}'`)[0].medlist.filtered(`tradeName='${state.render.editMedication}'`)[0].imageLocation){ deletePreviousImage(state.medlistComponent.imageLocationField); } //Don't delete YET what's on medicationLocationField if it's the one saved in realm because user could navigate away before saving the new image, leading to dead reference pointing to deleted image 
    updateState('by path and value', {path: 'medlistComponent.imageLocationField', value: data.uri});
    updateState('by path and value', {path: 'screen', value: 'medlist'});
}
  
const PendingView = () => (
    <Text>Waiting</Text>
);
  
export const deletePreviousImage = (oldImagePath) => {
    if (oldImagePath){
        const file = oldImagePath;
        const filePath = file.split('///').pop()  // removes leading file:///
        RNFS.exists(filePath).then((res) => {
            if (res) { RNFS.unlink(filePath).then(() => console.log(`FILE DELETED: ${filePath}`)); }
        }); 
    }
}
  
export const purgeUnsavedImages = (savedImageLocations) => {
    const path = 'data/user/0/com.emma20191215/cache/Camera';
    console.log(`savedimageLocations: ${savedImageLocations}`);
    RNFS.readDir(path).then((result) => {
        result.forEach((item)=>{ console.log(`item.path: ${item.path}`); if(savedImageLocations.indexOf('file://'+item.path) == -1 ) { deletePreviousImage(item.path); } });
    }).catch((error)=>{ console.log("Folder doesn't exist yet"); });
}