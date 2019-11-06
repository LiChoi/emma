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
  properties: {
    name: 'string',
    birthday: 'date?',
    allergies: 'string?[]',
    conditions: 'string?[]',
    medlist: 'string?[]'
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realm: null,
      message: null,
      home: {
        render: true
      },
      createProfileComponent: {
        render: false,
        name: null,
        birthday: null,
        allergies: null,
        conditions: null,
        medlist: null,
        allergyListComponent: {
          render: false,
          list: [] 
        } 
      },
      profile: {
        render: true,
        subComponent: {
          render: false
        }
      }
    };
    this.renderHome = this.renderHome.bind(this);
    this.loadProfiles = this.loadProfiles.bind(this);
    this.createProfile = this.createProfile.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateRealm = this.updateRealm.bind(this);
    this.renderAllergyList = this.renderAllergyList.bind(this);
  }

  componentDidMount() {
    Realm.open({
      schema: [userSchema]
    }).then(realm => {
      this.setState({ realm });
    });
  }

  //State and Realm management functions 
  updateState(instruction, data) {
    switch(instruction) {
      case 'render createProfile':
        this.setState(prevState => {
          let createProfileComponent = JSON.parse(JSON.stringify(prevState.createProfileComponent));
          let home = JSON.parse(JSON.stringify(prevState.home));
          createProfileComponent.render = true; 
          home.render = false;                               
          return { createProfileComponent: createProfileComponent, home: home };                                
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
          let home = JSON.parse(JSON.stringify(prevState.home));
          createProfileComponent.name = null;
          createProfileComponent.birthday = null; 
          createProfileComponent.render = false;            
          home.render = true;            
          return { createProfileComponent: createProfileComponent, home: home, message: null };                                
        });
        break;
      case 'update allergy field':
        this.setState(prevState => {
          let createProfileComponent = JSON.parse(JSON.stringify(prevState.createProfileComponent));
          createProfileComponent.allergies = data;                                
          return { createProfileComponent };                                
        });
        break;  
      case 'add allergy':
        let spacesOnly = /\s/.test(data.createProfileComponent.allergies);
        if (data.createProfileComponent.allergies && !spacesOnly){
          this.setState(prevState => {
            let createProfileComponent = JSON.parse(JSON.stringify(prevState.createProfileComponent));
            createProfileComponent.allergyListComponent.render = true;
            createProfileComponent.allergyListComponent.list.push(prevState.createProfileComponent.allergies);
            createProfileComponent.allergies = null;                      
            return { createProfileComponent: createProfileComponent, message: null };                                
          });
        } else {
          this.setState({message: "Cannot be empty and no spaces allowed"});
        }
        break;
    }
  }

  updateRealm(instruction, state){
    function validateDate(dateStr){
      //YYYY-MM-DD
      if (!dateStr || dateStr.length !== 10){
        return false;
      }
      let year = /\d{4}/.test(dateStr.substring(0,4)) ? parseInt(dateStr.substring(0,4), 10) : "not a number";
      let dash1 = dateStr.charAt(4);
      let month = /\d{2}/.test(dateStr.substring(5,7)) ? parseInt(dateStr.substring(5,7), 10) : "not a number";
      let dash2 = dateStr.charAt(7);
      let day = /\d{2}/.test(dateStr.substring(5,7)) ? parseInt(dateStr.substring(8), 10) : "not a number";
      if (dash1 !== "-" || dash2 !== "-" || year == "not a number" || month == "not a number" || day == "not a number" ){
        return false;
      }
      if (day > 31 || month > 12 || ([4, 6, 9, 11].indexOf(month) > -1 && day > 30)){
        return false;
      }
      if ((year%4 == 0 && month == 2 && day > 29) || (year%4 !== 0 && month == 2 && day > 28)){
        return false;
      }
      return true;
    }

    Realm.open({
      schema: [userSchema]
    }).then(realm => {
      realm.write(() => {
        switch(instruction){
          case 'save new profile':
            let validDate = validateDate(state.createProfileComponent.birthday);
            let birthday = validDate ? new Date(state.createProfileComponent.birthday + "T10:59:30Z") : null;
            let name = state.createProfileComponent.name? state.createProfileComponent.name : null;
            let allergies = state.createProfileComponent.allergyListComponent.list.length > 0 ? state.createProfileComponent.allergyListComponent.list : []; 
            if (!birthday || !name){
              let message = "The following fields have been entered incorrectly: ";
              message = !birthday ? message.concat("birthday (must be YYYY-MM-DD), ") : message;
              message = !name ? message.concat("name (must not be empty), ") : message;
              this.setState({message: message});
              break; 
            }
            realm.create('User', {
              name: name,
              birthday: birthday,
              allergies: allergies
            });
            this.updateState('profile saved', this.state);
            break;
        }
      });
      this.setState({ realm });
    });
  }
  //End of State and Realm management functions 

  //The Home component and all subcomponent functions
  renderHome(){
    if (this.state.home.render){
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
                  <Button key={"username "+i} title={user.name} />
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
    if (this.state.createProfileComponent.render){
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
          <TextInput 
            placeholder='Allergies'
            onChangeText={(text) => {this.updateState('update allergy field', text);}}
            value={this.state.createProfileComponent.allergies} 
          />
          <Button title='Add allergy' onPress={()=>{this.updateState('add allergy', this.state)}} />
          {this.renderAllergyList()}
          <Button title="Submit" onPress={()=>{this.updateRealm('save new profile', this.state)}} />
          <Text>{this.state.message}</Text>
        </View>
      );
    }
  }

  renderAllergyList() {
    if (this.state.createProfileComponent.allergyListComponent.render){
      return (
        <View>
          {
            this.state.createProfileComponent.allergyListComponent.list.map((allergy, i)=>{
              return (
                <Text key={allergy + i}>{allergy}</Text>
              );
            })
          }
        </View>
      );
    }
  }
  //End of createProfileComponent

  render() {
    return (
      <ScrollView style={styles.appContainer}>
        {this.renderHome()}
        {this.createProfile()}
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
