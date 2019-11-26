import React, { Component } from 'react';
import { Text, TextInput, Image, View, ScrollView, Button } from 'react-native';
import {BarButton, TextButton} from './Common';
import {styles} from './Styles';
import {deletePreviousImage} from './Camera';

export const renderMedlist = (state, updateState) => {
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
          <TextButton title='Add+' onPress={()=>{ checkMedicationBeforeSave({state: state, updateState: updateState, input: state.medlistComponent.tradeNameField, list: state.realm.objects('Compendium')}); }} />
          {noDrugMatch(state, updateState)}
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
                <TextButton 
                    title='Save' 
                    onPress={()=>{
                        updateState('save', {what: 'medlist', whose: state.profileComponent.currentProfile, which: medication.tradeName, root: 'medlistComponent', keys: Object.keys(state.medlistComponent)}); 
                        medication.imageLocation !== state.medlistComponent.imageLocationField ? deletePreviousImage(medication.imageLocation) : null; 
                    }} 
                />
            </View>
        );
    } else {
        return (
            <View>
                <Text style={styles.innerText}>Chemical name: {medication.chemicalName}</Text>
                <Text style={styles.innerText}>Strength: {Math.round(medication.strength*1000)/1000+medication.unit}</Text>
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

const noDrugMatch = (state, updateState) => {
    if (state.render.noDrugMatch){
        return (
            <View>
                <Text>Emma doesn't recognize the drug you entered. Please select from the list below. If you don't see a match, try entering only a partial search term.</Text>
                <BarButton title='No. Save what I entered.' onPress={()=>{ updateState('by path and value', {path: 'render.noDrugMatch', value: false}); updateState('save', {what: 'medlist', whose: state.profileComponent.currentProfile, root: 'medlistComponent', keys: ['tradeNameField']}); }} />
                {state.tradeNameList.map((item)=>{
                    return (
                        <TextButton 
                            key={item} 
                            title={item} 
                            onPress={()=>{  
                                updateState('by path and value', {path: 'medlistComponent.tradeNameField', value: item});
                                updateState('by path and value', {path: 'render.noDrugMatch', value: false});
                            }} 
                        />
                    );
                })}
            </View>
        );
    }
}

const getList = (data) => {
    let tradeNameList = [];
    data.list.forEach((item)=>{
        tradeNameList = [...tradeNameList, ...item[data.key]]; //tradeNameList.concat(item[data.key]); //the concat method was adding the arrays into the tradeNameList array rather than each item
    });
    return tradeNameList;
} 

const findMatch = (data) => {
    let matches = false; 
    data.list.forEach((item)=>{
        if (data.item == item) { matches = true; }
    });
    return matches;
}

const generateSuggestedList = (data) => {
  let regx = new RegExp(data.input, 'ig'); //For literal match of partial search term
  let index = data.input.indexOf('-');
  let inputIgnoreTag = data.input.slice(index + 1);
  let regx2 = new RegExp(inputIgnoreTag, 'ig'); //For ignore tag and match partial search term
  let letters = inputIgnoreTag.toLowerCase().split(""); //For fuzzy matching (ignoring tag) of full search term
  let matches = [];
  data.list.forEach((item)=>{
      if ( regx.test(item) ) { matches.push(item); } 
      else if (regx2.test(item) && inputIgnoreTag) { matches.push(item); } //Must check if inputIgnoreTag is truthy or else will match all list items
      else {  
          let fuzzyMatchCount = 0;
          let index = item.indexOf('-');
          let itemNoTag = item.toLowerCase().slice(index + 1); 
          letters.forEach((letter, i)=>{
              if (itemNoTag.charAt(i-1) == letter || itemNoTag.charAt(i) == letter || itemNoTag.charAt(i+1) == letter){ 
                  fuzzyMatchCount++; 
              } 
          });
          if (fuzzyMatchCount/letters.length > 0.7){ matches.push(item); } //Can adjust this to make match more strictly or loosely
      }      
  });
  return matches;
}

const checkMedicationBeforeSave = (data) => {
    let tradeNameList = getList({list: data.list, key: 'tradeNames'});
    let matchFound = findMatch( {item: data.input, list: tradeNameList} );
    if (matchFound) {
        data.updateState('save', {what: 'medlist', whose: data.state.profileComponent.currentProfile, root: 'medlistComponent', keys: ['tradeNameField']});
    } else {
        if (!data.input) { data.updateState('by path and value', {path: 'message', value: 'Input cannot be empty.'}); } 
        else {
          data.updateState('by path and value', {path: 'render.noDrugMatch', value: true});
          data.updateState('by path and value', {path: 'tradeNameList', value: generateSuggestedList({input: data.input, list: tradeNameList}) }); 
        }
    }
}


