import { NativeModules } from 'react-native';

export default NativeModules.RNALFLegacyFingerprint as {
  readonly FINGERPRINT_ACQUIRED_GOOD: string;
  readonly FINGERPRINT_ACQUIRED_IMAGER_DIRTY: string;
  readonly FINGERPRINT_ACQUIRED_INSUFFICIENT: string;
  readonly FINGERPRINT_ACQUIRED_PARTIAL: string;
  readonly FINGERPRINT_ACQUIRED_TOO_FAST: string;
  readonly FINGERPRINT_ACQUIRED_TOO_SLOW: string;
  readonly FINGERPRINT_ERROR_CANCELED: string;
  readonly FINGERPRINT_ERROR_USER_CANCELED: string;
  readonly FINGERPRINT_ERROR_HW_UNAVAILABLE: string;
  readonly FINGERPRINT_ERROR_LOCKOUT: string;
  readonly FINGERPRINT_ERROR_NO_SPACE: string;
  readonly FINGERPRINT_ERROR_TIMEOUT: string;
  readonly FINGERPRINT_ERROR_UNABLE_TO_PROCESS: string;
  readonly FINGERPRINT_ERROR_VENDOR: string;

  hasPermission: () => Promise<boolean>;
  cancelAuthentication: () => Promise<void>;
  isAuthenticationCanceled: () => Promise<boolean>;
  hasEnrolledFingerprints: () => Promise<boolean>;
  isHardwareDetected: () => Promise<boolean>;
  authenticate: () => Promise<boolean>;
};
