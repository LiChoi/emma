To run the app on android, connect your android phone to computer via usb and turn on developer mode and enable usb debugging. 
In terminal, run: adb devices 
When prompted on phone, say yes 
Then, in the terminal, while inside Emma folder, run this command:  react-native run-android

When installing react-native-fs dependency, followed instructions on https://www.npmjs.com/package/react-native-fs/v/1.2.0
However, do not do the last step of adding anything to MainApplication.java. The auto-linking makes this step unnecessary.