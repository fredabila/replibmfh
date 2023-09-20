import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';

const GalleryScreen = () => {
  const galleryData = [
    { date: '1st June', data: [
      { id: '1', imageUrl: 'https://source.unsplash.com/random' },
      { id: '2', imageUrl: 'https://source.unsplash.com/random' },
      { id: '3', imageUrl: 'https://source.unsplash.com/random' },
      { id: '4', imageUrl: 'https://source.unsplash.com/random' },
    ]},
    { date: '2nd June', data: [
      { id: '5', imageUrl: 'https://source.unsplash.com/random' },
      { id: '6', imageUrl: 'https://source.unsplash.com/random' },
      { id: '7', imageUrl: 'https://source.unsplash.com/random' },
      { id: '8', imageUrl: 'https://source.unsplash.com/random' },
      { id: '9', imageUrl: 'https://source.unsplash.com/random' },
    ]},
  ];

  const renderGalleryItem = ({ item }) => {
    return <Image source={{ uri: item.imageUrl }} style={styles.imageItem} />;
  };

  const renderGallerySection = ({ item }) => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.dateHeader}>{item.date}</Text>
        <FlatList
          data={item.data}
          keyExtractor={(item) => item.id}
          renderItem={renderGalleryItem}
          numColumns={4}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={galleryData}
        keyExtractor={(item) => item.date}
        renderItem={renderGallerySection}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  imageItem: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
    marginBottom: 5,
    margin: 5,
  },
});

export default GalleryScreen;
