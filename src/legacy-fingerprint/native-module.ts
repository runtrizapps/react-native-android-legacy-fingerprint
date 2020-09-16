import { NativeModules } from 'react-native';

export default NativeModules.RNALFLegacyFingerprint as {
  readonly FINGERPRINT_ACQUIRED_GOOD: number;
  readonly FINGERPRINT_ACQUIRED_IMAGER_DIRTY: number;
  readonly FINGERPRINT_ACQUIRED_INSUFFICIENT: number;
  readonly FINGERPRINT_ACQUIRED_PARTIAL: number;
  readonly FINGERPRINT_ACQUIRED_TOO_FAST: number;
  readonly FINGERPRINT_ACQUIRED_TOO_SLOW: number;
  readonly FINGERPRINT_ERROR_CANCELED: number;
  readonly FINGERPRINT_ERROR_USER_CANCELED: number;
  readonly FINGERPRINT_ERROR_HW_UNAVAILABLE: number;
  readonly FINGERPRINT_ERROR_LOCKOUT: number;
  readonly FINGERPRINT_ERROR_NO_SPACE: number;
  readonly FINGERPRINT_ERROR_TIMEOUT: number;
  readonly FINGERPRINT_ERROR_UNABLE_TO_PROCESS: number;
  readonly FINGERPRINT_ERROR_VENDOR: number;

  hasPermission: () => Promise<boolean>;
  cancelAuthentication: () => Promise<void>;
  isAuthenticationCanceled: () => Promise<boolean>;
  hasEnrolledFingerprints: () => Promise<boolean>;
  isHardwareDetected: () => Promise<boolean>;
  authenticate: () => Promise<boolean>;
};
