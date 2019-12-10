To install the app on android for debugging, connect your android phone to computer via usb and turn on developer mode and enable usb debugging. 
In terminal, run: adb devices 
When prompted on phone to allow debugging, say yes 
Then, in the terminal, while inside Emma folder, run this command:  react-native run-android

To install the release version of app on android, first generate a keystore (only needs to be done once). Then you must create the bundle.
To create bundle, change directory to android folder: cd android 
Then run: ./gradlew bundleRelease
The generated AAB can be found under android/app/build/outputs/bundle/release/app.aab, and is ready to be uploaded to Google Play.
For more details, see https://facebook.github.io/react-native/docs/signed-apk-android 
Delete any current versions of the app on your phone. 
Finally, to install onto your phone, run: react-native run-android --variant=release
If you want to switch back to debugging, delete the installed release version from phone, then run the usual react-native run-android

Note: Android/gradle.properties has been put into gitignore as this file now contains the store keys and passwords.



Notes for setting up the dev environment:

When installing react-native-fs dependency, followed instructions on https://www.npmjs.com/package/react-native-fs/v/1.2.0
However, do not do the last step of adding anything to MainApplication.java. The auto-linking makes this step unnecessary.

When installing react-native-email, simly did npm install... when try to link in terminal caused error, undid link and it works. So... just do npm install and it's good to go