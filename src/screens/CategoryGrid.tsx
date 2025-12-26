import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const categories = [
  'Cars', 'Bikes', 'Cameras', 'Houses',
  'Sports', 'Books', 'Electronics', 'More...',
];

export default function CategoryGrid() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {categories.slice(0, 4).map(cat => (
          <Text key={cat} style={styles.catText}>{cat}</Text>
        ))}
      </View>
      <View style={styles.row}>
        {categories.slice(4, 8).map(cat => (
          <Text key={cat} style={styles.catText}>{cat}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
