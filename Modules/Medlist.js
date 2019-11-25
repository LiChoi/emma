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
          {noDrugMatch(state, updateState)}
          {/*<TextButton title='Add+' onPress={()=>{updateState('save', {what: 'medlist', whose: state.profileComponent.currentProfile, root: 'medlistComponent', keys: ['tradeNameField']}); }} />*/}
          <TextButton title='Add+' onPress={()=>{ checkMedicationBeforeSave({state: state, updateState: updateState, input: state.medlistComponent.tradeNameField, list: state.realm.objects('Compendium')}); }} />
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
    console.log(`state trade name list: ${state.tradeNameList}`);
    console.log(`trade name list item type: ${state.tradeNameList ? typeof state.tradeNameList[0] : 'nada'}`);
    if (state.render.noDrugMatch){
        return (
            <View>
                <Text>Emma doesn't recognize the drug you entered. Please select from the list below:</Text>
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
    console.log(`Compendium list: ${data.list}`);
    let tradeNameList = [];
    data.list.forEach((item)=>{
        console.log(`item[data.key].length: ${item[data.key].length}`);
        tradeNameList = [...tradeNameList, ...item[data.key]]; //tradeNameList.concat(item[data.key]); //the concat method was adding the arrays into the tradeNameList array rather than each item
    });
    console.log('items in tradeNameList array: ' + tradeNameList.length);
    return tradeNameList;
} 

const findMatch = (data) => {
    let matches = false; 
    data.list.forEach((item)=>{
        console.log(`find match. comparing ${data.item} to ${item}`);
        if (data.item == item) { matches = true; }
    });
    return matches;
}

const checkMedicationBeforeSave = (data) => {
    let tradeNameList = getList({list: data.list, key: 'tradeNames'});
    console.log(`tradeNameList: ${tradeNameList}`);
    let matchFound = findMatch( {item: data.input, list: tradeNameList} );
    console.log(`match found: ${matchFound}`);
    if (matchFound) {
        console.log("Drug recognized, saving...");
        data.updateState('save', {what: 'medlist', whose: data.state.profileComponent.currentProfile, root: 'medlistComponent', keys: ['tradeNameField']});
    } else {
        console.log(`Drug not recognized...`);
        data.updateState('by path and value', {path: 'render.noDrugMatch', value: true});
        data.updateState('by path and value', {path: 'tradeNameList', value: tradeNameList});
    }
}


