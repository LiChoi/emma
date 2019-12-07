import React from 'react';
import { Text, TextInput, View, ScrollView } from 'react-native';
import {BarButton, TextButton, NoMatchFound} from './Common';
import {styles} from './Styles';
import {handleEmail, composeEmail} from './Emailer';
import {PrepareReport, CalculateAge, ReturnMatchedAgeRange} from './Analysis';
import {identifyInputBeforeSave} from './GenerateSuggestions';

export const renderProfile = (state, updateState) => {
    if (state.screen == 'profile'){
        return (
            <View>
                <Text style={styles.name}>{state.profileComponent.currentProfile}</Text>
                <Text style={{textAlign: 'center'}}>{state.realm.objects('User').map((user, i)=>{if(user.name == state.profileComponent.currentProfile){return user.birthday.toDateString().slice(4);}})}</Text>
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
                  updateState('by path and value', {path: 'emmaAsksComponent', value: PrepareReport( state.realm.objects('User').filtered(`name='${state.profileComponent.currentProfile}'`)[0], state.realm.objects('Compendium'), state.realm.objects('Medical Terms') ) }); 
                  updateState('by path and value', {path: 'screen', value: 'emmaAsks'}); 
                }} />
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
            <TextButton title="Add+" onPress={()=>{ identifyInputBeforeSave({
                  state: state, 
                  updateState: updateState, 
                  list: state.realm.objects('Compendium'), 
                  searchKeys: ['tradeNames', 'class'],
                  ifMatchSaveToRealm: 'allergies',
                  saveRoot: 'profileComponent',
                  atKey: 'allergyField' 
            }); }}/> 
            <NoMatchFound type='allergies' saveRoot='profileComponent' atKey='allergyField' state={state} updateState={updateState} />
        </View>
      );
    }
}
  
const renderAddCondition = (state, updateState) => {
    if (!state.render.editConditionDetails){
        return (
            <View style={{alignItems: 'center'}}>
                <ScrollView style={{}} horizontal={true}>
                  {
                    generateHints(state).map((hint, i)=>{ 
                      return ( <Text style={{color: 'grey', padding: 10}} key={`hint ${i}`}>{'\n' + hint + '\n'}</Text> ); 
                    })
                  }
                </ScrollView>
                <TextInput 
                    style={styles.textInput}
                    placeholder='Enter new condition'
                    onChangeText={(text)=>{updateState('by path and value', {path: 'profileComponent.conditionField', value: text })}}
                    value={state.profileComponent.conditionField} 
                />
                <TextButton title="Add+" onPress={()=>{ identifyInputBeforeSave({
                  state: state, 
                  updateState: updateState, 
                  list: state.realm.objects('Medical Terms'), 
                  searchKeys: ['relatedTerms'],
                  ifMatchSaveToRealm: 'conditions',
                  saveRoot: 'profileComponent',
                  atKey: 'conditionField' 
                }); }}/>    
                <NoMatchFound type='conditions' saveRoot='profileComponent' atKey='conditionField' state={state} updateState={updateState} />
            </View>
        );
    }
}
  
const deleteProfile = (state, updateState) => {
    if (!state.render.deleteProfile){
      return (
        <TextButton title="Delete profile" onPress={()=>{updateState('by path and value', {path: 'render.deleteProfile', value: true})}} />
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

const generateHints = (state) => {
  let patient = state.profileComponent.currentProfile;
  let conditionsObject = {};
  state.realm.objects('User').filtered(`name='${patient}'`)[0].conditions.forEach((condition)=>{
    conditionsObject[condition.name] = condition.details;
  });
  let hints = [
    {hint: `Hint: Add "Sex" as a condition, then input "Male" or "Female" in the details.`, context: 'no sex added', suggest: 'Sex'},
    {hint: `Hint: Add 'Weight' as a condition, then in the details input your weight in the format #kg or #lbs (no spaces).`, context: 'all', suggest: 'Weight'},
    {hint: `Hint: If you are pregnant, you can enter that as a condition.`, context: 'female of child-bearing age', suggest: 'Pregnant'},
    {hint: `Hint: If you are breastfeeding, you can enter that as a condition`, context: 'female of child-bearing age', suggest: 'Breastfeeding'},
    {hint: `Hint: If you smoke, you can enter 'Smoking' as a condition.`, context: 'all', suggest: 'Smoking'},
    {hint: `Hint: If you drink a lot of alcohol, you can enter 'High alcohol intake' as a condition.`, context: 'all', suggest: 'High alcohol intake'},
    {hint: `Hint: If you have poor kidney function, add 'crcl' (short for creatinine clearance) as a condition. In the details, input your crcl in ml/min (just the number - no units).`, context: 'all', suggest: 'crcl'}
  ];
  let relevantHints = [];
  hints.forEach((hint)=>{
    switch(hint.context){
      case 'all':
        if (!conditionsObject.hasOwnProperty(hint.suggest)) {relevantHints.push(hint.hint);}
      break;
      case 'no sex added':
        if (!conditionsObject.hasOwnProperty('Sex')) { relevantHints.push(hint.hint); }
      break;
      case 'female of child-bearing age':
        let age = CalculateAge(state.realm.objects('User').filtered(`name='${patient}'`)[0].birthday);
        let ageInRange = ReturnMatchedAgeRange('15<=age && age<=45', age);
        if (conditionsObject.Sex == 'Female' && ageInRange && !conditionsObject.hasOwnProperty(hint.suggest)) { relevantHints.push(hint.hint); }
      break;
    }
  });
  return relevantHints; 
}
