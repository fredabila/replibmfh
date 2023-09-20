import React from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import MusicPlayer from './MusicPlayer';

const RadioScreen = () => {

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <MusicPlayer />
    </View>
  );
};

export default RadioScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});