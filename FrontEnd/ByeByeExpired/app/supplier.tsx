import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface Supplier {
  id: string;
  name: string;
  phone: string;
  logo: any;
}

const { width } = Dimensions.get('window');
const SUPPLIERT_IMAGE = require('../assets/images/SupplierT.png');

export default function SupplierScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'Makro Sriracha',
      phone: '02-xxx-xxxx',
      logo: require('../assets/images/makro.jpg'),
    },
    {
      id: '2',
      name: 'Makro Chonburi',
      phone: '01-xxx-xxxx',
      logo: require('../assets/images/makro.jpg'),
    },
    {
      id: '3',
      name: 'Makro LaemChabang',
      phone: '08-xxx-xxxx',
      logo: require('../assets/images/makro.jpg'),
    },
    {
      id: '4',
      name: 'Lotus Sriracha',
      phone: '09-xxx-xxxx',
      logo: require('../assets/images/lotus.png'),
    },
  ]);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSupplierItem = ({ item }: { item: Supplier }) => (
    <TouchableOpacity style={styles.supplierCard}>
      <Image
        source={item.logo}
        style={styles.supplierLogo}
        resizeMode="cover"
      />
      <View style={styles.supplierInfo}>
        <Text style={styles.supplierName}>{item.name}</Text>
        <View style={styles.phoneContainer}>
          <Ionicons name="call" size={14} color="#7C3AED" />
          <Text style={styles.supplierPhone}>{item.phone}</Text>
        </View>
      </View>
      <Ionicons name="information-circle" size={24} color="#7C3AED" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3E8FF" />
      
      {/* Fixed Header Section */}
      <View style={styles.fixedHeader}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#7C3AED" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Supplier Tracking</Text>
          <TouchableOpacity onPress={() => router.push('/addSupplier')}>
            <MaterialIcons name="add" size={28} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {/* Illustration Section */}
        <View style={styles.illustrationSection}>
          <View style={styles.illustrationBox}>
            <Image
              source={SUPPLIERT_IMAGE}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitleText}>ข้อมูลติดตัวผู้จำหน่ายวัตถุดิบ</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Scrollable Suppliers List */}
      <FlatList
        data={filteredSuppliers}
        renderItem={renderSupplierItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E8FF',
  },
  fixedHeader: {
    backgroundColor: '#F3E8FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 70,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#7C3AED',
  },
  illustrationSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  illustrationBox: {
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  illustrationImage: {
    width: 130,
    height: 130,
    borderRadius: 20,
  },
  subtitleText: {
    fontSize: 14,
    color: '#C13CD0',
    marginTop: 20,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  supplierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  supplierLogo: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9626C2',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplierPhone: {
    fontSize: 12,
    color: '#9626C2',
    marginLeft: 4,
  },
});
