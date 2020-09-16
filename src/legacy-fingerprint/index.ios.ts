// Stub module for iOS
export const Constants = {};

export const LegacyFingerprint = {
  cancelAuthentication: () => Promise.resolve(undefined),
  isAuthenticationCanceled: () => Promise.resolve(false),
  hasPermission: () => Promise.resolve(false),
  hasEnrolledFingerprints: () => Promise.resolve(false),
  isHardwareDetected: () => Promise.resolve(false),
  authenticate: () => Promise.resolve(undefined),
  Constants,
};
