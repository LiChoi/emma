import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, TouchableHighlight, Image, ScrollView, TextInput, Button } from 'react-native';
import { RNCamera } from 'react-native-camera';
import Mailer from 'react-native-mail';

const RNFS = require('react-native-fs');

import {renderMessage, BarButton, TextButton} from './Common';
import {darkMedicalGreen, lightMedicalGreen, styles} from './Styles';


//Beginning of realm constants
const Realm = require('realm');

const userSchema = {
  name: 'User',
  primaryKey: 'name', 
  properties: {
    name: 'string',
    birthday: 'date?',
    allergies: 'Allergy[]',
    conditions: 'Condition[]',
    medlist: 'Medication[]'
  }
};

const conditionSchema = {
  name: 'Condition',
  properties: {
    name: 'string',
    details: {type: 'string?', default: 'Enter details'}
  }
};

const allergySchema = {
  name: 'Allergy',
  properties: {
    name: 'string',
    details: {type: 'string?', default: 'Enter details'}
  }
};

const medicationSchema = {
  name: 'Medication',
  properties: {
    tradeName: 'string',
    chemicalName: 'string?',
    strength: 'int?',
    unit: 'string?',
    directions: 'string?',
    purpose: 'string?',
    prescriber: 'string?',
    notes: 'string?',
    imageLocation: 'string?'
  }
};

const compendiumSchema = {
  name: 'Compendium',
  primaryKey: 'chemicalName',
  properties: {
    chemicalName: 'string',
    tradeNames: 'string[]',
    class: 'string',
    indications: 'string[]',
    interactionTags: 'string[]',
    crossAllergies: 'string[]',
    contraindications: 'string[]',
    doseRange: 'string'
  }
}

const schemas = [userSchema, conditionSchema, allergySchema, medicationSchema, compendiumSchema];
//End of realm constants

/*/Beginning of minor common components
const renderMessage = (state, updateState) => {
  if (state.message){
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{state.message}</Text>
        <BarButton title="Close" onPress={()=>{updateState('by path and value', {path: 'message', value: null})}} />
      </View>
    );
  }
}

class BarButton extends Component {
  render () {
    const barButtonStyle = {
      height: 50,
      width: '100%',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 155, 110, 1)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 1)'
    }; 
    const buttonTextStyle = {
      textAlign: 'center',
      color: 'white',
      fontWeight: 'bold'
    };
    const underlayColor = 'rgba(0,155,110,0.8)';
    return (
    <TouchableHighlight underlayColor={underlayColor} style={barButtonStyle} onPress={this.props.onPress} ><Text style={buttonTextStyle}>{this.props.title.toUpperCase()}</Text></TouchableHighlight>
    );
  }
}

class TextButton extends Component {
  render () {
    const textButtonStyle = {
      height: 50,
      width: '100%',
      justifyContent: 'center',
    }; 
    const buttonTextStyle = {
      textAlign: 'center',
      color: 'rgba(0, 155, 110, 1)',
      fontWeight: 'bold'
    };
    const underlayColor = 'rgba(0,155,110,0.8)';
    return (
    <TouchableHighlight underlayColor={underlayColor} style={textButtonStyle} onPress={this.props.onPress} ><Text style={buttonTextStyle}>{this.props.title.toUpperCase()}</Text></TouchableHighlight>
    );
  }
}
//End of common components*/

