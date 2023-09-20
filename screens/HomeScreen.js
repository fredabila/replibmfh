import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = () => {
  const [dailyScriptures, setDailyScriptures] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [news, setNews] = useState([]);
  const [activeTab, setActiveTab] = useState('scriptures');


  useEffect(() => {
    const scripturesRef = firestore().collection('dailyScriptures');
    const announcementsRef = firestore().collection('announcements');
    const newsRef = firestore().collection('news');


    const unsubscribeScriptures = scripturesRef.onSnapshot((querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        const { date, scripture, text, imageUrl } = doc.data();
        data.push({
          id: doc.id,
          date,
          scripture,
          text,
          imageUrl,
        });
      });
      setDailyScriptures(data);
    });

    // Subscribe to real-time updates from Firestore for announcements
    const unsubscribeAnnouncements = announcementsRef.onSnapshot((querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        const { title, content, imageUrl } = doc.data();
        data.push({
          id: doc.id,
          title,
          content,
          imageUrl,
        });
      });
      setAnnouncements(data);
    });

    // Subscribe to real-time updates from Firestore for news
    const unsubscribeNews = newsRef.onSnapshot((querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        const { title, content, imageUrl } = doc.data();
        data.push({
          id: doc.id,
          title,
          content,
          imageUrl,
        });
      });
      setNews(data);
    });

    return () => {
      unsubscribeScriptures();
      unsubscribeAnnouncements();
      unsubscribeNews();
    };
  }, []);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scriptures' ? styles.activeTab : null]}
          onPress={() => handleTabPress('scriptures')}
        >
          <Text style={styles.tabText}>Daily Scriptures</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'announcements' ? styles.activeTab : null]}
          onPress={() => handleTabPress('announcements')}
        >
          <Text style={styles.tabText}>Announcements</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'news' ? styles.activeTab : null]}
          onPress={() => handleTabPress('news')}
        >
          <Text style={styles.tabText}>News</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'scriptures' &&
          dailyScriptures
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((item) => (
              <TouchableOpacity key={item.id} style={styles.card}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.scripture}>{item.scripture}</Text>
                <Text style={styles.scriptureText}>
                  {item.text.split(' ').map((word, index) => {
                    if (word.startsWith('http://') || word.startsWith('https://')) {
                      return (
                        <Text
                          key={index}
                          style={styles.link}
                          onPress={() => Linking.openURL(word)}
                        >
                          {word}{' '}
                        </Text>
                      );
                    }
                    return word + ' ';
                  })}
                </Text>
                {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.image} />
                )}
              </TouchableOpacity>
            ))}


        {activeTab === 'announcements' &&
          announcements
            .slice() // Create a copy of the array to avoid mutating the original
            .reverse() // Reverse the order to display newly added ones first
            .map((item) => (
              <TouchableOpacity key={item.id} style={styles.card}>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Text style={styles.announcementText}>
                  {item.content.split(' ').map((word, index) => {
                    if (word.startsWith('http://') || word.startsWith('https://')) {
                      return (
                        <Text
                          key={index}
                          style={styles.link}
                          onPress={() => Linking.openURL(word)}
                        >
                          {word}{' '}
                        </Text>
                      );
                    }
                    return word + ' ';
                  })}
                </Text>
                {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
              </TouchableOpacity>
            ))}



        {activeTab === 'news' &&
          news.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsText}>
                {item.content.split(' ').map((word, index) => {
                  if (word.startsWith('http://') || word.startsWith('https://')) {
                    return (
                      <Text
                        key={index}
                        style={styles.link}
                        onPress={() => Linking.openURL(word)}
                      >
                        {word}{' '}
                      </Text>
                    );
                  }
                  return word + ' ';
                })}
              </Text>
              {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
            </TouchableOpacity>
          ))}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbdbdb',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#333',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    backgroundColor: 'transparent', // Adjust the background color here
  },
  activeTab: {
    borderBottomColor: '#FFF',
    backgroundColor: '#333', // Background color for the active tab
  },
  tabText: {
    color: '#fff', // Adjust the text color for inactive tabs
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFF', // Text color for the active tab
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 7,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scripture: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scriptureText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  announcementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  announcementText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  newsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 8,
  },
  link: {
    color: 'blue', // Change link color as desired
    textDecorationLine: 'underline', // Add underline to links
  },
});

export default HomeScreen;
