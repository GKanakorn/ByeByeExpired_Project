import React, { useCallback, useMemo, useState } from 'react';
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
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProducts } from '../src/api/product.api';
import { useLocation } from '../src/context/LocationContext';

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export default function ShowListScreen() {
  const router = useRouter();
  const { currentLocation } = useLocation();
  const { locationId, filterType, monthIndex } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);

  const targetLocationId = (locationId as string) || currentLocation?.id;
  const isBusiness = currentLocation?.type === 'business';
  const filterTypeParam = (filterType as string) || 'month';
  const monthIndexParam = monthIndex ? parseInt(monthIndex as string) : new Date().getMonth();

  useFocusEffect(
    useCallback(() => {
      const fetchExpiredProducts = async () => {
        try {
          if (!targetLocationId || !isBusiness) {
            setProducts([]);
            return;
          }

          const data = await getProducts(targetLocationId);

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const currentYear = today.getFullYear();

          const expiredProducts = (data || []).filter((item: any) => {
            if (!item.expiration_date) return false;
            const expDate = new Date(item.expiration_date);
            expDate.setHours(0, 0, 0, 0);
            
            // Check if expired
            if (expDate >= today) return false;

            // Filter by month/year
            if (filterTypeParam === 'year') {
              // Show all months in current year
              return expDate.getFullYear() === currentYear;
            } else {
              // Show only selected month
              return expDate.getMonth() === monthIndexParam && expDate.getFullYear() === currentYear;
            }
          });

          const formatted = expiredProducts.map((item: any) => ({
            id: item.id,
            name: item.product_templates?.name || item.name || '-',
            quantity: Number(item.quantity || 0),
            price: Number(item.price || 0),
          }));

          setProducts(formatted);
        } catch (error) {
          console.log('Fetch show list error:', error);
          setProducts([]);
        }
      };

      fetchExpiredProducts();
    }, [targetLocationId, isBusiness, filterTypeParam, monthIndexParam])
  );

  const total = useMemo(
    () => products.reduce((sum, product) => sum + product.quantity * product.price, 0),
    [products]
  );

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={styles.productRow}>
      <Text style={styles.productNumber}>{index + 1}. </Text>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.quantity * item.price} บาท</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#F3E8FF', '#FBE9FF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3E8FF" />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.title}>วัตถุดิบที่หมดอายุ</Text>
            <Text style={styles.subtitle}>
              {filterTypeParam === 'year' ? '1 ปี' : `เดือน ${months[monthIndexParam]}`}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {/* Product List Card */}
        <View style={styles.card}>
          {!isBusiness && (
            <Text style={styles.emptyText}>หน้านี้แสดงเฉพาะ Business location</Text>
          )}
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>ไม่มีสินค้าที่หมดอายุ</Text>
            }
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
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 55,
    padding: 4,
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
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginBottom: 12,
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