//Beginning of renderHome component and its subcomponents
const renderHome = (state, updateState) => {
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

const loadProfiles = (state, updateState) => {
  if (state.realm){
    let users = state.realm.objects('User');
    if (users.length > 0){
      return (
        <View style={{width: '100%'}}>
          {
            users.map((user, i)=>{
              return(
                <BarButton key={"username "+i} title={user.name} onPress={()=>{updateState('by path and value', {path: 'screen', value: 'profile'}); updateState('by path and value', {path: 'profileComponent.currentProfile', value: user.name})}} />
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
//End of renderHome et al

//Beginning of createProfileComponent and all its subcomponenets 
const createProfile = (state, updateState) => {
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
//End of createProfileComponent

//Beginning of profile componenent and its subcomponenets
const renderProfile = (state, updateState) => {
  if (state.screen == 'profile'){
    return (
      <View>
        <Text style={styles.name}>{state.profileComponent.currentProfile}</Text>
        <Text style={{textAlign: 'center'}}>{state.realm.objects('User').map((user, i)=>{if(user.name == state.profileComponent.currentProfile){return user.birthday.toDateString().slice(4);}})}</Text>
        {deleteProfile(state, updateState)}
        <Text>{'\n'}</Text>
        <Text style={styles.label}>Allergies:</Text>
        {renderAllergyList(state, updateState)}
        {renderAddAllergy(state, updateState)}
        <Text>{'\n'}</Text>
        <Text style={styles.label}>Medical Conditions:</Text>
        {renderConditionList(state, updateState)}
        {renderAddCondition(state, updateState)}
        <Text>{'\n'}</Text>
        <BarButton title="View med list" onPress={()=>{updateState('by path and value', {path: 'screen', value: 'medlist'})}}/>
        <BarButton title="Email Profile" onPress={()=>{handleEmail(
          {
            subject: "Profile", //String
            recipients: [], //array of strings
            ccRecipients: [], //array of strings
            bccRecipients: [], //array of strings
            body: composeEmail(state), //string
            isHTML: false, //boolean
            attachment: {
              path: "",  // The absolute path of the file from which to read data.
              type: "",   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
              name: "",   // Optional: Custom filename for attachment
            }
          }
        )}} />
      </View>
    );
  }
}

const renderAddAllergy = (state, updateState) => {
  if (!state.render.editAllergyDetails){
    return (
      <View>
         <TextInput 
          style={styles.textInput}
          placeholder='Enter new allergy'
          onChangeText={(text)=>{updateState('by path and value', {path: 'profileComponent.allergyField', value: text })}}
          value={state.profileComponent.allergyField} 
        />
        <TextButton title='Add+' onPress={()=>{updateState('save', {what: 'allergies', whose: state.profileComponent.currentProfile, root: 'profileComponent', keys: ['allergyField']}); }} />
      </View>
    );
  }
}

const renderAddCondition = (state, updateState) => {
  if (!state.render.editConditionDetails){
    return (
      <View style={{alignItems: 'center'}}>
          <TextInput 
          style={styles.textInput}
          placeholder='Enter new condition'
          onChangeText={(text)=>{updateState('by path and value', {path: 'profileComponent.conditionField', value: text })}}
          value={state.profileComponent.conditionField} 
        />
        <TextButton title="Add+" onPress={()=>{ updateState('save', {what: 'conditions', whose: state.profileComponent.currentProfile, root: 'profileComponent', keys: ['conditionField']}); }}/>
      </View>
    );
  }
}

const deleteProfile = (state, updateState) => {
  if (!state.render.deleteProfile){
    return (
      <BarButton title="Delete profile" onPress={()=>{updateState('by path and value', {path: 'render.deleteProfile', value: true})}} />
    );
  } else {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Are you certain you want to permanently delete this profile? Type "Yes, delete" to confirm.</Text>
        <TextInput style={styles.textInput} placeholder='Type "Yes, delete" to confirm' onChangeText={(text)=>{text=='Yes, delete' ? updateState('delete', {what: 'profile', which: state.profileComponent.currentProfile}) : null; }}/>
        <BarButton title="Do not delete" onPress={()=>{updateState('by path and value', {path: 'render.deleteProfile', value: false})}} />
      </View>
    );
  }
}

const renderAllergyList = (state, updateState) => {
  return (
    <View>
      {
        state.realm.objects('User').filtered(`name='${state.profileComponent.currentProfile}'`)[0].allergies.map((allergy, i)=>{
          return (
            <View style={styles.border} key={allergy.name + i}>
              <Text style={styles.innerText}>Allergy: {allergy.name}</Text>
              <Text style={styles.innerText}>Details: {allergy.details}</Text>
              {renderEditAllergyDetails(state, updateState, allergy)}
            </View>
          );
        })
      }
    </View>
  );
}

const renderEditAllergyDetails = (state, updateState, allergy) => {
  if (state.render.editAllergyDetails !== allergy.name){
    return (
      <View>
        <TextButton title='Edit' onPress={()=>{updateState('by path and value', {path: 'render.editAllergyDetails', value: allergy.name}); updateState('by path and value', {path: 'profileComponent.allergyField', value: allergy.name}); updateState('by path and value', {path: 'profileComponent.allergyDetailsField', value: allergy.details})}} />
      </View>
    );
  } else {
    return (
      <View>
        <TextInput
          style={styles.textInput} 
          placeholder="Enter details"
          onChangeText={(text)=>{updateState('by path and value', {path: 'profileComponent.allergyDetailsField', value: text })}}
          value={state.profileComponent.allergyDetailsField} 
        />
        <TextButton title='Save' onPress={()=>{updateState('save', {what: 'allergies', whose: state.profileComponent.currentProfile, which: allergy.name, root: 'profileComponent', keys: ['allergyDetailsField', 'allergyField']}); updateState('by path and value', {path: 'render.editAllergyDetails', value: false}); }} />
        <TextButton title='Delete' onPress={()=>{updateState('delete', {what: 'allergies', whose: state.profileComponent.currentProfile, which: allergy.name}); updateState('by path and value', {path: 'profileComponent.allergyField', value: null}); updateState('by path and value', {path: 'render.editAllergyDetails', value: false}); }} />
      </View>
    );
  }
}

const renderConditionList = (state, updateState) => {
  return (
    <View>
      {
        state.realm.objects('User').filtered(`name='${state.profileComponent.currentProfile}'`)[0].conditions.map((condition, i)=>{
          return (
            <View style={styles.border} key={condition.name + i}>
              <Text style={styles.innerText}>Condition: {condition.name}</Text>
              <Text style={styles.innerText}>Details: {condition.details}</Text>
              {renderEditConditionDetails(state, updateState, condition)}
            </View>
          );
        })
      }
    </View>
  );
}

const renderEditConditionDetails = (state, updateState, condition) => {
  if (state.render.editConditionDetails !== condition.name){
    return (
      <View style={{alignItems: 'center'}}>
        <TextButton title='Edit' onPress={()=>{updateState('by path and value', {path: 'render.editConditionDetails', value: condition.name}); updateState('by path and value', {path: 'profileComponent.conditionField', value: condition.name}) ; updateState('by path and value', {path: 'profileComponent.conditionDetailsField', value: condition.details}); }} />
      </View>
    );
  } else {
    return (
      <View>
        <TextInput
          style={styles.textInput} 
          placeholder="Enter details"
          onChangeText={(text)=>{updateState('by path and value', {path: 'profileComponent.conditionDetailsField', value: text })}}
          value={state.profileComponent.conditionDetailsField} 
        />
        <TextButton title='Save' onPress={()=>{updateState('save', {what: 'conditions', whose: state.profileComponent.currentProfile, which: condition.name, root: 'profileComponent', keys: ['conditionDetailsField', 'conditionField']}); updateState('by path and value', {path: 'render.editConditionDetails', value: false}); }} />
        <TextButton title='Delete' onPress={()=>{updateState('delete', {what: 'conditions', whose: state.profileComponent.currentProfile, which: condition.name}); updateState('by path and value', {path: 'profileComponent.conditionField', value: null}); updateState('by path and value', {path: 'render.editConditionDetails', value: false}); }} />
      </View>
    );
  }
}
//End of profile component and its subcomponenets

//Beginning of medlist component and its subcomponents
const renderMedlist = (state, updateState) => {
  if (state.screen == 'medlist'){
    return (
      <View>
        <Text style={styles.label}>Medication List</Text>
        {
          state.realm.objects('User').filtered(`name='${state.profileComponent.currentProfile}'`)[0].medlist.map((medication, i)=>{
            return (
              <View style={styles.border} key={medication.tradeName + i}>
                <Medication state={state} updateState={updateState} medication={medication} />
              </View>
            );
          })
        }
        <Text></Text>
        {renderAddMedication(state, updateState)}
        <BarButton title='Back to profile' onPress={()=>{updateState('by path and value', {path: 'screen', value: 'profile'})}} />
      </View>
    );
  }
}

class Medication extends Component {
  constructor(props){
    super(props);
    this.toggleExpand = this.toggleExpand.bind(this);
  }

  toggleExpand() {
    this.props.state.render[this.props.medication.tradeName] ? this.props.updateState('by path and value', {path: `render.${this.props.medication.tradeName}`, value: false}) : this.props.updateState('by path and value', {path: `render.${this.props.medication.tradeName}`, value: true});
  }

  render() {
    return (
      <View>
        <BarButton title={this.props.medication.tradeName} onPress={ ()=>{ this.toggleExpand() }} />
        { this.props.state.render[this.props.medication.tradeName] ? toggleEditMedication(this.props.state, this.props.updateState, this.props.medication) : null }
      </View>
    );
  }
}

const renderAddMedication = (state, updateState) => {
  if (!state.render.editMedication){
    return (
      <View>
        <TextInput
          style={styles.textInput} 
          placeholder='Enter new medication'
          onChangeText={(text)=>{updateState('by path and value', {path: 'medlistComponent.tradeNameField', value: text })}}
          value={state.medlistComponent.tradeNameField} 
        />
        <TextButton title='Add+' onPress={()=>{updateState('save', {what: 'medlist', whose: state.profileComponent.currentProfile, root: 'medlistComponent', keys: ['tradeNameField']}); }} />
        <Text></Text>
      </View>
    );
  }
}

const toggleMedicationField = (state, updateState, field) => {
  return (
    <TextInput
      style={styles.textInput} 
      placeholder={`Enter ${field}`}
      onChangeText={(text)=>{updateState('by path and value', {path: `medlistComponent.${field}Field`, value: text })}}
      value={state.medlistComponent[`${field}Field`]} 
    />
  );
}

const toggleEditMedication = (state, updateState, medication) => {
  if (state.render.editMedication == medication.tradeName) {
    return (
      <View>
        <TextInput style={styles.textInput} placeholder='Type "Delete" to delete' onChangeText={(text)=>{ text == 'Delete' ? updateState('delete', {what: 'medlist', whose: state.profileComponent.currentProfile, which: medication.tradeName}) : null; text == 'Delete' ? updateState('by path and value', {path: 'render.editMedication', value: false}) : null; text == 'Delete' ? updateState('by path and value', {path: 'medlistComponent.tradeNameField', value: null}) : null }} />
        <Text style={styles.innerText}>Chemical name:</Text>
        {toggleMedicationField(state, updateState, 'chemicalName')}
        <Text style={styles.innerText}>Strength:</Text>
        {toggleMedicationField(state, updateState, 'strength')}
        <Text style={styles.innerText}>Unit:</Text>
        {toggleMedicationField(state, updateState, 'unit')}
        <Text style={styles.innerText}>Used for:</Text>
        {toggleMedicationField(state, updateState, 'purpose')}
        <Text style={styles.innerText}>Prescriber:</Text>
        {toggleMedicationField(state, updateState, 'prescriber')}
        <Text style={styles.innerText}>Directions:</Text>
        {toggleMedicationField(state, updateState, 'directions')}
        <Text style={styles.innerText}>Notes:</Text>
        {toggleMedicationField(state, updateState, 'notes')}
        <Text style={styles.innerText}>Image:</Text>
        <View style={{alignItems: 'center'}}>{state.medlistComponent.imageLocationField ? <Image style={styles.image} source={{uri: state.medlistComponent.imageLocationField}} /> : null}</View>
        <TextButton title='Take Picture' onPress={()=>{updateState('by path and value', {path: 'screen', value: 'takePicture'})}} />
        <TextButton title='Save' onPress={()=>{updateState('save', {what: 'medlist', whose: state.profileComponent.currentProfile, which: medication.tradeName, root: 'medlistComponent', keys: Object.keys(state.medlistComponent)}); deletePreviousImage(medication.imageLocation); }} />
      </View>
    );
  } else {
    return (
      <View>
        <Text style={styles.innerText}>Chemical name: {medication.chemicalName}</Text>
        <Text style={styles.innerText}>Strength: {medication.strength+medication.unit}</Text>
        <Text style={styles.innerText}>Used for: {medication.purpose}</Text>
        <Text style={styles.innerText}>Prescriber: {medication.prescriber}</Text>
        <Text style={styles.innerText}>Directions: {medication.directions}</Text>
        <Text style={styles.innerText}>Notes: {medication.notes}</Text>
        <Text style={styles.innerText}>Image:</Text>
        <View  style={{alignItems: 'center'}}>{medication.imageLocation ? <Image style={styles.image} source={{uri: medication.imageLocation}} /> : null }</View>
        <TextButton title='Edit' onPress={()=>{updateState('by path and value', {path: 'render.editMedication', value: medication.tradeName}); updateState('load medication fields', medication); deletePreviousImage(state.medlistComponent.imageLocationField);}} />
      </View>
    );     
  }
}
//End of medlist componenet and subcomponenets

//Beginning of takePicture and its subcomponents
const renderTakePicture = (state, updateState) =>{
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
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text>Waiting</Text>
  </View>
);

const deletePreviousImage = (oldImagePath) => {
  if (oldImagePath){
    const file = oldImagePath;
    const filePath = file.split('///').pop()  // removes leading file:///
    RNFS.exists(filePath)
      .then((res) => {
        if (res) {
          RNFS.unlink(filePath)
            .then(() => console.log(`FILE DELETED: ${filePath}`))
        }
      }) 
  }
}

const purgeUnsavedImages = () => {
  const path = 'data/user/0/com.emma/cache/Camera';
  RNFS.readDir(path)
    .then((result) => {
      result.forEach((item)=>{
        deletePreviousImage(item.path);
      });
    })
}
//End of takePicture and its subcomponents

//Functions and constants used in updateState and updateRealm
const changeObjectByPath = (obj, path, value) => {
  let build = obj;
  if (path.length == 0){ obj = value; } 
  else { 
    path.forEach((step, i) => {
      if (i < path.length - 1) { build = build[step]; }  //Use this method to get build to the last object key in the path
      else { build[step] = value; }     //This will set rootProp as well
    });
  }
  return obj;
}

const checkValidDate = (dateStr) => {   //YYYY-MM-DD format
  if (!dateStr || dateStr.length !== 10){ return false; }
  let year = /\d{4}/.test(dateStr.substring(0,4)) ? parseInt(dateStr.substring(0,4), 10) : "not a number";
  let dash1 = dateStr.charAt(4);
  let month = /\d{2}/.test(dateStr.substring(5,7)) ? parseInt(dateStr.substring(5,7), 10) : "not a number";
  let dash2 = dateStr.charAt(7);
  let day = /\d{2}/.test(dateStr.substring(5,7)) ? parseInt(dateStr.substring(8), 10) : "not a number";
  if (dash1 !== "-" || dash2 !== "-" || year == "not a number" || month == "not a number" || day == "not a number" ){ return false; }
  if (day < 1 || month < 1){ return false; }
  if (day > 31 || month > 12 || ([4, 6, 9, 11].indexOf(month) > -1 && day > 30)){ return false; }
  if ((year%4 == 0 && month == 2 && day > 29) || (year%4 !== 0 && month == 2 && day > 28)){ return false; }
  return true;
}

const stateToRealm = {name: 'name', birthday: 'birthday', allergyField: 'name', allergyDetailsField: 'details', conditionField: 'name', conditionDetailsField: 'details', tradeNameField: 'tradeName', chemicalNameField: 'chemicalName', strengthField: 'strength', unitField: 'unit', directionsField: 'directions', purposeField: 'purpose', notesField: 'notes', prescriberField: 'prescriber', imageLocationField: 'imageLocation'};

const returnPrimaryStateKey = (keys) => {
  const primaryRealmKeys = ['name', 'allergyField', 'conditionField', 'tradeNameField'];
  let primeKey;
  keys.forEach((key)=>{
    primaryRealmKeys.forEach((primaryKey)=>{
      if (primaryKey == key){ primeKey = key; }
    });
  });
  return primeKey;
}

const checkInputCorrect = (state, data) => {    
  let cannotBeEmpty = ['name', 'birthday', 'allergyField', 'conditionField', 'tradeNameField']; 
  let mustBeUnique = ['name', 'allergyField', 'conditionField', 'tradeNameField'];
  let mustBeDate = ['birthday'];
  let mustBeNumber = ['strengthField']; 
  let errorMessage = "";
  data.keys.forEach((key) => {
    if ( cannotBeEmpty.indexOf(key) > -1 && ( !state[data.root][key] || !/\S/.test(state[data.root][key]) ) ){
      errorMessage = errorMessage.concat(`${key} cannot be empty. `);
    } else if ( data.root == 'createProfileComponent' && key == 'name'){
      let patients = state.realm.objects('User');
      patients.forEach((patient)=>{ errorMessage = (patient.name == state[data.root][key]) ? errorMessage.concat(`${state[data.root][key]} already exists. `) : errorMessage; }); 
    } else if ( mustBeDate.indexOf(key) > -1 ){
      errorMessage = checkValidDate(state[data.root][key]) ? errorMessage : errorMessage.concat(`${key} must be YYYY-MM-DD format. `);   
    } else if ( mustBeUnique.indexOf(key) > -1 && !data.which ){
      let list = state.realm.objects('User').filtered(`name='${data.whose}'`)[0][data.what];
      list.forEach((item) => {
        errorMessage = item[stateToRealm[key]] == state[data.root][key] ? errorMessage.concat(`${state[data.root][key]} already exists. `) : errorMessage;
      });
    } else if ( mustBeNumber.indexOf(key) > -1 ){
      errorMessage = ( state[data.root][key] && /[^0-9]/.test(state[data.root][key]) ) ? errorMessage.concat('Must be a number. ') : errorMessage;
    } 
  });
  return errorMessage;
}

const clearInputFields = (state, updateState, root, keys) => { 
  let stateProp = JSON.parse(JSON.stringify(state[root]));
  keys.forEach((key)=>{ stateProp[key] = null }); 
  updateState('by path and value', {path: root, value: stateProp});
}

const saveToRealm = async (state, updateState, updateRealm, data) => {
  let error = checkInputCorrect(state, data);
  if (error){ updateState('by path and value', {path: 'message', value: error}); }
  else { await updateRealm('save', data); clearInputFields(state, updateState, data.root, data.keys); updateState('by path and value', {path: 'render.editMedication', value: false}); }
}
//End of updateState and updateRealm functions

//Email functions
const handleEmail = (data) => {
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

const composeEmail = (state) => {
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
// End of email functions 

//HTTP functions
const updateCompendium = (data) => {
  fetch('https://emma-server.glitch.me')
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson);
      data.updateRealm()
      Object.getOwnPropertyNames(responseJson).forEach(key=>{
        data.updateRealm('direct save', {schema: 'Compendium', instance: responseJson[key], rewrite: data.state.realm.objects('Compendium').filtered(`chemicalName='${key}'`).length > 0 ? true : false });
      })
      return responseJson;
    })
    .catch((error) => {
      console.error(error);
    });
}
//End of HTTP-functions

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realm: null,
      message: null,
      screen: 'home',
      render: {editAllergyDetails: false, editConditionDetails: false, editMedication: false, deleteProfile: false}, 
      createProfileComponent: {
        name: null,
        birthday: null
      },
      profileComponent: {
        currentProfile: null,
        allergyField: null,
        allergyDetailsField: null,
        conditionField: null,
        conditionDetailsField: null
      },
      medlistComponent: {
        tradeNameField: null,
        chemicalNameField: null,
        strengthField: null,
        unitField: null,
        directionsField: null,
        purposeField: null,
        prescriberField: null,
        notesField: null,
        imageLocationField: null
      }
    };
    this.updateState = this.updateState.bind(this);
    this.updateRealm = this.updateRealm.bind(this);
  }

  componentDidMount() {
    Realm.open({
      schema: schemas
    }).then(realm => {
      this.setState({ realm });
    });
  }

  async updateState(instruction, data) {
    switch(instruction) {
      case 'save':
        saveToRealm(this.state, this.updateState, this.updateRealm, data);
        break;
      case 'load medication fields':
        let keys = Object.keys(data);
        keys.forEach((field)=>{
          this.updateState('by path and value', {path: `medlistComponent.${field}Field`, value: (field == 'strength' && typeof data[field] == 'number') ? data[field].toString() : data[field] });
        });
        break;
      case 'delete':
        this.updateRealm('delete', data);
        if (data.what == 'profile'){
          this.updateState('by path and value', {path: 'render.deleteProfile', value: false});
          this.setState({screen: 'home'});
        }
        break;
      case 'by path and value':
        let path = data.path.split(".");
        let root = path.shift();
        let value = (path[0] == 'strengthField' && data.value) ? data.value.toString() : data.value; 
        this.setState(prevState => {
          let rootProp = JSON.parse(JSON.stringify(prevState[root]));
          return { [root]: changeObjectByPath(rootProp, path, value) };                                
        });
        break;
    }
  }

  updateRealm(instruction, data){
    Realm.open({
      schema: schemas
    }).then(realm => {
      realm.write(() => {
        switch(instruction){
          case 'save':
            let objectToSave = {};
            let newPatient = (data.root == 'createProfileComponent') ? true : false;
            let patient = newPatient ? this.state[data.root].name : data.whose; 
            let primaryStateKey = returnPrimaryStateKey(data.keys); 
            objectToSave.name = patient; 
            if (newPatient){ objectToSave.birthday = this.state[data.root].birthday + "T00:00:00Z"; this.setState({screen: 'home'}); }
            else {
              let didUpdateList = false; 
              let listToUpdate = this.state.realm.objects('User').filtered(`name='${patient}'`)[0][data.what];
              listToUpdate = listToUpdate.map((item)=>{
                if (item[stateToRealm[primaryStateKey]] == data.which) {
                  data.keys.forEach((key)=>{
                    if (key == 'strengthField'){ item[stateToRealm[key]] = this.state[data.root][key] ? parseInt(this.state[data.root][key], 10) : 0;}
                    else {item[stateToRealm[key]] = this.state[data.root][key];}
                  });
                  didUpdateList = true;
                  return item;
                } else { return item; }
              });
              if (!didUpdateList) { listToUpdate.push({[stateToRealm[primaryStateKey]]: this.state[data.root][primaryStateKey]}); }
              objectToSave[data.what] = listToUpdate; 
            } 
            realm.create('User', objectToSave, !newPatient);
            break;
          case 'delete':
            if (data.what == 'profile') { 
              let medlist = this.state.realm.objects('User').filtered(`name='${data.which}'`)[0].medlist; 
              let imageList = medlist.map((item)=>{ return item.imageLocation; });
              imageList.forEach((imageURI)=>{ deletePreviousImage(imageURI); });
              realm.delete(realm.objects('User').filtered(`name='${data.which}'`)); 
            }
            else { 
              let list = this.state.realm.objects('User').filtered(`name='${data.whose}'`)[0][data.what]; 
              let index;
              list.forEach((item, i)=>{ if(item.name == data.which || item.tradeName == data.which){ index = i; } });
              if (data.what == 'medlist') { deletePreviousImage(list[index].imageLocation); }
              list.splice(index, 1);
              realm.create('User', {name: data.whose, [data.what]: list}, true);
            }
            break;
          case 'direct save':
            realm.create(data.schema, data.instance, data.rewrite);
            break;
        }
      });
      this.setState({ realm });
    });
  } 

  render() {
    return (
      <View style={styles.scrollContainer}>
      <ScrollView style={styles.appContainer} contentContainerStyle={{flexGrow: 1}}>
        {renderMessage(this.state, this.updateState)}
        {renderHome(this.state, this.updateState)}
        {createProfile(this.state, this.updateState, this.updateRealm)}
        {renderProfile(this.state, this.updateState)}
        {renderMedlist(this.state, this.updateState)}
        {renderTakePicture(this.state, this.updateState)}
        {this.state.screen !== 'home' ? <BarButton color='rgba(0, 155, 95, 1)' title="Home" onPress={()=>{this.updateState('by path and value', {path: 'screen', value: 'home'})}} /> : null } 
        {this.state.screen == 'home' ? <BarButton title='Update' onPress={()=>{ updateCompendium({updateRealm: this.updateRealm, state: this.state}); }} /> : null}
        {/*<Button title='Console.log Compendium' onPress={()=>{console.log(this.state.realm.objects('Compendium'))}} />*/}
        {/*<Button title='Purge images' onPress={()=>{purgeUnsavedImages();}} />*/}
      </ScrollView>
      </View>
    );
  }
}
/*
const darkMedicalGreen = 'rgba(0, 155, 110, 1)';
const lightMedicalGreen = 'rgba(235, 255, 235, 1)';

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: lightMedicalGreen,
  },
  appContainer: {
    flex: 1,
    backgroundColor: lightMedicalGreen,
  },
  home: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 50,
  },
  createProfile: {
    flex: 1,
    justifyContent: 'center'
  },
  name: {
    fontSize: 40, 
    color: darkMedicalGreen, 
    fontWeight: 'bold', 
    textAlign: 'center'
  },
  cameraContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: lightMedicalGreen,
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
    opacity: 0.5
  },
  image: {
    flex: 1,
    height: 150,
    width: 150,
    marginTop: 5
  },
  messageContainer: {
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'red'
  },
  messageText: {
    color: 'red',
    fontSize: 18,
    paddingHorizontal: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: darkMedicalGreen,
    padding: 6,
    marginBottom: 5
  },
  innerText: {
    paddingHorizontal: 5,
  },
  textInput: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: darkMedicalGreen,
    backgroundColor: 'white'
  },
  border: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: darkMedicalGreen,
    marginBottom: 5
  }
});
*/
export default App;