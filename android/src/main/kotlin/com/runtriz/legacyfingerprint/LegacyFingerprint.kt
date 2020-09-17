package com.runtriz.legacyfingerprint

import android.content.pm.PackageManager
import android.Manifest
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.hardware.fingerprint.FingerprintManagerCompat
import androidx.core.os.CancellationSignal

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

const val FINGERPRINT_ACQUIRED_GOOD = 0
const val FINGERPRINT_ACQUIRED_IMAGER_DIRTY = 3
const val FINGERPRINT_ACQUIRED_INSUFFICIENT = 2
const val FINGERPRINT_ACQUIRED_PARTIAL = 1
const val FINGERPRINT_ACQUIRED_TOO_FAST = 5
const val FINGERPRINT_ACQUIRED_TOO_SLOW = 4
const val FINGERPRINT_ERROR_CANCELED = 5
const val FINGERPRINT_ERROR_USER_CANCELED = 10
const val FINGERPRINT_ERROR_HW_UNAVAILABLE = 1
const val FINGERPRINT_ERROR_LOCKOUT = 7
const val FINGERPRINT_ERROR_NO_SPACE = 4
const val FINGERPRINT_ERROR_TIMEOUT = 3
const val FINGERPRINT_ERROR_UNABLE_TO_PROCESS = 2
const val FINGERPRINT_ERROR_VENDOR = 8

