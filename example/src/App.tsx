import 'react-native-gesture-handler';

import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, ToastAndroid as Toast, TouchableOpacity, View } from 'react-native';
import {
  LegacyFingerprintDialog,
  showLegacyFingerprintDialog,
} from 'react-native-android-legacy-fingerprint';

import CustomUI from './CustomUI';

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          const result = await showLegacyFingerprintDialog();
          Toast.show(`Success: ${result.success}`, Toast.LONG);
        }}
      >
        <Text style={styles.buttonText}>Show built-in dialog</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('custom')}>
        <Text style={styles.buttonText}>Custom UI example</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="main" component={HomeScreen} />
          <Stack.Screen name="custom" component={CustomUI} />
        </Stack.Navigator>
      </NavigationContainer>
      <LegacyFingerprintDialog />
    </>
  );
}

export default App;

const styles = StyleSheet.create({
  button: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#6666ff',
  },
  buttonText: {
    color: 'white',
  },
});
