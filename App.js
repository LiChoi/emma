import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput, Button } from 'react-native';
import { RNCamera } from 'react-native-camera';
const RNFS = require('react-native-fs');

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

const schemas = [userSchema, conditionSchema, allergySchema, medicationSchema];
//End of realm constants

//Beginning of renderHome component and its subcomponents
const renderHome = (state, updateState) => {
  if (state.screen == 'home'){
    return (
      <View style={styles.home}>
        <Text>Select a profile</Text>
        {loadProfiles(state, updateState)}
        <Text>Create new profile</Text>
        <Button title="new" onPress={()=>{updateState('by path and value', {path: 'screen', value: 'createProfile'})}} />
      </View>
    );
  }
}

const loadProfiles = (state, updateState) => {
  if (state.realm){
    let users = state.realm.objects('User');
    if (users.length > 0){
      return (
        <View>
          {
            users.map((user, i)=>{
              return(
                <Button key={"username "+i} title={user.name} onPress={()=>{updateState('by path and value', {path: 'screen', value: 'profile'}); updateState('by path and value', {path: 'profileComponent.currentProfile', value: user.name})}} />
              );
            })
          }
        </View>
      );
    } else {
      return (
        <Text>No profile found</Text>
      )
    }
  } else {
    return (
      <Text>Loading...</Text>
    );
  }
}
//End of renderHome et al

//Beginning of createProfileComponent and all its subcomponenets 
const createProfile = (state, updateState, updateRealm) => {
  if (state.screen == 'createProfile'){
    return (
      <View>
        <TextInput
          placeholder="Enter name"
          onChangeText={(text) => {updateState('by path and value', {path: 'createProfileComponent.name', value: text});}}
          value={state.createProfileComponent.name} 
        />
        <TextInput
          placeholder="Birthday YYYY-MM-DD"
          onChangeText={(text)=>{updateState('by path and value', {path: 'createProfileComponent.birthday', value: text })}}
          value={state.createProfileComponent.birthday}  
        />
        <Button title="Submit" onPress={()=>{updateState('save', {root: 'createProfileComponent', keys: Object.keys(state.createProfileComponent) })}} />
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
        <Text>Name:</Text>
        <Text>{state.profileComponent.currentProfile}</Text>
        <Text>Birthday:</Text>
        <Text>{state.realm.objects('User').map((user, i)=>{if(user.name == state.profileComponent.currentProfile){return user.birthday.toString();}})}</Text>
        <Text>Allergies:</Text>
        {renderAllergyList(state, updateState)}
        <TextInput 
          placeholder='Enter new allergy'
          onChangeText={(text)=>{updateState('by path and value', {path: 'profileComponent.allergyField', value: text })}}
          value={state.profileComponent.allergyField} 
        />
        <Button title='Add allergy' onPress={()=>{updateState('save', {what: 'allergies', whose: state.profileComponent.currentProfile, root: 'profileComponent', keys: ['allergyField']}); }} />
        <Text>Medical Conditions:</Text>
        {renderConditionList(state, updateState)}
        <TextInput 
          placeholder='Enter a new condition'
          onChangeText={(text)=>{updateState('by path and value', {path: 'profileComponent.conditionField', value: text })}}
          value={state.profileComponent.conditionField} 
        />
        <Button title='Add condition' onPress={()=>{updateState('save', {what: 'conditions', whose: state.profileComponent.currentProfile, root: 'profileComponent', keys: ['conditionField']}); }} />
        <Button title='View med list' onPress={()=>{updateState('by path and value', {path: 'screen', value: 'medlist'})}} />
        {deleteProfile(state, updateState)}
      </View>
    );
  }
}

