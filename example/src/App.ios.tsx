import React, { FunctionComponent, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LegacyFingerprint from 'react-native-android-legacy-fingerprint';

function usePromise<T>(asyncFn: () => Promise<T>) {
  const [state, setState] = useState<T | undefined>(undefined);
  useEffect(() => {
    void asyncFn().then((result) => setState(result));
  }, [asyncFn]);
  return state;
}

const App: FunctionComponent = () => {
  const enrolled = usePromise(LegacyFingerprint.hasEnrolledFingerprints);
  const supported = usePromise(LegacyFingerprint.isHardwareDetected);
  const permission = usePromise(LegacyFingerprint.hasPermission);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to FingerprintAndroid!</Text>
      <Text style={styles.instructions}>
        However, as the name might suggest, this library is android-only.
      </Text>
      <Text style={styles.instructions}>
        This version of the app only exists to check if iOS doesn't crash.
      </Text>
      <Text style={styles.instructions}>
        Hardware detected (should be false): {`${supported ?? '<waiting>'}`}
      </Text>
      <Text style={styles.instructions}>
        Has permission (should be false): {`${permission ?? '<waiting>'}`}
      </Text>
      <Text style={styles.instructions}>
        Is enrolled (should be false): {`${enrolled ?? '<waiting>'}`}
      </Text>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
