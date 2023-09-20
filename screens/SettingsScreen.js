import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sundayServiceRemindersEnabled, setSundayServiceRemindersEnabled] = useState(true);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const settings = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(settings.granted || settings.ios?.status === 'granted');
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      // If notifications are currently enabled, disable them
      await Notifications.requestPermissionsAsync({ ios: { allowAlert: false, allowBadge: false, allowSound: false } });
      setNotificationsEnabled(false);
    } else {
      // If notifications are currently disabled, enable them
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationsEnabled(status === 'granted');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.label}>Terms and Conditions</Text>
          <AntDesign name="caretright" size={18} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.label}>Privacy Policy</Text>
          <AntDesign name="caretright" size={18} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.label}>Contact Us</Text>
          <AntDesign name="caretright" size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center', // Center the title text
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff', // Background color for sections
    borderRadius: 10, // Add rounded corners to sections
    padding: 20, // Add padding to sections
    elevation: 4, // Add a shadow to sections
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
});

export default SettingsScreen;