const deleteProfile = (state, updateState) => {
  if (!state.render.deleteProfile){
    return (
      <Button title='Delete profile' onPress={()=>{updateState('by path and value', {path: 'render.deleteProfile', value: true})}} />
    );
  } else {
    return (
      <View>
        <Text>Are you certain you want to permanently delete this profile?</Text>
        <Button title="Yes, I'm sure" onPress={()=>{updateState('delete', {what: 'profile', which: state.profileComponent.currentProfile})}} />
        <Button title='Do not delete' onPress={()=>{updateState('by path and value', {path: 'render.deleteProfile', value: false})}} />
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
            <View key={allergy.name + i}>
              <Text>Allergy: {allergy.name}</Text>
              <Text>Details: {allergy.details}</Text>
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
        <Button title='Edit Details' onPress={()=>{updateState('by path and value', {path: 'render.editAllergyDetails', value: allergy.name}); updateState('by path and value', {path: 'profileComponent.allergyField', value: allergy.name}); updateState('by path and value', {path: 'profileComponent.allergyDetailsField', value: allergy.details})}} />
      </View>
    );
  } else {
    return (
      <View>
        <TextInput 
          placeholder="Enter details"
          onChangeText={(text)=>{updateState('by path and value', {path: 'profileComponent.allergyDetailsField', value: text })}}
          value={state.profileComponent.allergyDetailsField} 
        />
        <Button title='Save Details' onPress={()=>{updateState('save', {what: 'allergies', whose: state.profileComponent.currentProfile, which: allergy.name, root: 'profileComponent', keys: ['allergyDetailsField', 'allergyField']}); updateState('by path and value', {path: 'render.editAllergyDetails', value: false}); }} />
        <Button title='Delete Allergy' onPress={()=>{updateState('delete', {what: 'allergies', whose: state.profileComponent.currentProfile, which: allergy.name})}} />
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
            <View key={condition.name + i}>
              <Text>Condition: {condition.name}</Text>
              <Text>Details: {condition.details}</Text>
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
      <View>
        <Button title='Edit Details' onPress={()=>{updateState('by path and value', {path: 'render.editConditionDetails', value: condition.name}); updateState('by path and value', {path: 'profileComponent.conditionField', value: condition.name}) ; updateState('by path and value', {path: 'profileComponent.conditionDetailsField', value: condition.details}); }} />
      </View>
    );
  } else {
    return (
      <View>
        <TextInput 
          placeholder="Enter details"
          onChangeText={(text)=>{updateState('by path and value', {path: 'profileComponent.conditionDetailsField', value: text })}}
          value={state.profileComponent.conditionDetailsField} 
        />
        <Button title='Save Details' onPress={()=>{updateState('save', {what: 'conditions', whose: state.profileComponent.currentProfile, which: condition.name, root: 'profileComponent', keys: ['conditionDetailsField', 'conditionField']}); updateState('by path and value', {path: 'render.editConditionDetails', value: false}); }} />
        <Button title='Delete Condition' onPress={()=>{updateState('delete', {what: 'conditions', whose: state.profileComponent.currentProfile, which: condition.name})}} />
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
        <Text>Medication List</Text>
        {
          state.realm.objects('User').filtered(`name='${state.profileComponent.currentProfile}'`)[0].medlist.map((medication, i)=>{
            return (
              <View key={medication.tradeName + i}>
                {toggleEditMedication(state, updateState, medication)}
              </View>
            );
          })
        }
        <TextInput 
          placeholder='Enter another medication'
          onChangeText={(text)=>{updateState('by path and value', {path: 'medlistComponent.tradeNameField', value: text })}}
          value={state.medlistComponent.tradeNameField} 
        />
        <Button title='Add medication' onPress={()=>{updateState('save', {what: 'medlist', whose: state.profileComponent.currentProfile, root: 'medlistComponent', keys: ['tradeNameField']}); }} />
        <Button title='Back to profile' onPress={()=>{updateState('by path and value', {path: 'screen', value: 'profile'})}} />
      </View>
    );
  }
}

