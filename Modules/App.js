import React, { Component } from 'react';
import { View, ScrollView, Button } from 'react-native';

import {renderMessage, BarButton} from './Common';
import {styles} from './Styles';
import {renderHome} from './Home.js';
import {createProfile} from './CreateProfile.js';
import {renderProfile} from './Profile';
import {renderMedlist} from './Medlist';
import { renderTakePicture, deletePreviousImage, purgeAllImages} from './Camera';
import {renderEmmaAsks} from './EmmaAsks';

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
    strength: 'float?',
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
    strengths: 'float[]',
    unit: 'string',
    class: 'string',
    indications: 'string[]',
    interactionTags: 'Interaction[]',
    crossAllergies: 'string[]',
    contraindications: 'string[]',
    doseRange: 'float[]'
  }
};

const interactionTagSchema = {
  name: 'Interaction',
  properties: {
    tag: 'string',
    tagType: 'string',
    effect: 'string?',
    severity: 'string?'
  }
};

const schemas = [userSchema, conditionSchema, allergySchema, medicationSchema, compendiumSchema, interactionTagSchema];
//End of realm constants

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
      errorMessage = ( state[data.root][key] && ( /[^0-9\.]/.test(state[data.root][key]) || (!parseFloat(state[data.root][key]) && parseFloat(state[data.root][key]) !== 0) || (state[data.root][key].match(/\./g) || []).length > 1 ) ) ? errorMessage.concat('Must be a number. ') : errorMessage;
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

//HTTP functions
const updateCompendium = (data) => {
  fetch('https://emma-server.glitch.me').then((response) => response.json()).then((responseJson) => {
      console.log(responseJson);
      Object.getOwnPropertyNames(responseJson).forEach(key=>{
        data.updateRealm('direct save', {schema: 'Compendium', instance: responseJson[key], rewrite: data.state.realm.objects('Compendium').filtered(`chemicalName='${responseJson[key].chemicalName}'`).length > 0 ? true : false });
      })
      return responseJson;
  }).catch((error) => {
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
      },
      tradeNameList: [],
      emmaAsksComponent: ["Emma can't think of any questions."]
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
          this.updateState('by path and value', {path: `medlistComponent.${field}Field`, value: (field == 'strength' && typeof data[field] == 'number') ? (Math.round(data[field]*1000)/1000).toString() : data[field] });
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
          let rootProp = prevState[root] ? JSON.parse(JSON.stringify(prevState[root])) : null;
          return { [root]: rootProp ? changeObjectByPath(rootProp, path, value) : value };                                
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
                    if (key == 'strengthField'){ item[stateToRealm[key]] = this.state[data.root][key] ? parseFloat(this.state[data.root][key]) : 0;}
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
        {renderEmmaAsks(this.state, this.updateState)}
        {this.state.screen !== 'home' ? <BarButton color='rgba(0, 155, 95, 1)' title="Home" onPress={()=>{this.updateState('by path and value', {path: 'screen', value: 'home'})}} /> : null } 
        {this.state.screen == 'home' ? <BarButton title='Update' onPress={()=>{ updateCompendium({updateRealm: this.updateRealm, state: this.state}); }} /> : null}
        {/*<Button title='Console.log Compendium' onPress={()=>{console.log(this.state.realm.objects('Compendium'))}} />*/}
        {/*<Button title='Purge images' onPress={()=>{purgeAllImages();}} />*/}
      </ScrollView>
      </View>
    );
  }
}

export default App;