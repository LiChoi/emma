import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput, Button } from 'react-native';
import { RNCamera } from 'react-native-camera';

const Realm = require('realm');

/*
const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu',
});

const Realm = require('realm');

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
      db: "saved",
      profile: 'John',
      saved: "nada",
      photo: ""
    };
  }

  UNSAFE_componentWillMount() {
    Realm.open({
      schema: [{name: 'Dog', properties: {name: 'string'}}]
    }).then(realm => {
      realm.write(() => {
        realm.create('Dog', {name: 'Rex'});
      });
      this.setState({ realm });
    });
  }

  render() {
    const info = this.state.realm
    ? 'Number of dogs in this Realm: ' + this.state.realm.objects('Dog').length
    : 'Loading...';
    const rex = this.state.realm ? this.state.realm.objects('Dog')[0].name : 'Loading...';

    return (
      <ScrollView style={styles.scroller}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
        <TextInput
          style={{height: 40}}
          placeholder="Enter name here"
          onChangeText={(text) => this.setState({profile: text})}
        />
        <Text>{this.state.profile}</Text>
        <Text>{this.state.saved}</Text>
        <Text>{rex}</Text>
        <Button title="save"/>
        <Button title="retrieve"/>
        <Text>{info}</Text>
        <View style={styles.camera}>
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
        </View>
        <Image style={styles.image} source={{uri: this.state.photo}} />
      </ScrollView>
    );
  }

  takePicture = async function(camera) {
    const options = { quality: 0.5, base64: true };
    const data = await camera.takePictureAsync(options);
    //  eslint-disable-next-line
    console.log(data.uri);
    this.setState({photo: data.uri});
  };

}

const styles = StyleSheet.create({
  scroller: {
    flex: 1,
    flexDirection: 'column',
    height: 1000
  },
  camera: {
    height: 500,
    justifyContent: "center"
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    flex: 2,
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    flex: 2,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
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
*/