const toggleMedicationField = (state, updateState, field) => {
  return (
    <TextInput 
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
        <Text>Trade name:</Text>
        <Text>{state.medlistComponent.tradeNameField}</Text>
        <Text>Chemical name:</Text>
        {toggleMedicationField(state, updateState, 'chemicalName')}
        <Text>Strength:</Text>
        {toggleMedicationField(state, updateState, 'strength')}
        <Text>Unit:</Text>
        {toggleMedicationField(state, updateState, 'unit')}
        <Text>Used for:</Text>
        {toggleMedicationField(state, updateState, 'purpose')}
        <Text>Prescriber:</Text>
        {toggleMedicationField(state, updateState, 'prescriber')}
        <Text>Directions:</Text>
        {toggleMedicationField(state, updateState, 'directions')}
        <Text>Notes:</Text>
        {toggleMedicationField(state, updateState, 'notes')}
        <Text>Image:</Text>
        <Image style={styles.image} source={{uri: state.medlistComponent.imageLocationField}} />
        <Button title='Take Picture' onPress={()=>{updateState('by path and value', {path: 'screen', value: 'takePicture'})}} />
        <Button title='Save' onPress={()=>{updateState('save', {what: 'medlist', whose: state.profileComponent.currentProfile, which: medication.tradeName, root: 'medlistComponent', keys: Object.keys(state.medlistComponent)}); }} />
        <Button title='Delete Medication' onPress={()=>{updateState('delete', {what: 'medlist', whose: state.profileComponent.currentProfile, which: medication.tradeName})}} />
      </View>
    );
  } else {
    return (
      <View>
        <Text>Trade name: {medication.tradeName}</Text>
        <Text>Chemical name: {medication.chemicalName}</Text>
        <Text>Strength: {medication.strength+medication.unit}</Text>
        <Text>Used for: {medication.purpose}</Text>
        <Text>Prescriber: {medication.prescriber}</Text>
        <Text>Directions: {medication.directions}</Text>
        <Text>Notes: {medication.notes}</Text>
        <Text>Image:</Text>
        <Image style={styles.image} source={{uri: medication.imageLocation}} />
        <Button title='Edit' onPress={()=>{updateState('by path and value', {path: 'render.editMedication', value: medication.tradeName}); updateState('load medication fields', medication); deletePreviousImage(state.medlistComponent.imageLocationField);}} />
      </View>
    );     
  }
}
//End of medlist componenet and subcomponenets

//Beginning of takePicture and its subcomponents
const renderTakePicture = (state, updateState) =>{
  if (state.screen == 'takePicture'){
    return (
      <View>
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
          ratio="1:1" //Not all aspect ratios are supported. There's a function that returns list of supported ratios.
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
        <Button title='Back to medlist' onPress={()=>{updateState('by path and value', {path: 'screen', value: 'medlist'})}} />
      </View>
    );
  }
}

const takePicture = async function(state, updateState, camera) {
  const options = { quality: 0.5, base64: true };
  const data = await camera.takePictureAsync(options);
  deletePreviousImage(state.medlistComponent.imageLocationField);
  updateState('by path and value', {path: 'medlistComponent.imageLocationField', value: data.uri});
  updateState('by path and value', {path: 'screen', value: 'medlist'});
}

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
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

//Miscellaneous functions and constants
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

const clearInputFields = (updateState, root, keys) => { keys.forEach((key)=>{ updateState('by path and value', {path: root+"."+key, value: null}); }); }

const saveToRealm = async (state, updateState, updateRealm, data) => {
  let error = checkInputCorrect(state, data);
  if (error){ updateState('by path and value', {path: 'message', value: error}); }
  else { await updateRealm('save', data); clearInputFields(updateState, data.root, data.keys); updateState('by path and value', {path: 'render.editMedication', value: false}); }
}
//End of miscellaneous functions

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
          this.updateState('by path and value', {path: `medlistComponent.${field}Field`, value: data[field]});
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
        }
      });
      this.setState({ realm });
    });
  }

  render() {
    return (
      <ScrollView style={styles.appContainer}>
        {renderHome(this.state, this.updateState)}
        {createProfile(this.state, this.updateState, this.updateRealm)}
        {renderProfile(this.state, this.updateState)}
        {renderMedlist(this.state, this.updateState)}
        {renderTakePicture(this.state, this.updateState)}
        <Button title="Home" onPress={()=>{this.updateState('by path and value', {path: 'screen', value: 'home'})}} />
        <Button title='Purge images' onPress={()=>{purgeUnsavedImages();}} />
        <Text>{this.state.message}</Text>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1
  },
  home: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  camera: {
    height: 500,
    justifyContent: "center"
  },
  preview: {
    width: 200, //Can only adjust width size, and height will be determined by aspect ratio
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20
  },
  image: {
    flex: 1,
    height: 200,
    width: 200,
    backgroundColor: 'red'
  }
});

export default App;