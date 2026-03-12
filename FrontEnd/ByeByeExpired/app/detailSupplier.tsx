import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { deleteSupplier, getSupplierById, updateSupplier } from '../src/api/supplier.api';
import { useLocation } from '../src/context/LocationContext';

export default function DetailSupplierScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentLocation } = useLocation();
  const locationId = (params.locationId as string) || currentLocation?.id;
  
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    phone: '',
    address: '',
    email: '',
    contact_name: '',
    note: '',
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        if (!params.id) {
          Alert.alert('Error', 'Supplier ID not found');
          router.back();
          return;
        }

        setLoading(true);
        const data = await getSupplierById(
          params.id as string,
          locationId
        );
        setSupplier(data);
        setForm({
          company_name: data?.company_name || '',
          phone: data?.phone || '',
          address: data?.address || '',
          email: data?.email || '',
          contact_name: data?.contact_name || '',
          note: data?.note || '',
        });
      } catch (error: any) {
        console.error('Error fetching supplier:', error);
        Alert.alert('Error', error.message || 'Failed to load supplier details');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [params.id, locationId]);

  const handleSave = async () => {
    try {
      if (!supplier?.id) return;
      if (!form.company_name.trim()) {
        Alert.alert('Error', 'กรุณากรอกชื่อร้าน / บริษัท');
        return;
      }

      setSaving(true);
      const updated = await updateSupplier(
        supplier.id,
        {
          company_name: form.company_name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          email: form.email.trim(),
          contact_name: form.contact_name.trim(),
          note: form.note.trim(),
        },
        locationId
      );

      setSupplier(updated);
      setIsEditing(false);
      Alert.alert('สำเร็จ', 'บันทึกข้อมูล Supplier แล้ว');
      router.replace('/supplier');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Update supplier failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!supplier?.id) return;

    Alert.alert(
      'ลบ Supplier',
      `ยืนยันการลบ ${supplier.company_name || 'supplier'} ?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSupplier(supplier.id, locationId);
              Alert.alert('สำเร็จ', 'ลบ Supplier แล้ว');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Delete supplier failed');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F3E8FF', '#FBE9FF']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={{ marginTop: 10, color: '#7C3AED' }}>Loading...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!supplier) {
    return (
      <LinearGradient colors={['#F3E8FF', '#FBE9FF']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="#7C3AED" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Supplier</Text>
            <View style={{ width: 28 }} />
          </View>
          <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#7C3AED', fontSize: 16 }}>Supplier not found</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Ionicons
                name="checkmark"
                size={28}
                color={saving ? '#A78BFA' : '#7C3AED'}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <MaterialIcons name="edit" size={28} color="#7C3AED" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              {supplier.image_url ? (
                <Image
                  source={{ uri: supplier.image_url }}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="business" size={80} color="#C4B5FD" />
              )}
            </View>
          </View>

          {/* First Card - Main Info */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>ชื่อร้าน / บริษัท</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={form.company_name}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, company_name: text }))}
                />
              ) : (
                <Text style={styles.value}>{supplier.company_name || '-'}</Text>
              )}
              <View style={styles.divider} />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>เบอร์โทรศัพท์</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.value}>{supplier.phone || '-'}</Text>
              )}
              <View style={styles.divider} />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>ที่อยู่</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={form.address}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, address: text }))}
                  multiline
                />
              ) : (
                <Text style={styles.value}>{supplier.address || '-'}</Text>
              )}
            </View>
          </View>

          {/* Second Card - Additional Info */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>อีเมล</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={form.email}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.value}>{supplier.email || '-'}</Text>
              )}
              <View style={styles.divider} />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>ชื่อผู้ติดต่อ</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={form.contact_name}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, contact_name: text }))}
                />
              ) : (
                <Text style={styles.value}>{supplier.contact_name || '-'}</Text>
              )}
              <View style={styles.divider} />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>หมายเหตุ</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={form.note}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, note: text }))}
                  multiline
                />
              ) : (
                <Text style={styles.value}>{supplier.note || '-'}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={saving}
          >
            <Text style={styles.deleteButtonText}>Delete Supplier</Text>
          </TouchableOpacity>
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
    paddingBottom: 150,
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
  input: {
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#7C3AED',
    backgroundColor: '#FAF5FF',
    marginBottom: 8,
  },
  multilineInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: '#E7DFF2',
    marginTop: 8,
    marginBottom: 16,
  },
  deleteButton: {
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  deleteButtonText: {
    color: '#B91C1C',
    fontSize: 16,
    fontWeight: '700',
  },
});
