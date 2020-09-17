// Stub module for iOS
export const Constants = {};

/* eslint-disable @typescript-eslint/promise-function-async */
export const LegacyFingerprint = {
  cancelAuthentication: () => Promise.resolve(undefined),
  isAuthenticationCanceled: () => Promise.resolve(false),
  hasEnrolledFingerprints: () => Promise.resolve(false),
  isHardwareDetected: () => Promise.resolve(false),
  authenticate: () => Promise.resolve(undefined),
  Constants,
};
