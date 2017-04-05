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
    this.takePhoto = this.takePhoto.bind(this);
    this.setImage = this.setImage.bind(this);
    this.chooseImage = this.chooseImage.bind(this);
    this.logout = this.logout.bind(this);
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
  logout(evt){
    var self = this;
    evt.preventDefault();
    AsyncStorage.removeItem('user', function(err){
      if(err){
        console.log(err);
      } else{
        console.log('Successfully removed user from AsyncStorage')
        self.props.navigator.pop();
      }
    })

  }
  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: .25, justifyContent: 'flex-end'}}>
          <Text style={styles.textBig}>Explore Beyond</Text>
        </View>
        <View style={{flex: .5, justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity style={[styles.button, styles.buttonBlack]} onPress = {this.takePhoto}>
            <Text style={styles.buttonLabel}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonBlack]} onPress = {this.chooseImage}>
              <Text style={styles.buttonLabel}>Select from Gallery</Text>
              </TouchableOpacity>
      </View>
      <View style={{flex: .25, paddingBottom: 30, justifyContent: 'flex-end'}}>
        <TouchableOpacity onPress = {this.logout}>
          <Text style={{textDecorationLine: "underline"}}>Log Out</Text>
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
      errorMessage: ' '
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
        fetch('https://stark-reef-72596.herokuapp.com/upload', {
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
    var self = this;
    evt.preventDefault();
    fetch('http://localhost:3000/login', {
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
        }), function(err){
          if(err){
            console.log(err);
          } else{
            this.setState({
              email: '',
              password: '',
              errorMessage: ''
            })

            self.props.navigator.push({
              component: Camera,
              title: "Camera"
            })
          }
        });
      } else {
        this.setState({
          errorMessage: responseJson.error
        })
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }
  navigateToRegistration(evt){
    evt.preventDefault();
    this.setState({
      email: '',
      password: '',
      errorMessage: ''
    })
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
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(text) => this.setState({email: text})}
          />
          <TextInput
            style={styles.loginTextInput}
            secureTextEntry={true}
            autoCorrect={false}
            placeholder="Password"
            onChangeText={(text) => this.setState({password: text})}
          />
          <TouchableOpacity style={[styles.button, styles.buttonBlack]} onPress = {this.handleLoginRequest}>
            <Text style={styles.buttonLabel}>Tap to Login</Text>
            </TouchableOpacity>
      </View>
      <View style={{flex: .1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>{this.state.errorMessage}</Text>
      </View>
      <View style={{flex: .15, paddingBottom: 30, justifyContent: 'flex-end'}}>
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
    var self = this;
    evt.preventDefault();
    if(this.state.firstName.length === 0 || this.state.lastName.length === 0 || this.state.email.length === 0 || this.state.password.length === 0){
      this.setState({
        errorMessage: 'One or more fields have not been completed'
      })
    } else{
      fetch('http://localhost:3000/register', {
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
          this.setState({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            errorMessage: ''
          })
          this.props.navigator.pop();
        } else {
          self.setState({
            errorMessage: responseJson.error
          })
        }
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }
  navigateToLogin(evt){
    evt.preventDefault();
    this.setState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      errorMessage: ''
    })
    this.props.navigator.pop();
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
          placeholder="First Name"
          autoCorrect={false}
          onChangeText={(text) => this.setState({firstName: text})}
        />
        <TextInput
          style={styles.loginTextInput}
          placeholder="Last Name"
          autoCorrect={false}
          onChangeText={(text) => this.setState({lastName: text})}
        />
          <TextInput
            style={styles.loginTextInput}
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(text) => this.setState({email: text})}
          />
          <TextInput
            style={styles.loginTextInput}
            secureTextEntry={true}
            placeholder="Password"
            autoCorrect={false}
            onChangeText={(text) => this.setState({password: text})}
          />
          <TouchableOpacity style={[styles.button, styles.buttonBlack]} onPress = {this.handleRegistrationRequest}>
            <Text style={styles.buttonLabel}>Create Account</Text>
            </TouchableOpacity>
      </View>
      <View style={{flex: .1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>{this.state.errorMessage}</Text>
      </View>
      <View style={{flex: .15, paddingBottom: 30, justifyContent: 'flex-end'}}>
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
    borderRadius: 5,
    minWidth: 250
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
