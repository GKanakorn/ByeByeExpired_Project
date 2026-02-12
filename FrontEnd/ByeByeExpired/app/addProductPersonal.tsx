import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { useEffect, useState } from 'react';
import React from 'react'
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router'
import { createProduct } from '../src/api/product.api';
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'react-native'
import { supabase } from '../src/supabase'
import { getStoragesByLocation } from '../src/api/storage.api'

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
  type: string;
}

export default function AddProductScreen() {
  const router = useRouter();

  const {
    barcode,
    template,
    locationId,
  } = useLocalSearchParams<{
    barcode: string
    template: string
    locationId: string
  }>()

  const product = template
    ? JSON.parse(template as string)
    : null

  const [name, setName] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState('');
  const [storage, setStorage] = useState('');
  const [storageOptions, setStorageOptions] = useState<Option[]>([])

  const [storageDate, setStorageDate] = useState(new Date());
  const [expireDate, setExpireDate] = useState(new Date());

  const [tempDate, setTempDate] = useState(new Date());

  const [showStorage, setShowStorage] = useState(false);
  const [showExpire, setShowExpire] = useState(false);
  const [quantity, setQuantity] = useState<string>('')
  const [notifyEnabled, setNotifyEnabled] = useState(false)
  const [notifyDays, setNotifyDays] = useState('')

  useEffect(() => {
    if (product) {
      setName(product.name ?? '')
      setCategory(product.category ?? '')
      setImage(product.image_url ?? null)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      const fetchStorages = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (!session || !locationId) return

          const storages = await getStoragesByLocation(
            session.access_token,
            locationId as string
          )

          const formatted: Option[] = [
            ...storages.map((s: any) => ({
              label: s.name,
              value: s.id,
            })),
            {
              label: '+ Add New Storage',
              value: '__add_new__',
            },
          ]

          setStorageOptions(formatted)
        } catch (err) {
          console.log('Fetch storages error:', err)
        }
      }

      fetchStorages()
    }, [locationId])
  )
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const handleCancel = () => {
    router.replace('/overview')
  }
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission required', 'ต้องอนุญาตเข้าถึงรูป')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const handleSave = async () => {
    try {
      setUploading(true)

      const quantityNumber = Number(quantity)

      if (!quantityNumber || quantityNumber <= 0) {
        Alert.alert('Error', 'Quantity ต้องมากกว่า 0')
        setUploading(false)
        return
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        Alert.alert('Error', 'User not logged in')
        return
      }

      await createProduct({
        userId: user.id,           // ⭐ ตรงกับ type
        barcode: barcode || '',
        templateId: null,          // ⭐ แก้ parsedTemplate
        name,
        category,
        storage,
        locationId,
        storageDate,
        expireDate,
        notifyEnabled,
        notifyBeforeDays: notifyEnabled ? Number(notifyDays) : null,
        quantity: quantityNumber,
        imageUrl: image,
      })

      Alert.alert('Success', 'บันทึกสินค้าเรียบร้อย 🎉')
      router.replace('/overview')
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Save failed')
    } finally {
      setUploading(false)
    }
  }

  const Dropdown = ({ label, value, options, onSelect, type }: DropdownProps) => {
    const selectedLabel =
      options.find((o: Option) => o.value === value)?.label || label;

    return (
      <>
        <TouchableOpacity
          style={[
            styles.customDropdown,
            openDropdown === type && styles.dropdownActive
          ]}
          onPress={() =>
            setOpenDropdown(openDropdown === type ? null : type)
          }
        >
          <Text
            style={[
              styles.dropdownText,
              value && styles.dropdownTextActive
            ]}
          >
            {selectedLabel}
          </Text>

          <Ionicons
            name="chevron-down"
            size={20}
            color="#666"
            style={{
              transform: [
                { rotate: openDropdown === type ? '180deg' : '0deg' }
              ]
            }}
          />
        </TouchableOpacity>

        <Modal transparent visible={openDropdown === type} animationType="fade">
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setOpenDropdown(null)}
          >
            <View style={styles.dropdownModal}>
              {options.map((item: Option) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.dropdownItem,
                    value === item.value && styles.dropdownItemActive
                  ]}
                  onPress={() => {
                    setOpenDropdown(null);

                    if (item.value === '__add_new__') {
                      router.push({
                        pathname: '/addStorage',
                        params: { locationId },
                      });
                      return;
                    }

                    onSelect(item.value);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      value === item.value &&
                      styles.dropdownItemTextActive
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  };

  return (
    <LinearGradient colors={['#cbd1faff', '#eef4f8ff', '#cfe9f9ff']} style={styles.bg}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
              <Text style={styles.headerBtn}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
              <Text style={[styles.headerBtn, { fontWeight: 'bold' }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>New Product</Text>

          <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: 120, height: 120, borderRadius: 8 }}
              />
            ) : (
              <Text style={{ color: '#999' }}>แตะเพื่อเลือกรูป</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Category</Text>
          <Dropdown
            label="Select Category"
            value={category}
            type="category"
            onSelect={setCategory}
            options={[
              { label: 'Vegetables & Fruits', value: 'veg' },
              { label: 'Meat & Poultry', value: 'meat' },
              { label: 'Eggs & Dairy', value: 'egg' },
              { label: 'Processed Foods', value: 'processed' },
              { label: 'Beverages', value: 'drink' }
            ]}
          />

          <Text style={styles.label}>Storage</Text>
          <Dropdown
            label="Select Storage"
            value={storage}
            type="storage"
            onSelect={setStorage}
            options={storageOptions}
          />

          <Text style={styles.label}>Storage Date</Text>
          <TouchableOpacity
            style={styles.inputIcon}
            onPress={() => {
              setTempDate(storageDate);
              setShowStorage(true);
            }}
          >
            <Text>{storageDate.toDateString()}</Text>
            <Ionicons name="calendar-outline" size={20} color="#888" />
          </TouchableOpacity>

          <Text style={styles.label}>Expiration Date</Text>
          <TouchableOpacity
            style={styles.inputIcon}
            onPress={() => {
              setTempDate(expireDate);
              setShowExpire(true);
            }}
          >
            <Text>{expireDate.toDateString()}</Text>
            <Ionicons name="calendar-outline" size={20} color="#888" />
          </TouchableOpacity>

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <View style={styles.switchRow}>
            <Text>Days before expiration</Text>
            <Switch
              value={notifyEnabled}
              onValueChange={(value) => {
                setNotifyEnabled(value)
                if (!value) {
                  setNotifyDays('')   // 🔥 เคลียร์ค่าทันทีเมื่อปิด switch
                }
              }}
            />
          </View>

          {notifyEnabled && (
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={notifyDays}
              onChangeText={setNotifyDays}
              placeholder="Enter days before expiration"
            />
          )}
        </View>
      </ScrollView>

      <Modal transparent animationType="fade" visible={showStorage || showExpire}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => {
            setShowStorage(false);
            setShowExpire(false);
          }}
        >
          <TouchableOpacity activeOpacity={1} style={styles.calendarBox}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              accentColor="#5B5FC7"
              themeVariant="light"
              onChange={(e: any, d?: Date) => {
                if (d) setTempDate(d);
              }}
            />

            <View style={styles.calendarActions}>
              <TouchableOpacity
                onPress={() => {
                  setShowStorage(false);
                  setShowExpire(false);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (showStorage) setStorageDate(tempDate);
                  if (showExpire) setExpireDate(tempDate);
                  setShowStorage(false);
                  setShowExpire(false);
                }}
              >
                <Text style={styles.okText}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerTitle: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5B5FC7',
    textAlign: 'center'
  },
  headerBtn: {
    fontSize: 16,
    color: '#333'
  },
  imageBox: {
    marginTop: 16,
    alignSelf: 'center',
    width: 110,
    height: 110,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4
  },
  imageText: {
    marginTop: 6,
    fontSize: 12,
    color: '#999'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  label: {
    marginTop: 12,
    marginBottom: 5,
    color: '#555'
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 12
  },
  inputIcon: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(34,34,34,0.35)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  customDropdown: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dropdownActive: {
    borderWidth: 2,
    borderColor: '#A7C7FF'
  },
  dropdownText: {
    color: '#999'
  },
  dropdownTextActive: {
    color: '#565555ff',
    fontWeight: '500'
  },
  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    width: '85%'
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10
  },
  dropdownItemActive: {
    backgroundColor: '#E8F6FF'
  },
  dropdownItemText: {
    color: '#333'
  },
  dropdownItemTextActive: {
    fontWeight: 'bold',
    color: '#91a7f0ff'
  },
  calendarBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    width: '90%'
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10
  },
  cancelText: {
    marginRight: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4d70e2ff'
  },
  okText: {
    fontSize: 16,
    marginRight: 20,
    fontWeight: 'bold',
    color: '#5e42fbff'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});
