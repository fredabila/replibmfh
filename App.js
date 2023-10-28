import OneSignal from 'react-native-onesignal';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppRegistry } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { getApps, initializeApp } from '@react-native-firebase/app';
import firebaseConfig from './firebaseConfig';
import * as Notifications from 'expo-notifications';
import PowerPoint from './screens/AIBuildup';


import HomeScreen from './screens/HomeScreen';
import RadioScreen from './screens/Radio';
import SettingsScreen from './screens/SettingsScreen';

const tabIcon = {
  Home: 'home',
  Radio: 'radio',
  Settings: 'settings',
  Chat: 'chatbox',
};


const Tab = createBottomTabNavigator();
const App = () => {
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions denied');
      }
    };
    requestNotificationPermissions();
  }, []);
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  OneSignal.setAppId('56e8d381-3c63-471a-ba7b-bf9a691f7321');
  AppRegistry.registerComponent('Main', () => App);
  useKeepAwake();
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            // Get the icon name based on the route name
            const iconName = tabIcon[route.name];

            // Return the Ionicons component with the appropriate icon name
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Radio" component={RadioScreen} />
        <Tab.Screen name="Chat" component={PowerPoint} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
