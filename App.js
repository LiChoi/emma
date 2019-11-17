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
        <Button title="Submit" onPress={()=>{updateRealm('save new profile', state)}} />
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
        <Button title='Add allergy' onPress={()=>{updateState('add to list', {component: 'profileComponent', field: 'allergyField'})}} />
        <Text>Medical Conditions:</Text>
        {renderConditionList(state, updateState)}
        <TextInput 
          placeholder='Enter a new condition'
          onChangeText={(text)=>{updateState('by path and value', {path: 'profileComponent.conditionField', value: text })}}
          value={state.profileComponent.conditionField} 
        />
        <Button title='Add condition' onPress={()=>{updateState('add to list', {component: 'profileComponent', field: 'conditionField'})}} />
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
        <Button title='Edit Details' onPress={()=>{updateState('by path and value', {path: 'render.editAllergyDetails', value: allergy.name}); updateState('by path and value', {path: 'profileComponent.allergyDetailsField', value: allergy.details})}} />
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
        <Button title='Save Details' onPress={()=>{updateState('save allergy details', allergy.name)}} />
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
        <Button title='Edit Details' onPress={()=>{updateState('by path and value', {path: 'render.editConditionDetails', value: condition.name}); updateState('by path and value', {path: 'profileComponent.conditionDetailsField', value: condition.details})}} />
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
        <Button title='Save Details' onPress={()=>{updateState('save condition details', condition.name)}} />
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
          onChangeText={(text)=>{updateState('by path and value', {path: 'medlistComponent.medicationField', value: text })}}
          value={state.medlistComponent.medicationField} 
        />
        <Button title='Add new medication' onPress={()=>{updateState('add to list', {component: 'medlistComponent', field: 'medicationField'})}} />
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
        {toggleMedicationField(state, updateState, 'tradeName')}
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
        <Button title='Save' onPress={()=>{updateState('save medication', {prevTradeName: medication.tradeName, stateProp: 'medlistComponent', fields: Object.keys(state.medlistComponent).slice(1)} )}} />
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
        <Button title='Edit' onPress={()=>{updateState('by path and value', {path: 'render.editMedication', value: medication.tradeName}); updateState('load medication fields', medication);}} />
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
            .then(() => console.log('FILE DELETED'))
        }
      }) 
  }
}
//End of takePicture and its subcomponents

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
        medicationField: null,
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
      case 'profile saved':
        this.setState(prevState => {
          let createProfileComponent = JSON.parse(JSON.stringify(prevState.createProfileComponent));
          createProfileComponent.name = null;
          createProfileComponent.birthday = null; 
          return { createProfileComponent: createProfileComponent, screen: 'home', message: null };                              
        });
        break;
      case 'save allergy details':
        let textExists3= /\S/.test(this.state.profileComponent.allergyDetailsField);
        if (textExists3){
          await this.updateRealm('save allergy details', data); 
          this.setState(prevState => {
            let render = JSON.parse(JSON.stringify(prevState.render));
            render.editAllergyDetails = false;                  
            return { render };                                
          });
        } else {
          this.setState({message: "Cannot be empty"});
        }
        break;
      case 'save condition details':
        let textExists2 = /\S/.test(this.state.profileComponent.conditionDetailsField);
        if (textExists2){
          await this.updateRealm('save condition details', data); 
          this.setState(prevState => {
            let render = JSON.parse(JSON.stringify(prevState.render));
            render.editConditionDetails = false;                  
            return { render };                                
          });
        } else {
          this.setState({message: "Cannot be empty"});
        }
        break; 
      case 'load medication fields':
        let keys = Object.keys(data);
        keys.forEach((field)=>{
          this.updateState('by path and value', {path: `medlistComponent.${field}Field`, value: data[field]});
        });
        break;
      case 'save medication':
        let stateProp = data.stateProp;
        let fields = data.fields;
        let incorrectInputMessage = "";
        fields.forEach((field)=>{
          if (field == 'strengthField' && this.state[stateProp][field] && /[^0-9]/.test(this.state[stateProp][field]) ){ incorrectInputMessage = incorrectInputMessage.concat(`${field} must be a number. `); }
        });
        if (incorrectInputMessage == ""){
          await this.updateRealm('save medication', data); 
          this.setState(prevState => {
            let render = JSON.parse(JSON.stringify(prevState.render));
            render.editMedication = false;                  
            return { render: render, message: null };                                
          });
        } else {
          this.setState({message: incorrectInputMessage});
        }
        break;
      case 'delete':
        this.updateRealm('delete', data);
        if (data.what == 'profile'){
          this.updateState('by path and value', {path: 'render.deleteProfile', value: false});
          this.setState({screen: 'home'});
        }
        break;
      case 'add to list':
        let notEmpty = /\S/.test(this.state[data.component][data.field]);
        if (notEmpty && this.state[data.component][data.field]){
          await this.updateRealm('add to list', data); 
          this.setState(prevState => {
            let component = JSON.parse(JSON.stringify(prevState[data.component]));
            component[data.field] = null;                                
            return { [data.component]: component };                                
          });
        } else {
          this.setState({message: "Cannot be empty"});
        }
        break;
      case 'by path and value':
        let path = data.path.split(".");
        let root = path.shift();
        let value = (path[0] == 'strengthField' && data.value) ? data.value.toString() : data.value; 
        this.setState(prevState => {
          let rootProp = JSON.parse(JSON.stringify(prevState[root]));
          if (path.length == 0){ rootProp = value; } else { rootProp[eval(path)] = value; }
          return { [root]: rootProp };                                
        });
        break;
    }
  }

  updateRealm(instruction, data){
    function validateDate(dateStr){
      //YYYY-MM-DD format
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

    Realm.open({
      schema: schemas
    }).then(realm => {
      realm.write(() => {
        switch(instruction){
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
              list.splice(index, 1);
              realm.create('User', {name: data.whose, [data.what]: list}, true);
            }
            break;
          case 'save new profile':
            let validDate = validateDate(this.state.createProfileComponent.birthday);
            let birthday = validDate ? new Date(this.state.createProfileComponent.birthday + "T10:59:30Z") : null;
            let name = this.state.createProfileComponent.name? this.state.createProfileComponent.name : null;
            if (!birthday || !name){
              let message = "The following fields have been entered incorrectly: ";
              message = !birthday ? message.concat("birthday (must be YYYY-MM-DD), ") : message;
              message = !name ? message.concat("name (must not be empty), ") : message;
              this.setState({message: message});
              break; 
            }
            realm.create('User', {
              name: name,
              birthday: birthday
            });
            this.updateState('profile saved', this.state);
            break;
          case 'add to list':
            const fieldToSave = {allergyField: {listName: 'allergies', itemName: 'name'}, conditionField: {listName: 'conditions', itemName: 'name'}, medicationField: {listName: 'medlist', itemName: 'tradeName'}}; 
            let list = this.state.realm.objects('User').filtered(`name='${this.state.profileComponent.currentProfile}'`)[0][fieldToSave[data.field].listName];
            list.push({[fieldToSave[data.field].itemName]: this.state[data.component][data.field]});
            realm.create('User', {name: this.state.profileComponent.currentProfile, [fieldToSave[data.field].listName]: list}, true);
            break;
          case 'save condition details':
            let conditionList2 = this.state.realm.objects('User').filtered(`name='${this.state.profileComponent.currentProfile}'`)[0].conditions;
            conditionList2 = conditionList2.map((condition, i)=>{
              if (condition.name == data){
                return {name: data, details: this.state.profileComponent.conditionDetailsField};
              } else {
                return condition; 
              }
            });
            realm.create('User', {name: this.state.profileComponent.currentProfile, conditions: conditionList2}, true);
            break;
          case 'save allergy details':
            let allergyList2 = this.state.realm.objects('User').filtered(`name='${this.state.profileComponent.currentProfile}'`)[0].allergies;
            allergyList2 = allergyList2.map((allergy, i)=>{
              if (allergy.name == data){
                return {name: data, details: this.state.profileComponent.allergyDetailsField};
              } else {
                return allergy; 
              }
            });
            realm.create('User', {name: this.state.profileComponent.currentProfile, allergies: allergyList2}, true);
            break;
          case 'save medication':
            let medlist2 = this.state.realm.objects('User').filtered(`name='${this.state.profileComponent.currentProfile}'`)[0].medlist;
            medlist2 = medlist2.map((medication, i)=>{
              if (medication.tradeName == data.prevTradeName){
                data.fields.forEach((field)=>{
                  if (field == 'strengthField' && this.state[data.stateProp][field]){
                    medication[field.replace('Field', '')] = parseInt(this.state[data.stateProp][field], 10);
                  } else if (field == 'strengthField' && !this.state[data.stateProp][field]) {
                    medication[field.replace('Field', '')] = 0;
                  } else {
                    medication[field.replace('Field', '')] = this.state[data.stateProp][field];
                  }
                });
                return medication;
              } else {
                return medication; 
              }
            });
            realm.create('User', {name: this.state.profileComponent.currentProfile, medlist: medlist2}, true);
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
