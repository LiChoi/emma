import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput, Button } from 'react-native';
import { RNCamera } from 'react-native-camera';

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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realm: null,
      message: null,
      render: {home: true, createProfileComponent: false, profileComponent: false, editAllergyDetails: false, editConditionDetails: false, editMedication: false, takePicture: false}, 
      createProfileComponent: {
        name: null,
        birthday: null
      },
      profileComponent: {
        currentProfile: null,
        allergyField: null,
        allergynDetailsField: null,
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
    this.renderHome = this.renderHome.bind(this);
    this.loadProfiles = this.loadProfiles.bind(this);
    this.createProfile = this.createProfile.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateRealm = this.updateRealm.bind(this);
    this.renderAllergyList = this.renderAllergyList.bind(this);
    this.renderProfile = this.renderProfile.bind(this);
    this.renderConditionList = this.renderConditionList.bind(this);
    this.renderEditConditionDetails = this.renderEditConditionDetails.bind(this);
    this.renderEditAllergyDetails = this.renderEditAllergyDetails.bind(this);
    this.renderMedlist = this.renderMedlist.bind(this);
    this.toggleEditMedication = this.toggleEditMedication.bind(this);
    this.renderTakePicture = this.renderTakePicture.bind(this);
    this.takePicture = this.takePicture.bind(this);
  }

  componentDidMount() {
    Realm.open({
      schema: schemas
    }).then(realm => {
      this.setState({ realm });
    });
  }

  //State and Realm management functions 
  async updateState(instruction, data) {
    switch(instruction) {
      case 'render createProfile':
        this.setState(prevState => {                             
          let render = JSON.parse(JSON.stringify(prevState.render));
          render.home = false; 
          render.createProfileComponent = true;                             
          return {render}
        });
        break;
      case 'profile saved':
        this.setState(prevState => {
          let createProfileComponent = JSON.parse(JSON.stringify(prevState.createProfileComponent));
          createProfileComponent.name = null;
          createProfileComponent.birthday = null; 
          let render = JSON.parse(JSON.stringify(prevState.render));  
          render.home = true;       
          render.createProfileComponent = false;
          return { createProfileComponent: createProfileComponent, render: render, message: null };                              
        });
        break;
      case 'render editAllergyDetails':
        this.setState(prevState => {
          let render = JSON.parse(JSON.stringify(prevState.render));
          render.editAllergyDetails = data.name;
          let profileComponent = JSON.parse(JSON.stringify(prevState.profileComponent));
          profileComponent.allergyDetailsField = data.details;
          return { render: render, profileComponent: profileComponent };                               
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
      case 'render profile':
        this.setState(prevState => {
          let profileComponent = JSON.parse(JSON.stringify(prevState.profileComponent));
          profileComponent.currentProfile = data;                               
          let render = JSON.parse(JSON.stringify(prevState.render));
          render.profileComponent = "overview";
          render.home = false;
          return { profileComponent: profileComponent, render: render };                                
        });
        break; 
      case 'render editConditionDetails':
        this.setState(prevState => {
          let render = JSON.parse(JSON.stringify(prevState.render));
          render.editConditionDetails = data.name;
          let profileComponent = JSON.parse(JSON.stringify(prevState.profileComponent));
          profileComponent.conditionDetailsField = data.details;
          return { render: render, profileComponent: profileComponent };                               
        });
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
      case 'render medlist':
        this.setState(prevState => {                             
          let render = JSON.parse(JSON.stringify(prevState.render));
          render.profileComponent = "medlist";
          render.takePicture = false;
          return { render };                                
        });
        break; 
      case 'toggleEditMedication':
        this.setState(prevState => {                             
          let render = JSON.parse(JSON.stringify(prevState.render));
          render.editMedication = data.tradeName;
          let medlistComponent = JSON.parse(JSON.stringify(prevState.medlistComponent));
          medlistComponent.tradeNameField = data.tradeName; 
          medlistComponent.chemicalNameField = data.chemicalName; 
          medlistComponent.strengthField = data.strength ? data.strength.toString() : data.strength;
          medlistComponent.unitField = data.unit; 
          medlistComponent.directionsField = data.directions; 
          medlistComponent.purposeField = data.purpose; 
          medlistComponent.prescriberField = data.prescriber; 
          medlistComponent.notesField = data.notes;
          medlistComponent.imageLocationField = data.imageLocation;
          return { render: render, medlistComponent: medlistComponent };                                
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
      case 'back to profile':
        this.setState(prevState => {                             
          let render = JSON.parse(JSON.stringify(prevState.render));
          render.profileComponent = "overview";
          return { render };                                
        });
        break; 
      case 'update input field':
        this.setState(prevState => {
          let component = JSON.parse(JSON.stringify(prevState[data.component]));
          component[data.field] = data.text;                                
          return { [data.component]: component };                                
        });
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
      case 'render takePicture':
        this.setState(prevState => {                             
          let render = JSON.parse(JSON.stringify(prevState.render));
          Object.keys(render).map((key, i)=>{
            if (key == 'takePicture'){ render[key] = true; }
            else if (key !== 'editMedication') { render[key] = false; }
          });
          return { render };                                
        });
        break; 
      case 'return home':
        this.setState(prevState => {
          let render = JSON.parse(JSON.stringify(prevState.render));
          let createProfileComponent = JSON.parse(JSON.stringify(prevState.createProfileComponent));
          Object.keys(render).map(function(key, index) {
            switch(key){
              case 'allergyListComponent': 
                if(render[key] = true){
                  createProfileComponent.allergyListComponent.list = [];
                }
                break;
            }
            key == 'home' ? render[key] = true : render[key] = false;
          });
          return { render: render, createProfileComponent: createProfileComponent };                                
        });
        break;  
    }
  }

  updateRealm(instruction, data){
    function validateDate(dateStr){
      //YYYY-MM-DD
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
  //End of State and Realm management functions 

  //The Home component and all subcomponent functions
  renderHome(){
    if (this.state.render.home){
      return (
        <View style={styles.home}>
          <Text>Select a profile</Text>
          {this.loadProfiles()}
          <Text>Create new profile</Text>
          <Button title="new" onPress={()=>{this.updateState('render createProfile')}} />
        </View>
      );
    }
  }

  loadProfiles() {
    if (this.state.realm){
      let users = this.state.realm.objects('User');
      if (users.length > 0){
        return (
          <View>
            {
              users.map((user, i)=>{
                return(
                  <Button key={"username "+i} title={user.name} onPress={()=>{this.updateState('render profile', user.name)}} />
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
  //End of Home and its subcomponent functions 

  //Beginning of createProfileComponent and all its subcomponenets 
  createProfile() {
    if (this.state.render.createProfileComponent){
      return (
        <View>
          <TextInput
            placeholder="Enter name"
            onChangeText={(text) => {this.updateState('update input field', {component: 'createProfileComponent', field: 'name', text: text});}}
            value={this.state.createProfileComponent.name} 
          />
          <TextInput
            placeholder="Birthday YYYY-MM-DD"
            onChangeText={(text)=>{this.updateState('update input field', {component: 'createProfileComponent', field: 'birthday', text: text })}}
            value={this.state.createProfileComponent.birthday}  
          />
          <Button title="Submit" onPress={()=>{this.updateRealm('save new profile', this.state)}} />
        </View>
      );
    }
  }
  //End of createProfileComponent

  //Beginning of profile componenent and its subcomponenets
  renderProfile(){
    if (this.state.render.profileComponent == 'overview'){
      return (
        <View>
          <Text>Name:</Text>
          <Text>{this.state.profileComponent.currentProfile}</Text>
          <Text>Birthday:</Text>
          <Text>{this.state.realm.objects('User').map((user, i)=>{if(user.name == this.state.profileComponent.currentProfile){return user.birthday.toString();}})}</Text>
          <Text>Allergies:</Text>
          {this.renderAllergyList()}
          <TextInput 
            placeholder='Enter new allergy'
            onChangeText={(text)=>{this.updateState('update input field', {component: 'profileComponent', field: 'allergyField', text: text })}}
            value={this.state.profileComponent.allergyField} 
          />
          <Button title='Add allergy' onPress={()=>{this.updateState('add to list', {component: 'profileComponent', field: 'allergyField'})}} />
          <Text>Medical Conditions:</Text>
          {this.renderConditionList()}
          <TextInput 
            placeholder='Enter a new condition'
            onChangeText={(text)=>{this.updateState('update input field', {component: 'profileComponent', field: 'conditionField', text: text })}}
            value={this.state.profileComponent.conditionField} 
          />
          <Button title='Add condition' onPress={()=>{this.updateState('add to list', {component: 'profileComponent', field: 'conditionField'})}} />
          <Button title='View med list' onPress={()=>{this.updateState('render medlist'), this.state}} />
        </View>
      );
    }
  }

  renderAllergyList() {
    return (
      <View>
        {
          this.state.realm.objects('User').filtered(`name='${this.state.profileComponent.currentProfile}'`)[0].allergies.map((allergy, i)=>{
            return (
              <View key={allergy.name + i}>
                <Text>Allergy: {allergy.name}</Text>
                <Text>Details: {allergy.details}</Text>
                {this.renderEditAllergyDetails(allergy)}
              </View>
            );
          })
        }
      </View>
    );
  }

  renderEditAllergyDetails(allergy){
    if (this.state.render.editAllergyDetails !== allergy.name){
      return (
        <View>
          <Button title='Edit Details' onPress={()=>{this.updateState('render editAllergyDetails', allergy)}} />
        </View>
      );
    } else {
      return (
        <View>
          <TextInput 
            placeholder="Enter details"
            onChangeText={(text)=>{this.updateState('update input field', {component: 'profileComponent', field: 'allergyDetailsField', text: text })}}
            value={this.state.profileComponent.allergyDetailsField} 
          />
          <Button title='Save Details' onPress={()=>{this.updateState('save allergy details', allergy.name)}} />
        </View>
      );
    }
  }

  renderConditionList(){
    return (
      <View>
        {
          this.state.realm.objects('User').filtered(`name='${this.state.profileComponent.currentProfile}'`)[0].conditions.map((condition, i)=>{
            return (
              <View key={condition.name + i}>
                <Text>Condition: {condition.name}</Text>
                <Text>Details: {condition.details}</Text>
                {this.renderEditConditionDetails(condition)}
              </View>
            );
          })
        }
      </View>
    );
  }

  renderEditConditionDetails(condition){
    if (this.state.render.editConditionDetails !== condition.name){
      return (
        <View>
          <Button title='Edit Details' onPress={()=>{this.updateState('render editConditionDetails', condition)}} />
        </View>
      );
    } else {
      return (
        <View>
          <TextInput 
            placeholder="Enter details"
            onChangeText={(text)=>{this.updateState('update input field', {component: 'profileComponent', field: 'conditionDetailsField', text: text })}}
            value={this.state.profileComponent.conditionDetailsField} 
          />
          <Button title='Save Details' onPress={()=>{this.updateState('save condition details', condition.name)}} />
        </View>
      );
    }
  }
  //End of profile component and its subcomponenets

  //Beginning of medlist component and its subcomponents
  renderMedlist(){
    if (this.state.render.profileComponent == 'medlist'){
      return (
        <View>
          <Text>Medication List</Text>
          {
            this.state.realm.objects('User').filtered(`name='${this.state.profileComponent.currentProfile}'`)[0].medlist.map((medication, i)=>{
              return (
                <View key={medication.tradeName + i}>
                  {this.toggleEditMedication(medication)}
                </View>
              );
            })
          }
          <TextInput 
            placeholder='Enter another medication'
            onChangeText={(text)=>{this.updateState('update input field', {component: 'medlistComponent', field: 'medicationField', text: text })}}
            value={this.state.medlistComponent.medicationField} 
          />
          <Button title='Add new medication' onPress={()=>{this.updateState('add to list', {component: 'medlistComponent', field: 'medicationField'})}} />
          <Button title='Back to profile' onPress={()=>{this.updateState('back to profile')}} />
        </View>
      );
    }
  }

  toggleEditMedication(medication){
    if (this.state.render.editMedication == medication.tradeName) {
      return (
        <View>
          <Text>Trade name:</Text> 
          <TextInput 
            placeholder='Enter trade name'
            onChangeText={(text)=>{this.updateState('update input field', {component: 'medlistComponent', field: 'tradeNameField', text: text })}}
            value={this.state.medlistComponent.tradeNameField} 
          />
          <Text>Chemical name:</Text>
          <TextInput 
            placeholder='Enter chemical name'
            onChangeText={(text)=>{this.updateState('update input field', {component: 'medlistComponent', field: 'chemicalNameField', text: text })}}
            value={this.state.medlistComponent.chemicalNameField} 
          />
          <Text>Strength:</Text>
          <TextInput 
            placeholder='Enter strength'
            onChangeText={(text)=>{this.updateState('update input field', {component: 'medlistComponent', field: 'strengthField', text: text })}}
            value={this.state.medlistComponent.strengthField ? this.state.medlistComponent.strengthField.toString(): '0'} 
          />
          <Text>Strength units:</Text>
          <TextInput 
            placeholder='Enter strength unit'
            onChangeText={(text)=>{this.updateState('update input field', {component: 'medlistComponent', field: 'unitField', text: text })}}
            value={this.state.medlistComponent.unitField} 
          />
          <Text>Used for:</Text>
          <TextInput 
            placeholder='Enter indication'
            onChangeText={(text)=>{this.updateState('update input field', {component: 'medlistComponent', field: 'purposeField', text: text })}}
            value={this.state.medlistComponent.purposeField} 
          />
          <Text>Prescriber:</Text>
          <TextInput 
            placeholder='Enter prescriber'
            onChangeText={(text)=>{this.updateState('update input field', {component: 'medlistComponent', field: 'prescriberField', text: text })}}
            value={this.state.medlistComponent.prescriberField} 
          />
          <Text>Directions:</Text>
          <TextInput 
            placeholder='Enter directions'
            onChangeText={(text)=>{this.updateState('update input field', {component: 'medlistComponent', field: 'directionsField', text: text })}}
            value={this.state.medlistComponent.directionsField} 
          />
          <Text>Notes:</Text>
          <TextInput 
            placeholder='Enter additional notes'
            onChangeText={(text)=>{this.updateState('update input field', {component: 'medlistComponent', field: 'notesField', text: text })}}
            value={this.state.medlistComponent.notesField} 
          />
          <Button title='Take Picture' onPress={()=>{this.updateState('render takePicture', medication)}} />
          <Button title='Save' onPress={()=>{this.updateState('save medication', {prevTradeName: medication.tradeName, stateProp: 'medlistComponent', fields: Object.keys(this.state.medlistComponent).slice(1)} )}} />
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
          <Image style={styles.image} source={{uri: medication.imageLocation}} />
          <Button title='Edit' onPress={()=>{this.updateState('toggleEditMedication', medication)}} />
        </View>
      );     
    }
  }
  //End of medlist componenet and subcomponenets

  //Beginning of takePicture and its subcomponents
  renderTakePicture(){
    if(this.state.render.takePicture){
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
                  <TouchableOpacity onPress={() => this.takePicture(camera)} style={styles.capture}>
                    <Text style={{ fontSize: 14 }}> SNAP </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          </RNCamera>
          <Button title='Back to Profile' onPress={()=>{this.updateState('render medlist')}} />
        </View>
      );
    }
  }

  takePicture = async function(camera) {
    const options = { quality: 0.5, base64: true };
    const data = await camera.takePictureAsync(options);
    //  eslint-disable-next-line
    //console.log(data.uri);
    //this.setState({photoURI: data.uri});
    this.updateState('update input field', {component: 'medlistComponent', field: 'imageLocationField', text: data.uri});
  }

  //End of takePicture and its subcomponents

  render() {
    return (
      <ScrollView style={styles.appContainer}>
        {this.renderHome()}
        {this.createProfile()}
        {this.renderProfile()}
        {this.renderMedlist()}
        {this.renderTakePicture()}
        <Button title="Home" onPress={()=>{this.updateState('return home')}} />
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
