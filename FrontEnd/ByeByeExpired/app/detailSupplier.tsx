import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function DetailSupplierScreen() {
  const router = useRouter();

  // Mock data - ในอนาคตจะรับมาจาก route params
  const supplier = {
    id: '1',
    name: 'Makro Sriracha',
    phone: '02-xxx-xxxx',
    address: 'เลขที่ 1/1 หมู่ 10 ตำบลทุ่งสุขลา อำเภอศรีราชา จังหวัดชลบุรี 20230',
    email: 'makro@gmail.com',
    contact: 'คุณแม็คโคร',
    note: '-',
    logo: require('../assets/images/makro.jpg'),
  };

  return (
    <LinearGradient colors={['#F3E8FF', '#FBE9FF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3E8FF" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#7C3AED" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Supplier</Text>
          <TouchableOpacity onPress={() => router.push('/addSupplier')}>
            <MaterialIcons name="edit" size={28} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={supplier.logo}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* First Card - Main Info */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>ชื่อร้าน / บริษัท</Text>
              <Text style={styles.value}>{supplier.name}</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>เบอร์โทรศัพท์</Text>
              <Text style={styles.value}>{supplier.phone}</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>ที่อยู่</Text>
              <Text style={styles.value}>{supplier.address}</Text>
            </View>
          </View>

          {/* Second Card - Additional Info */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>อีเมล</Text>
              <Text style={styles.value}>{supplier.email}</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>ชื่อผู้ติดต่อ</Text>
              <Text style={styles.value}>{supplier.contact}</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>หมายเหตุ</Text>
              <Text style={styles.value}>{supplier.note}</Text>
            </View>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#7C3AED',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  infoRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#9F81C6',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E7DFF2',
    marginTop: 8,
    marginBottom: 16,
  },
});
