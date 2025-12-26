import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CategoryGrid from './CategoryGrid';
import ProductList from './ProductList';

export default function PublicHomeScreen() {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.logo}>Rentify</Text>
            <View style={styles.locationRow}>
              <Icon name="map-marker" size={20} color="#9b17e3" style={{ marginRight: 4 }} />
              <Text style={styles.locationText}>Karungappally, Kollam</Text>
            </View>
          </View>
        </View>
        {/* Search Row */}
        <View style={styles.searchRowPadded}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={22} color="#888" style={{ marginLeft: 8, marginRight: 4 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search properties, locations..."
              placeholderTextColor="#aaa"
            />
          </View>
          <TouchableOpacity style={styles.wishlistBtn}>
            <Icon name="heart-outline" size={26} color="#9b17e3" />
          </TouchableOpacity>
        </View>

        <CategoryGrid />
        <ProductList />
      </View>
      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Icon name="home-variant-outline" size={26} color="#9b17e3" />
          <Text style={styles.footerLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <Icon name="chat-outline" size={26} color="#9b17e3" />
          <Text style={styles.footerLabel}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <Image source={require('../../assets/lend.png')} style={styles.lendImage} />
          <Text style={styles.lendLabel}>Lend</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <Icon name="apps" size={26} color="#9b17e3" />
          <Text style={styles.footerLabel}>Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <Icon name="account-circle-outline" size={26} color="#9b17e3" />
          <Text style={styles.footerLabel}>Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fb', paddingTop: 56 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#222', letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4 },
  locationText: { fontSize: 16, color: '#222', fontWeight: '600' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  searchRowPadded: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, paddingHorizontal: 18 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#9b17e3', marginRight: 12, height: 48, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  searchInput: { flex: 1, fontSize: 16, color: '#222', paddingVertical: 0, paddingHorizontal: 8 },
  wishlistBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    alignSelf: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 8,
  },
  // lendAbsoluteWrapper removed
  
  footerItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  footerLabel: {
    fontSize: 12,
    color: '#222',
    marginTop: 2,
    fontWeight: '500',
  },
  lendWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  lendLabel: {
    fontSize: 13,
    color: '#9b17e3',
    marginTop: 2,
    fontWeight: '700',
  },
  lendImage: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  // lendWrapper and lendButton removed for layout consistency
});
