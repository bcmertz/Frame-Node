var ImagePicker = require('react-native-image-picker')

var xhr = new XMLHttpRequest();

var options = {
  title: 'Take Photo',
  customButtons: [
    {name: 'fb', title: 'Choose Photo from Facebook'},
  ],
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};


import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  View
} from 'react-native';

export default class Beyond extends Component {
  constructor(){
    super();
    this.state = {
      image: ''
    }
    this.takePhoto = this.takePhoto.bind(this)
    this.setImage = this.setImage.bind(this)
    this.chooseImage = this.chooseImage.bind(this)
  }
  takePhoto(evt){

    evt.preventDefault();
    console.log('inside takePhoto')

    ImagePicker.launchCamera({noData: true}, this.setImage);
  }
  chooseImage(evt){

    evt.preventDefault();
    console.log('inside Choose Image')

    ImagePicker.launchImageLibrary({noData: true}, this.setImage);
  }

  setImage(response){
    console.log('Response = ', response);

    if (response.didCancel) {
      console.log('User cancelled image picker');
    }
    else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    }
    else if (response.customButton) {
      console.log('User tapped custom button: ', response.customButton);
    }
    else {
      let source = { uri: response.uri.replace('file://', ''), isStatic: true };
      var photo = {
        uri: response.uri,
        type:'image/jpeg',
        name: 'photo.jpg'
      };
      var body = new FormData();
      body.append('photo', photo);
      body.append('title', 'The Gateway!')

      xhr.open('POST', 'http://localhost:3000/upload')
      xhr.send(body);

      this.setState({
        image: '.'+ source.uri
      });
    }
  }
  render() {
    return (
      <View style={{flex:1}}>
      <Text style={styles.welcome}>Explore the World Beyond {this.state.image}</Text>
        <View style={{flex:1}}>
          {this.state.image?<Image style={{flex: 1}} source={this.state.image}></Image>:null}
        </View>
        <View style={styles.container}>
          <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={this.takePhoto}>
            <Text style={styles.buttonLabel}>Tap to Take a Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={this.chooseImage}>
            <Text style={styles.buttonLabel}>Tap to Choose an Already Existing Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 24,
    textAlign: 'center',
    margin: 20,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  button: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 20,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5
  },
  buttonBlue: {
    backgroundColor: '#0074D9',
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  }
});

AppRegistry.registerComponent('Beyond', () => Beyond);