@ReactModule(name = LegacyFingerprint.reactClass)
class LegacyFingerprint(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

  var fingerprintManager: FingerprintManagerCompat
  var cancellationSignal: CancellationSignal? = null
  var isCanceled = false

  companion object {
    const val reactClass = "RNALFLegacyFingerprint"
  }

  override fun getName(): String {
    return reactClass
  }

  init {
    fingerprintManager = FingerprintManagerCompat.from(reactApplicationContext)
  }

  // Hardcoded from https://developer.android.com/reference/android/hardware/fingerprint/FingerprintManager.html#FINGERPRINT_ACQUIRED_GOOD
  // So we don't depend on FingerprintManager directly
  override fun getConstants(): Map<String, String>? {
    val constants: MutableMap<String, String> = HashMap()
    constants.put("FINGERPRINT_ACQUIRED_GOOD", Integer.toString(FINGERPRINT_ACQUIRED_GOOD))
    constants.put("FINGERPRINT_ACQUIRED_IMAGER_DIRTY", Integer.toString(FINGERPRINT_ACQUIRED_IMAGER_DIRTY))
    constants.put("FINGERPRINT_ACQUIRED_INSUFFICIENT", Integer.toString(FINGERPRINT_ACQUIRED_INSUFFICIENT))
    constants.put("FINGERPRINT_ACQUIRED_PARTIAL", Integer.toString(FINGERPRINT_ACQUIRED_PARTIAL))
    constants.put("FINGERPRINT_ACQUIRED_TOO_FAST", Integer.toString(FINGERPRINT_ACQUIRED_TOO_FAST))
    constants.put("FINGERPRINT_ACQUIRED_TOO_SLOW", Integer.toString(FINGERPRINT_ACQUIRED_TOO_SLOW))
    constants.put("FINGERPRINT_ERROR_CANCELED", Integer.toString(FINGERPRINT_ERROR_CANCELED))
    constants.put("FINGERPRINT_ERROR_USER_CANCELED", Integer.toString(FINGERPRINT_ERROR_USER_CANCELED))
    constants.put("FINGERPRINT_ERROR_HW_UNAVAILABLE", Integer.toString(FINGERPRINT_ERROR_HW_UNAVAILABLE))
    constants.put("FINGERPRINT_ERROR_LOCKOUT", Integer.toString(FINGERPRINT_ERROR_LOCKOUT))
    constants.put("FINGERPRINT_ERROR_NO_SPACE", Integer.toString(FINGERPRINT_ERROR_NO_SPACE))
    constants.put("FINGERPRINT_ERROR_TIMEOUT", Integer.toString(FINGERPRINT_ERROR_TIMEOUT))
    constants.put("FINGERPRINT_ERROR_UNABLE_TO_PROCESS", Integer.toString(FINGERPRINT_ERROR_UNABLE_TO_PROCESS))
    constants.put("FINGERPRINT_ERROR_VENDOR", Integer.toString(FINGERPRINT_ERROR_VENDOR))
    return constants
  }

  @ReactMethod
  fun hasPermission(promise: Promise) {
    try {
      promise.resolve(ActivityCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.USE_FINGERPRINT) === PackageManager.PERMISSION_GRANTED)
    } catch (ex: Exception) {
      promise.reject(ex)
    }
  }

  @ReactMethod
  fun hasEnrolledFingerprints(promise: Promise) {
    try {
      promise.resolve(fingerprintManager.hasEnrolledFingerprints())
    } catch (secEx: SecurityException) {
      val exception = Exception("App does not have the proper permissions. (did you add USE_FINGERPRINT to your manifest?)\nMore info see https://github.com/jariz/react-native-fingerprint-android")
      exception.initCause(secEx)
      promise.reject(exception)
    } catch (ex: Exception) {
      promise.reject(ex)
    }
  }

  @ReactMethod
  fun isHardwareDetected(promise: Promise) {
    try {
      promise.resolve(fingerprintManager.isHardwareDetected())
    } catch (secEx: SecurityException) {
      val exception = Exception("App does not have the proper permissions. (did you add USE_FINGERPRINT to your manifest?)\nMore info see https://github.com/jariz/react-native-fingerprint-android")
      exception.initCause(secEx)
      promise.reject(exception)
    } catch (ex: Exception) {
      promise.reject(ex)
    }
  }

  @ReactMethod
  fun authenticate(promise: Promise) {
    try {
      isCanceled = false
      cancellationSignal = CancellationSignal()
      fingerprintManager.authenticate(null, 0, cancellationSignal, AuthenticationCallback(promise), null)
    } catch (secEx: SecurityException) {
      val exception = Exception("App does not have the proper permissions. (did you add USE_FINGERPRINT to your manifest?)\nMore info see https://github.com/jariz/react-native-fingerprint-android")
      exception.initCause(secEx)
      promise.reject(exception)
    } catch (ex: Exception) {
      promise.reject(ex)
    }
  }

  @ReactMethod
  fun isAuthenticationCanceled(promise: Promise) {
    promise.resolve(isCanceled)
  }

  @ReactMethod
  fun cancelAuthentication(promise: Promise) {
    try {
      if (!isCanceled) {
        cancellationSignal?.cancel()
        isCanceled = true
      }
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject(e)
    }
  }

  inner class AuthenticationCallback(var promise: Promise?) : FingerprintManagerCompat.AuthenticationCallback() {
    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
      super.onAuthenticationError(errorCode, errString)
      if (errorCode == FINGERPRINT_ERROR_CANCELED) {
        isCanceled = true
      }
      if (promise == null) {
        Log.e("LegacyFingerprint", "Tried to reject the auth promise, but it was already resolved / rejected. This shouldn't happen.")
      } else {
        promise!!.reject(Integer.toString(errorCode), errString.toString())
        promise = null
      }
    }

    override fun onAuthenticationHelp(helpCode: Int, helpString: CharSequence) {
      super.onAuthenticationHelp(helpCode, helpString)
      val writableNativeMap = WritableNativeMap()
      writableNativeMap.putString("code", Integer.toString(helpCode))
      writableNativeMap.putString("message", helpString.toString())
      reactApplicationContext
        .getJSModule(RCTDeviceEventEmitter::class.java)
        .emit("fingerPrintAuthenticationHelp", writableNativeMap)
    }

    override fun onAuthenticationSucceeded(result: FingerprintManagerCompat.AuthenticationResult?) {
      super.onAuthenticationSucceeded(result)
      if (promise == null) {
        Log.e("LegacyFingerprint", "Tried to resolve the auth promise, but it was already resolved / rejected. This shouldn't happen.")
      } else {
        promise!!.resolve(true)
        promise = null
      }
    }

    override fun onAuthenticationFailed() {
      super.onAuthenticationFailed()
      if (promise == null) {
        Log.e("LegacyFingerprint", "Tried to resolve the auth promise, but it was already resolved / rejected. This shouldn't happen.")
      } else {
        promise!!.resolve(false)
        promise = null
      }
    }
  }
}
