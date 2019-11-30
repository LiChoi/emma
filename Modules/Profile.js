import React from 'react';
import { Text, TextInput, View } from 'react-native';
import {BarButton, TextButton} from './Common';
import {styles} from './Styles';
import {handleEmail, composeEmail} from './Emailer';
import {PrepareReport} from './Analysis';
import {getList, findMatch, generateSuggestedList} from './GenerateSuggestions';

export const renderProfile = (state, updateState) => {
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
                <BarButton title="Emma Asks" onPress={()=>{ 
                  updateState('by path and value', {path: 'emmaAsksComponent', value: PrepareReport(state.realm.objects('User').filtered(`name='${state.profileComponent.currentProfile}'`)[0], state.realm.objects('Compendium')) }); 
                  updateState('by path and value', {path: 'screen', value: 'emmaAsks'}); 
                }} />
                <BarButton title="Email Profile" onPress={()=>{handleEmail(
                    {
                        subject: "Medical Profile", //String
                        recipients: [], //array of strings
                        ccRecipients: [], //array of strings
                        bccRecipients: [], //array of strings
                        body: composeEmail(state), //string
                        isHTML: false, //boolean
                        attachment: {
                            //path: "",  // The absolute path of the file from which to read data.
                            //type: "",   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
                            //name: "",   // Optional: Custom filename for attachment
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
            <TextButton title='Add+' onPress={()=>{ identifyAllergyBeforeSave({state: state, updateState: updateState, input: state.profileComponent.allergyField, list: state.realm.objects('Compendium')}); }} />
            {noAllergyMatch(state, updateState)}
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

const noAllergyMatch = (state, updateState) => {
  if (state.render.noAllergyMatch){
    return (
        <View>
            <Text>Emma doesn't recognize the allergy you entered. Please select from the list below. If you don't see a match, or if it's not a drug allergy, then go ahead and save what you entered.</Text>
            <BarButton title='Save what I entered.' onPress={()=>{ updateState('by path and value', {path: 'render.noAllergyMatch', value: false}); updateState('save', {what: 'allergies', whose: state.profileComponent.currentProfile, root: 'profileComponent', keys: ['allergyField']}); }} />
            {state.tradeNameList.map((item)=>{
                return (
                    <TextButton 
                        key={item} 
                        title={item} 
                        onPress={()=>{  
                            updateState('by path and value', {path: 'profileComponent.allergyField', value: item});
                            updateState('by path and value', {path: 'render.noAllergyMatch', value: false});
                        }} 
                    />
                );
            })}
        </View>
    );
  }
}

const identifyAllergyBeforeSave = (data) => {
  //Requires data.list (compendium), data.input (allergy), data.updateState, data.state
  let tradeNameList = getList({list: data.list, keys: ['tradeNames', 'class']});
  let matchFound = findMatch( {item: data.input, list: tradeNameList} );
  if (matchFound) {
      data.updateState('save', {what: 'allergies', whose: data.state.profileComponent.currentProfile, root: 'profileComponent', keys: ['allergyField']});
  } else {
      if (!data.input) { data.updateState('by path and value', {path: 'message', value: 'Input cannot be empty.'}); } 
      else {
        data.updateState('by path and value', {path: 'render.noAllergyMatch', value: true});
        data.updateState('by path and value', {path: 'tradeNameList', value: generateSuggestedList({input: data.input, list: tradeNameList}) }); 
      }
  }
}