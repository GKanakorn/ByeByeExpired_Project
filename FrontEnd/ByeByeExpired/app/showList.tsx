import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function ShowListScreen() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState('ม.ค.');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const products: Product[] = [
    { id: '1', name: 'เนื้อหมู', price: 350 },
    { id: '2', name: 'นมสด', price: 198 },
    { id: '3', name: 'ผักสลัด', price: 140 },
    { id: '4', name: 'ไข่ไก่', price: 68 },
    { id: '5', name: 'ซุปชม', price: 30 },
    { id: '6', name: 'มาน่า รสหมูสับ', price: 28 },
    { id: '7', name: 'ปลากระป๋อง', price: 31 },
  ];

  const total = products.reduce((sum, product) => sum + product.price, 0);

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={styles.productRow}>
      <Text style={styles.productNumber}>{index + 1}. </Text>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price} บาท</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#F3E8FF', '#FBE9FF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3E8FF" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>วัตถุดิบที่หมดอายุ</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelectorContainer}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text style={styles.monthButtonText}>เดือน {selectedMonth}</Text>
            <Ionicons
              name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={styles.dropdown}>
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedMonth(month);
                    setIsDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedMonth === month && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product List Card */}
        <View style={styles.card}>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />

          {/* Total */}
          <View style={styles.totalContainer}>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>รวม</Text>
              <Text style={styles.totalPrice}>{total} บาท</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 24,
    position: 'relative',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#7C3AED',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 12,
    padding: 4,
  },
  monthSelectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    zIndex: 10,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignSelf: 'flex-end',
  },
  monthButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#7C3AED',
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: '#9626C2',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    marginHorizontal: 20,
    paddingHorizontal: 30,
    paddingVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  productNumber: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
  },
  productName: {
    flex: 1,
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
  },
  totalContainer: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E7DFF2',
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    color: '#FF1493',
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 18,
    color: '#FF1493',
    fontWeight: 'bold',
  },
});
