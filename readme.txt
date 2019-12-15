To install the app on android for debugging, connect your android phone to computer via usb and turn on developer mode and enable usb debugging. 
In terminal, run: adb devices 
When prompted on phone to allow debugging, say yes 
Then, in the terminal, while inside Emma folder, run this command:  react-native run-android

To install the release version of app on android, first generate a keystore (only needs to be done once). Then you must create the bundle.
To create bundle, change directory to android folder: cd android 
Then run**: ./gradlew bundleRelease
**Note: might be necessary to first delete old build by running: ./gradlew clean 
The generated AAB can be found under android/app/build/outputs/bundle/release/app.aab, and is ready to be uploaded to Google Play.
For more details, see https://facebook.github.io/react-native/docs/signed-apk-android 
Delete any current versions of the app on your phone. 
Finally, to install onto your phone, return to emma directory with: cd ..
Then run: react-native run-android --variant=release
If you want to switch back to debugging, delete the installed release version from phone, then run the usual react-native run-android

Note: Android/gradle.properties has been put into gitignore as this file now contains the store keys and passwords.

To upload to Google Play Store,
-Had to go into android\app\build.gradle and modify this: 

buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://facebook.github.io/react-native/docs/signed-apk-android.
            signingConfig signingConfigs.release
            //signingConfig signingConfigs.debug  //Get rid of the debug or else Google play will say can't upload with debug signing 
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }

-Also, APK package name must be unique so might need to change it. Go to:  android\app\src\main\AndroidManifest.xml
Then, changed:  <manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.emma">
To: <manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.emma20191215">
do search of entire project for com.emma and replace with com.emma20191215

Notes for setting up the dev environment:

When installing react-native-fs dependency, followed instructions on https://www.npmjs.com/package/react-native-fs/v/1.2.0
However, do not do the last step of adding anything to MainApplication.java. The auto-linking makes this step unnecessary.

When installing react-native-email, simly did npm install... when try to link in terminal caused error, undid link and it works. So... just do npm install and it's good to go