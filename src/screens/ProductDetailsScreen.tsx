import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import products from '../data/products.json';

export default function ProductDetailsScreen() {
  const route = useRoute();
  // @ts-ignore
  const { productId } = route.params || {};
  const navigation = useNavigation();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <View style={styles.centered}><Text>Product not found.</Text></View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imagePlaceholder} />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>₹{product.pricing.price} / {product.pricing.rentalDurations[0].replace('_', ' ').toLowerCase()}</Text>
      <Text style={styles.location}>{product.location.city} ({product.location.distanceKm} km away)</Text>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.sectionTitle}>Condition</Text>
      <Text style={styles.value}>{product.condition}</Text>
      <Text style={styles.sectionTitle}>Availability</Text>
      <Text style={styles.value}>{product.availability.from} to {product.availability.to}</Text>
      <TouchableOpacity style={styles.rentBtn} onPress={() => {}}>
        <Text style={styles.rentBtnText}>Rent this product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 22,
    paddingTop: 50,
    backgroundColor: '#f8f9fb',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 220,
    height: 220,
    backgroundColor: '#eaeaea',
    borderRadius: 16,
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    color: '#9b17e3',
    fontWeight: '700',
    marginBottom: 4,
  },
  location: {
    fontSize: 15,
    color: '#555',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9b17e3',
    marginTop: 16,
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  value: {
    fontSize: 15,
    color: '#222',
    alignSelf: 'flex-start',
  },
  rentBtn: {
    marginTop: 28,
    backgroundColor: '#9b17e3',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: 'center',
    width: '100%',
  },
  rentBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