const userSchema = {
  name: 'User',
  primaryKey: 'name', 
  properties: {
    name: 'string',
    birthday: 'date?',
    allergies: 'Allergy[]',
    conditions: 'Condition[]',
    medlist: 'string?[]'
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realm: null,
      message: null,
      render: {home: true, createProfileComponent: false, profileComponent: false, editAllergyDetails: false, editConditionDetails: false}, 
      home: {},
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
  }

  componentDidMount() {
    Realm.open({
      schema: [userSchema, conditionSchema, allergySchema]
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
      case 'update new profile name field':
        this.setState(prevState => {
          let createProfileComponent = JSON.parse(JSON.stringify(prevState.createProfileComponent));
          createProfileComponent.name = data;                                
          return { createProfileComponent };                                
        });
        break;
      case 'update birthday field':
        this.setState(prevState => {
          let createProfileComponent = JSON.parse(JSON.stringify(prevState.createProfileComponent));
          createProfileComponent.birthday = data;                                
          return { createProfileComponent };                                
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
      case 'update allergy field':
        this.setState(prevState => {
          let profileComponent = JSON.parse(JSON.stringify(prevState.profileComponent));
          profileComponent.allergyField = data;                                
          return { profileComponent };                                
        });
        break;  
      case 'add allergy':
        let spacesOnly = /\s/.test(data.profileComponent.allergyField);
        if (data.profileComponent.allergyField && !spacesOnly){
          await this.updateRealm('add allergy', this.state); //This must be done before allergyField is cleared
          this.setState(prevState => {
            let profileComponent = JSON.parse(JSON.stringify(prevState.profileComponent));
            profileComponent.allergyField = null;                      
            return { profileComponent: profileComponent, message: null };                                
          });
        } else {
          this.setState({message: "Cannot be empty and no spaces allowed"});
        }
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
      case 'update allergyDetailsField':
        this.setState(prevState => {
          let profileComponent = JSON.parse(JSON.stringify(prevState.profileComponent));
          profileComponent.allergyDetailsField = data;                                
          return { profileComponent };                                
        });
        break;
      case 'save allergy details':
        let textExists3= /\S/.test(this.state.profileComponent.allergyDetailsField);
        if (textExists3){
          await this.updateRealm('save allergy details', this.state, data); 
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
          render.profileComponent = true;
          render.home = false;
          return { profileComponent: profileComponent, render: render };                                
        });
        break; 
      case 'update conditionField':
        this.setState(prevState => {
          let profileComponent = JSON.parse(JSON.stringify(prevState.profileComponent));
          profileComponent.conditionField = data;                                
          return { profileComponent };                                
        });
        break;
      case 'update conditionDetailsField':
        this.setState(prevState => {
          let profileComponent = JSON.parse(JSON.stringify(prevState.profileComponent));
          profileComponent.conditionDetailsField = data;                                
          return { profileComponent };                                
        });
        break;
      case 'add condition':
        let textExists = /\S/.test(data.profileComponent.conditionField);
        if (textExists){
          await this.updateRealm('add condition', this.state); 
          this.setState(prevState => {
            let profileComponent = JSON.parse(JSON.stringify(prevState.profileComponent));
            profileComponent.conditionField = null;                                
            return { profileComponent };                                
          });
        } else {
          this.setState({message: "Cannot be empty"});
        }
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
          await this.updateRealm('save condition details', this.state, data); 
          this.setState(prevState => {
            let render = JSON.parse(JSON.stringify(prevState.render));
            render.editConditionDetails = false;                  
            return { render };                                
          });
        } else {
          this.setState({message: "Cannot be empty"});
        }
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

  updateRealm(instruction, state, data){
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
      schema: [ userSchema, conditionSchema, allergySchema ]
    }).then(realm => {
      realm.write(() => {
        switch(instruction){
          case 'save new profile':
            let validDate = validateDate(state.createProfileComponent.birthday);
            let birthday = validDate ? new Date(state.createProfileComponent.birthday + "T10:59:30Z") : null;
            let name = state.createProfileComponent.name? state.createProfileComponent.name : null;
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
          case 'add allergy':
            let allergyList = this.state.realm.objects('User').filtered(`name='${this.state.profileComponent.currentProfile}'`)[0].allergies;
            allergyList.push({name: this.state.profileComponent.allergyField});
            realm.create('User', {name: this.state.profileComponent.currentProfile, allergies: allergyList}, true);
            break;
          case 'add condition':
            let conditionList = this.state.realm.objects('User').filtered(`name='${this.state.profileComponent.currentProfile}'`)[0].conditions;
            conditionList.push({name: this.state.profileComponent.conditionField});
            realm.create('User', {name: this.state.profileComponent.currentProfile, conditions: conditionList}, true);
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
            onChangeText={(text) => {this.updateState('update new profile name field', text);}}
            value={this.state.createProfileComponent.name} 
          />
          <TextInput
            placeholder="Birthday YYYY-MM-DD"
            onChangeText={(text) => {this.updateState('update birthday field', text);}}
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
    if (this.state.render.profileComponent){
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
            onChangeText={(text) => {this.updateState('update allergy field', text);}}
            value={this.state.profileComponent.allergyField} 
          />
          <Button title='Add allergy' onPress={()=>{this.updateState('add allergy', this.state)}} />
          <Text>Medical Conditions:</Text>
          {this.renderConditionList()}
          <TextInput 
            placeholder='Enter a new condition'
            onChangeText={(text) => {this.updateState('update conditionField', text);}}
            value={this.state.profileComponent.conditionField} 
          />
          <Button title='Add condition' onPress={()=>{this.updateState('add condition', this.state)}} />
          <Text>Medications:</Text>
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
              <View>
                <Text key={allergy.name + i}>Allergy: {allergy.name}</Text>
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
            onChangeText={(text) => {this.updateState('update allergyDetailsField', text);}}
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
              <View>
                <Text key={condition.name + i}>Condition: {condition.name}</Text>
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
            onChangeText={(text) => {this.updateState('update conditionDetailsField', text);}}
            value={this.state.profileComponent.conditionDetailsField} 
          />
          <Button title='Save Details' onPress={()=>{this.updateState('save condition details', condition.name)}} />
        </View>
      );
    }
  }
  //End of profile component and its subcomponenets

  render() {
    return (
      <ScrollView style={styles.appContainer}>
        {this.renderHome()}
        {this.createProfile()}
        {this.renderProfile()}
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
  }
});

export default App;
