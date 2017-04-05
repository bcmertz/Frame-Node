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
  NavigatorIOS,
  TextInput,
  AsyncStorage,
  Image,
  TouchableOpacity,
  View
} from 'react-native';


class Camera extends Component {
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
            <Text style={styles.buttonLabel}>Take a Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={this.chooseImage}>
            <Text style={styles.buttonLabel}>Select from Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}


class Beyond extends Component {
  render(){
    return(
      <NavigatorIOS
        initialRoute = {{
          component: Login,
          title: 'Login'
        }}
        navigationBarHidden={true}
        style = {{flex: 1}}
        />
    )
  }
}

// class Home extends Component {
//   render() {
//     return (
//       <View style={styles.container}>
//       <Text style={styles.textBig}>Beyond</Text>
//       <TouchableOpacity style={[styles.button, styles.buttonBlack]} onPress = {this.Login}>
//       <Text style={styles.buttonLabel}>Tap to Login</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={[styles.button, styles.buttonBlue]}>
//       <Text style={styles.buttonLabel}>Tap to Register</Text>
//       </TouchableOpacity>
//       </View>
//     );
//   }
// }

class Login extends Component {
  constructor() {
    super()
    this.state={
      email: '',
      password: '',
      message: ' '
    };
    this.handleLoginRequest= this.handleLoginRequest.bind(this);
    this.navigateToRegistration = this.navigateToRegistration.bind(this);
  }
  componentDidMount(){
    AsyncStorage.getItem('user')
    .then(result => {
      var parsedResult = JSON.parse(result);
      var email = parsedResult.email;
      var password = parsedResult.password;
      if (email && password) {
        fetch('https://hohoho-backend.herokuapp.com/login', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        })
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.success) {
            this.props.navigator.push({
              component: Camera,
              title: "Camera"
            })
          } else {
            this.setState({
              message: responseJson.error
            })
          }
        })
      }
    })
    .catch(err => { console.log(err)})
  }
  handleLoginRequest(evt) {
    evt.preventDefault();
    fetch('https://hohoho-backend.herokuapp.com/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.success) {
        AsyncStorage.setItem('user', JSON.stringify({
          email: this.state.email,
          password: this.state.password
        }));
      } else {
        this.setState({
          message: responseJson.error
        })
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }
  navigateToRegistration(evt){
    evt.preventDefault();
    this.props.navigator.push({
      component: Registration,
      title: 'Registration'
    })
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: .25, justifyContent: 'flex-end'}}>
          <Text style={styles.textBig}>Beyond</Text>
        </View>
        <View style={{flex: .5, justifyContent: 'center', alignItems: 'center'}}>
          <TextInput
            style={styles.loginTextInput}
            placeholder="Email"
            onChangeText={(text) => this.setState({email: text})}
          />
          <TextInput
            style={styles.loginTextInput}
            secureTextEntry={true}
            placeholder="Password"
            onChangeText={(text) => this.setState({password: text})}
          />
          <TouchableOpacity style={[styles.button, styles.buttonBlack]} onPress = {this.handleLoginRequest}>
            <Text style={styles.buttonLabel}>Tap to Login</Text>
            </TouchableOpacity>
      </View>
      <View style={{flex: .25, paddingBottom: 30, justifyContent: 'flex-end'}}>
        <TouchableOpacity onPress = {this.navigateToRegistration}>
          <Text style={{textDecorationLine: "underline"}}>Sign Up for Beyond</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  }
}


class Registration extends Component{
  constructor(){
    super();
    this.state={
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      errorMessage: ''
    };
    this.handleRegistrationRequest = this.handleRegistrationRequest.bind(this);
    this.navigateToLogin = this.navigateToLogin.bind(this);
  }
  handleRegistrationRequest(evt) {
    evt.preventDefault();
    if(this.state.frstName.length === 0 || this.state.lastName.length === 0 || this.state.email.length === 0 || this.state.password.length === 0){
      this.setState({
        errorMessage: 'One or more fields has not been completed'
      })
    } else{
      fetch('https://hohoho-backend.herokuapp.com/register', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          email: this.state.email,
          password: this.state.password,
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.success) {
          this.props.navigator.pop();
        } else {
          console.log(responseJson);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }
  navigateToLogin(evt){
    evt.preventDefault();
    this.props.navigator.push({
      component: Login,
      title: 'Login'
    })
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: .25, justifyContent: 'flex-end'}}>
          <Text style={styles.textBig}>Registration</Text>
        </View>
        <View style={{flex: .5, justifyContent: 'center', alignItems: 'center'}}>
        <TextInput
          style={styles.loginTextInput}
          secureTextEntry={true}
          placeholder="First Name"
          onChangeText={(text) => this.setState({firstName: text})}
        />
        <TextInput
          style={styles.loginTextInput}
          secureTextEntry={true}
          placeholder="Last Name"
          onChangeText={(text) => this.setState({lastName: text})}
        />
          <TextInput
            style={styles.loginTextInput}
            placeholder="Email"
            onChangeText={(text) => this.setState({email: text})}
          />
          <TextInput
            style={styles.loginTextInput}
            secureTextEntry={true}
            placeholder="Password"
            onChangeText={(text) => this.setState({password: text})}
          />
          <TouchableOpacity style={[styles.button, styles.buttonBlack]} onPress = {this.handleLoginRequest}>
            <Text style={styles.buttonLabel}>Create Account</Text>
            </TouchableOpacity>
      </View>
      <View style={{flex: .25, paddingBottom: 30, justifyContent: 'flex-end'}}>
        <TouchableOpacity onPress = {this.navigateToLogin}>
          <Text style={{textDecorationLine: "underline"}}>Already Have an Account? Login</Text>
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
    borderRadius: 5
  },
  buttonBlue: {
    backgroundColor: '#0074D9',
  },
  buttonBlack: {
    backgroundColor: '#555555'
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  },
  textBig: {
    fontSize: 36,
    textAlign: 'center',
    margin: 10
  },
  loginTextInput: {
    height: 40,
    width: 250,
    paddingLeft: 8,
    borderWidth: 1,
    marginBottom: 15
  }
});

AppRegistry.registerComponent('Beyond', () => Beyond);
