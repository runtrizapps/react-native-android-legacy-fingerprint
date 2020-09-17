import NativeModule from './native-module';
import { DeviceEventEmitter } from 'react-native';

export const Constants = {
  FINGERPRINT_ACQUIRED_GOOD: NativeModule.FINGERPRINT_ACQUIRED_GOOD,
  FINGERPRINT_ACQUIRED_IMAGER_DIRTY: NativeModule.FINGERPRINT_ACQUIRED_IMAGER_DIRTY,
  FINGERPRINT_ACQUIRED_INSUFFICIENT: NativeModule.FINGERPRINT_ACQUIRED_INSUFFICIENT,
  FINGERPRINT_ACQUIRED_PARTIAL: NativeModule.FINGERPRINT_ACQUIRED_PARTIAL,
  FINGERPRINT_ACQUIRED_TOO_FAST: NativeModule.FINGERPRINT_ACQUIRED_TOO_FAST,
  FINGERPRINT_ACQUIRED_TOO_SLOW: NativeModule.FINGERPRINT_ACQUIRED_TOO_SLOW,
  FINGERPRINT_ERROR_CANCELED: NativeModule.FINGERPRINT_ERROR_CANCELED,
  FINGERPRINT_ERROR_USER_CANCELED: NativeModule.FINGERPRINT_ERROR_USER_CANCELED,
  FINGERPRINT_ERROR_HW_UNAVAILABLE: NativeModule.FINGERPRINT_ERROR_HW_UNAVAILABLE,
  FINGERPRINT_ERROR_LOCKOUT: NativeModule.FINGERPRINT_ERROR_LOCKOUT,
  FINGERPRINT_ERROR_NO_SPACE: NativeModule.FINGERPRINT_ERROR_NO_SPACE,
  FINGERPRINT_ERROR_TIMEOUT: NativeModule.FINGERPRINT_ERROR_TIMEOUT,
  FINGERPRINT_ERROR_UNABLE_TO_PROCESS: NativeModule.FINGERPRINT_ERROR_UNABLE_TO_PROCESS,
  FINGERPRINT_ERROR_VENDOR: NativeModule.FINGERPRINT_ERROR_VENDOR,
};

export type FingerprintError = {
  code: string;
  message: string;
};

export const LegacyFingerprint = {
  ...NativeModule,
  authenticate: async (warningCallback?: (response: FingerprintError) => void) => {
    if (typeof warningCallback === 'function') {
      DeviceEventEmitter.addListener('fingerPrintAuthenticationHelp', warningCallback);
    }

    let err: Error | undefined;
    let result = false;
    try {
      result = await NativeModule.authenticate();
    } catch (ex) {
      if (ex instanceof Error) {
        err = ex;
      }
    }

    // remove the subscriptions and throw if needed
    if (typeof warningCallback === 'function') {
      DeviceEventEmitter.removeListener('fingerPrintAuthenticationHelp', warningCallback);
    }

    if (typeof err !== 'undefined') {
      throw err;
    }
    return result;
  },
  addWarningListener: (warningCallback: (response: FingerprintError) => void) => {
    DeviceEventEmitter.addListener('fingerPrintAuthenticationHelp', warningCallback);
    return () => {
      DeviceEventEmitter.removeListener('fingerPrintAuthenticationHelp', warningCallback);
    };
  },
  Constants,
};
