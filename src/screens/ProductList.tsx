


import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import products from '../data/products.json';

const CARD_MARGIN = 8;
const CARD_WIDTH = (Dimensions.get('window').width - 18 * 2 - CARD_MARGIN * 2) / 2;



type ProductCardProps = {
  id: string;
  title: string;
  price: number;
  location: string;
  onPress: () => void;
};

function ProductCard({ title, price, location, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imagePlaceholder} />
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.price}>₹{price}</Text>
      <Text style={styles.location}>{location}</Text>
    </TouchableOpacity>
  );
}


export default function ProductList() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <FlatList
      data={products}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <ProductCard
          id={item.id}
          title={item.title}
          price={item.pricing.price}
          location={item.location.city}
          onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
        />
      )}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      numColumns={2}
      columnWrapperStyle={styles.row}
    />
  );
}
const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
    minHeight: 36,
  },
  listContainer: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 0,
    marginHorizontal: CARD_MARGIN,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#eaeaea',
    borderRadius: 8,
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  location: {
    fontSize: 13,
    color: '#222',
    textAlign: 'center',
  },
});
