export const darkMedicalGreen = 'rgba(0, 155, 110, 1)';
export const fadedDarkMedicalGreen = 'rgba(0, 155, 110, 0.8)';
export const lightMedicalGreen = 'rgba(235, 255, 235, 1)';
export const styles = {
  scrollContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: lightMedicalGreen,
  },
  appContainer: {
    flex: 1,
    backgroundColor: lightMedicalGreen,
  },
  home: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 50,
  },
  createProfile: {
    flex: 1,
    justifyContent: 'center'
  },
  name: {
    fontSize: 30, 
    color: darkMedicalGreen, 
    fontWeight: 'bold', 
    textAlign: 'center'
  },
  cameraContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: lightMedicalGreen,
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
    opacity: 0.5
  },
  image: {
    flex: 1,
    height: 150,
    width: 150,
    marginTop: 5
  },
  messageScreenCover: {
    position: 'absolute',
    height: '110%', 
    width: '110%', 
    zIndex: 10, 
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignSelf: 'center',
    justifyContent: 'space-around',
    padding: 15,
  },
  messageContainer: {
    backgroundColor: lightMedicalGreen,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'red',
  },
  messageText: {
    color: 'red',
    fontSize: 18,
    paddingHorizontal: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: darkMedicalGreen,
    padding: 6,
    marginBottom: 5
  },
  innerText: {
    paddingHorizontal: 5,
  },
  textInput: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: darkMedicalGreen,
    backgroundColor: 'white'
  },
  border: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: darkMedicalGreen,
    marginBottom: 5
  },
  barButtonStyle: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    backgroundColor: darkMedicalGreen, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white'
  },
  buttonTextStyle: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold'
  },
  textButtonStyle: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
  },
  textButtonTextStyle: {
    textAlign: 'center',
    color: darkMedicalGreen,
    fontWeight: 'bold'
  },
  welcomeScreen: {
    flex: 1,
    paddingLeft: 50,
    justifyContent: 'center'
  },
  welcomeText: {
    fontSize: 20, 
    color: darkMedicalGreen, 
    fontWeight: 'bold', 
    textAlign: 'left'
  }
}

