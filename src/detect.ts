import Fingerprint from '.';

export function shouldUseLegacyFingerprint() {
  return (
    Fingerprint.BRAND?.toLowerCase?.() === 'samsung' ||
    Fingerprint.MANUFACTURER?.toLowerCase?.() === 'samsung'
  );
}
