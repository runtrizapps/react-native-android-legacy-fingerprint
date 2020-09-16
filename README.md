<!-- Bootstrapped with make-react-native-package v0.62.18 -->

# react-native-android-legacy-fingerprint
[![npm version](https://badge.fury.io/js/react-native-android-legacy-fingerprint.svg)](https://badge.fury.io/js/react-native-android-legacy-fingerprint)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/standard/standard)
[![Dependency Status](https://david-dm.org/runtrizapps/react-native-android-legacy-fingerprint.svg)](https://david-dm.org/runtrizapps/react-native-android-legacy-fingerprint)
[![devDependencies Status](https://david-dm.org/runtrizapps/react-native-android-legacy-fingerprint/dev-status.svg)](https://david-dm.org/runtrizapps/react-native-android-legacy-fingerprint?type=dev)
[![typings included](https://img.shields.io/badge/typings-included-brightgreen.svg?t=1495378566925)](package.json)
[![npm](https://img.shields.io/npm/l/express.svg)](https://www.npmjs.com/package/react-native-android-legacy-fingerprint)

Legacy fingerprint authentication for react native (Android only). Based on the deprecated `FingerprintManger` API. You probably want [expo-local-authentication](https://docs.expo.io/versions/latest/sdk/local-authentication/) or [react-native-fingerprint-scanner](https://github.com/hieuvp/react-native-fingerprint-scanner)

Based heavily on [react-native-fingerprint-android](https://github.com/jariz/react-native-fingerprint-android), but updated with:

* AndroidX support library use
* More FingerprintManager message codes
* Written with TypeScript & Kotlin
* Respects project settings for `targetSdk` & build.gradle config

## Why?
The currently-maintained fingerprint/biometric auth libraries for React Native have all adopted the new `BiometricPrompt`. This is great!

However, _some vendors_ (\*cough\* Samsung) have custom biometics overlays that [lead to confusing UX](https://github.com/expo/expo/issues/8246) on affected devices. In this case, it may be desirable to use the older `FingerprintManger` API.

## Status: pre-release

- Android:
  - Requires Kotlin
- iOS:
  - **No support planned**
- react-native:
  - supported versions "<strong>&gt;= 0.60.0</strong>"


## Installation

<table>
<td>
<details style="border: 1px solid; border-radius: 5px; padding: 5px">
  <summary>with react-native "<strong>&gt;=0.60.0</strong>"</summary>

### 0. Setup Kotlin

- Modify `android/build.gradle`:

  ```diff
  buildscript {
    ext {
      ...
  +   kotlinVersion = "1.3.72"
    }
  ...

    dependencies {
  +   classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}")
      ...
  ```

### 1. Install latest version from npm

`$ npm i react-native-android-legacy-fingerprint -S`

## Demo

 Android                                       |  iOS
:---------------------------------------------:|:---------------------------------------------:
???  |  ???

</table>

## Example  
This is a simplified version. There are a few more concerns you should be aware of. [see 'Watch out!'](#watch-out)  
For the full version, see the `example` directory.

```js
import Fingerprint from 'react-native-android-legacy-fingerprint';
import { ToastAndroid as Toast } from 'react-native';

(async() => {
  const hardware = await Fingerprint.isHardwareDetected();
  const permission = await Fingerprint.hasPermission();
  const enrolled = await Fingerprint.hasEnrolledFingerprints();

  if (!hardware || !permission || !enrolled) {
    let message = !enrolled ? 'No fingerprints registered.' : !hardware ? 'This device doesn\'t support fingerprint scanning.' : 'App has no permission.'
    Toast.show(message, Toast.SHORT);
    return;
  }

  try {
    await Fingerprint.authenticate(warning => {
        Toast.show(`Try again: ${warning.message}`, Toast.SHORT);
    });
  } catch(error) {
    Toast.show(`Authentication aborted: ${error.message}`, Toast.SHORT);
  }

  Toast.show("Auth successful!", Toast.SHORT);
})();
```


## API

All functions & constants are static.

#### `.authenticate(warningCallback?: (response: FingerprintError) => void):Promise<boolean>`  
Starts authentication flow, with a optional callback for warning messages, instructing your user why authentication failed.  
Returns a Promise.
###### Resolving
Authentication resolves to a boolean indicating if the fingerprint was recognized and auth succeeded.
If the result is `false`, the fingerprint was recognized but not valid.
  
###### Rejection
Authentication has failed if the promise gets rejected.  
Callback will receive a single parameter with the following structure: (example)  

```json
{
    "code": 1,
    "message": "The hardware is unavailable. Try again later."
}
```

This code will be match one of the following constants in the FingerprintAndroid module:

| Constant                                               | Description                                                                                                                                                                                                                                                                                     |
|--------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| FingerprintAndroid.FINGERPRINT_ERROR_CANCELED          | The operation was canceled because the fingerprint sensor is unavailable.                                                                                                                                                                                                                       |
| FingerprintAndroid.FINGERPRINT_ERROR_HW_UNAVAILABLE    | The hardware is unavailable.                                                                                                                                                                                                                                                                    |
| FingerprintAndroid.FINGERPRINT_ERROR_LOCKOUT           | The operation was canceled because the API is locked out due to too many attempts.                                                                                                                                                                                                              |
| FingerprintAndroid.FINGERPRINT_ERROR_NO_SPACE          | Error state returned for operations like enrollment; the operation cannot be completed because there's not enough storage remaining to complete the operation.                                                                                                                                  |
| FingerprintAndroid.FINGERPRINT_ERROR_TIMEOUT           | Error state returned when the current request has been running too long.                                                                                                                                                                                                                        |
| FingerprintAndroid.FINGERPRINT_ERROR_UNABLE_TO_PROCESS | Error state returned when the sensor was unable to process the current image.                                                                                                                                                                                                                   |

_For more info on the constants, [see Android FingerprintManager docs](https://developer.android.com/reference/android/hardware/fingerprint/FingerprintManager.html)_

###### warningCallback
warningCallback is the only and optional parameter to `.authenticate()`.  
If present, warningCallback gets called with a single parameter, a object with the following structure:  
```json
{
    "code": 1,
    "message": "Only acquired a partial fingerprint. Try again."
}
```

This code will be match one of the following constants in FingerprintAndroid:  

| Constant                                             | Description                                                                                                                                                                                                                                                                                     |
|------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| FingerprintAndroid.FINGERPRINT_ACQUIRED_IMAGER_DIRTY | The fingerprint image was too noisy due to suspected or detected dirt on the sensor.                                                                                                                                                                                                            |
| FingerprintAndroid.FINGERPRINT_ACQUIRED_INSUFFICIENT | The fingerprint image was too noisy to process due to a detected condition                                                                                                                                                                                                                      |
| FingerprintAndroid.FINGERPRINT_ACQUIRED_PARTIAL      | Only a partial fingerprint image was detected.                                                                                                                                                                                                                                                  |
| FingerprintAndroid.FINGERPRINT_ACQUIRED_TOO_FAST     | The fingerprint image was incomplete due to quick motion.                                                                                                                                                                                                                                       |
| FingerprintAndroid.FINGERPRINT_ACQUIRED_TOO_SLOW     | The fingerprint image was unreadable due to lack of motion.                                                                                                                                                                                                                                     |
| FingerprintAndroid.FINGERPRINT_ACQUIRED_AUTH_FAILED  | Custom constant added by react-native-fingerprint-android, to simplify API. This code is used when a [fingerprint was recognized but not valid.](https://developer.android.com/reference/android/hardware/fingerprint/FingerprintManager.AuthenticationCallback.html#onAuthenticationFailed()) |

_For more info on the constants, [see Android FingerprintManager docs](https://developer.android.com/reference/android/hardware/fingerprint/FingerprintManager.html)_

#### `.isAuthenticationCanceled(): Promise<boolean>`
Tells you whether or not authentication is running or not.

#### `.hasPermission(): Promise<boolean>`
Will check if `android.permission.USE_FINGERPRINT` is granted to this app. (should always return true if you add the permission to your AndroidManifest...)

#### `hasEnrolledFingerprints(): Promise<boolean>`
Determine if there is at least one fingerprint enrolled.  

#### `isHardwareDetected(): Promise<boolean>`
Determine if fingerprint hardware is present and functional.

#### `cancelAuthentication(): Promise<void>`
Manually cancel the authentication, this is required to follow the design principles in [the design guidelines](https://material.google.com/patterns/fingerprint.html). When called this will trigger a rejection of the original authenticate promise.

## Watch out!
React Native Fingerprint Android is mostly just a set of bindings to Android FingerprintManager.  
Alas, _it's very low level_. You are still responsible for:

- Making sure the device has fingerprints enrolled by calling `FingerprintAndroid.hasEnrolledFingerprints()` (if you don't check this before starting authentication, **any valid fingerprint will be accepted**)  
- Making sure your app has proper permissions setup (see installation guide below)
- Making sure device has supported hardware by calling `FingerprintAndroid.isHardwareDetected()` 
- [Making sure you display the correct icon, as defined by the design guidelines.](https://material.io/design/platform-guidance/android-fingerprint.html#)
- Restarting authentication if screen turns off. (see example project for on an example on how to do that)

If you don't do any of the checks before calling `FingerprintAndroid.authenticate`, it will either **directly fail, or your app will contain security vulnerabilities.**
