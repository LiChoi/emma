import React, { Component } from 'react';
import { Text, TextInput, Image, View } from 'react-native';
import {BarButton, TextButton, NoMatchFound} from './Common';
import {styles} from './Styles';
import {deletePreviousImage} from './Camera';
import { identifyInputBeforeSave } from './GenerateSuggestions';

export const renderMedlist = (state, updateState) => {
    if (state.screen == 'medlist'){
      return (
        <View>
          <Text style={styles.label}>Medication List</Text>
          {
            state.realm.objects('User').filtered(`name='${state.profileComponent.currentProfile}'`)[0].medlist.map((medication, i)=>{
              return (
                <View style={styles.border} key={medication.tradeName + i}>
                  <Medication state={state} updateState={updateState} medication={medication} index={i} />
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
      this.props.state.render[this.props.medication.tradeName.replace(/\./g, '') + this.props.index] ? this.props.updateState('by path and value', {path: `render.${this.props.medication.tradeName.replace(/\./g, '') +this.props.index}`, value: false}) : this.props.updateState('by path and value', {path: `render.${this.props.medication.tradeName.replace(/\./g, '') +this.props.index}`, value: true});
    }
  
    render() {
      return (
        <View>
          <BarButton title={this.props.medication.tradeName} onPress={ ()=>{ this.toggleExpand() }} />
          { this.props.state.render[this.props.medication.tradeName.replace(/\./g, '') +this.props.index] ? toggleEditMedication(this.props.state, this.props.updateState, this.props.medication) : null }
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
          <TextButton title="Add+" onPress={()=>{ identifyInputBeforeSave({
                  state: state, 
                  updateState: updateState, 
                  list: state.realm.objects('Compendium'), 
                  searchKeys: ['tradeNames'],
                  ifMatchSaveToRealm: 'medlist',
                  saveRoot: 'medlistComponent',
                  atKey: 'tradeNameField' 
          }); }}/>    
          <NoMatchFound type='medlist' saveRoot='medlistComponent' atKey='tradeNameField' state={state} updateState={updateState} />
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
                <Text style={styles.innerText}>Strength: {medication.strength}</Text>
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
