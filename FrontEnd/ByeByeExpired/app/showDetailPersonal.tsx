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
  Alert,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur'
import { useEffect, useState } from 'react';
import React from 'react'
import { Swipeable } from 'react-native-gesture-handler'
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router'
import { createProduct, getProductById } from '../src/api/product.api';
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'react-native'
import { supabase } from '../src/supabase'
import { getStoragesByLocation } from '../src/api/storage.api'
import { updateProduct, deleteProductQuantity } from '../src/api/product.api';
import * as ImageManipulator from 'expo-image-manipulator'
import { permissions } from '../src/utils/permissions'
import { useLocation } from "../src/context/LocationContext"

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

type Location = {
  id: string
  name: string
  type: "personal" | "business"
  role: "owner" | "admin" | "member"
}

export default function ShowDetailPersonal() {
  const router = useRouter();

  const {
    productId,
    locationId,
  } = useLocalSearchParams<{
    productId: string
    locationId: string
  }>()

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
  const { currentLocation } = useLocation()
  const role = currentLocation?.role
  const canManageProduct = role ? permissions.canManageProduct(role) : false

  // delete modal states
  const [showDeleteQtyModal, setShowDeleteQtyModal] = useState(false)
  const [deleteQty, setDeleteQty] = useState(1)

  // toast state
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastOpacity = React.useRef(new Animated.Value(0)).current

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setToastVisible(false))
      }, 2000)
    })
  }

  useEffect(() => {
    if (!productId) return

    const fetchProduct = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const data = await getProductById(productId as string)

        // use values stored on product first; fall back to template
        setName(data.name ?? data.product_templates?.name ?? '')
        setCategory(data.category ?? data.product_templates?.category ?? '')
        setImage(data.product_templates?.image_url ?? null)
        setQuantity(data.quantity?.toString() ?? '')
        setStorage(data.storage_id ?? '')

        setStorageDate(new Date(data.storage_date))
        setExpireDate(new Date(data.expiration_date))

        setNotifyEnabled(data.notify_enabled ?? false)
        setNotifyDays(data.notify_before_days?.toString() ?? '')
        console.log("FULL PRODUCT DATA:", data)

      } catch (err) {
        console.log("FETCH PRODUCT ERROR:", err)
      }
    }

    fetchProduct()
  }, [productId])

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

  const uploadImageToSupabase = async (uri: string, userId: string) => {
    try {
      // ⭐ แปลงภาพเป็น JPG ก่อน (ตัด transparency ทิ้ง)
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG, // 🔥 บังคับเป็น JPG
        }
      )

      const response = await fetch(manipulatedImage.uri)
      const arrayBuffer = await response.arrayBuffer()

      const fileName = `${userId}/${Date.now()}.jpg`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
        })

      if (error) throw error

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      return data.publicUrl
    } catch (err) {
      console.log(err)
      throw err
    }
  }
  const handleSave = async () => {
    if (!canManageProduct) {
      Alert.alert('Permission denied', 'You do not have permission to edit this product')
      return
    }
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

      const payload = {
        userId: user.id,
        name,
        category,
        storage,
        locationId: locationId ?? '',
        storageDate,
        expireDate,
        quantity: quantityNumber,
        imageUrl: image,
        notifyEnabled,
        notifyBeforeDays: notifyEnabled ? Number(notifyDays) : null,
      }
      if (!productId) {
        Alert.alert('Error', 'ไม่พบ productId')
        return
      }

      await updateProduct(productId as string, payload)
      Alert.alert('Success', 'แก้ไขสินค้าเรียบร้อย 🎉')
      router.replace('/overview')

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
          disabled={!canManageProduct}
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

        <Modal
          transparent
          visible={openDropdown === type}
          animationType="fade"
          statusBarTranslucent
        >
          <TouchableOpacity
            disabled={!canManageProduct}
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setOpenDropdown(null)}
          >
            <View style={styles.dropdownModal}>
              {options.map((item: Option) => {
                if (item.value === '__add_new__') {
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setOpenDropdown(null)
                        router.push({
                          pathname: '/addStorage',
                          params: { locationId },
                        })
                      }}
                    >
                      <Text style={styles.dropdownItemText}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )
                }

                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dropdownItem,
                      value === item.value && styles.dropdownItemActive
                    ]}
                    onPress={() => {
                      setOpenDropdown(null)
                      onSelect(item.value)
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
                )
              })}
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
              <Text style={[styles.headerBtn, { fontWeight: 'bold' }]}>Cancel</Text>
            </TouchableOpacity>

            {canManageProduct && (
              <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
                <Text style={[styles.headerBtn, { fontWeight: 'bold' }]}>
                  Save
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.headerTitle}>
            {canManageProduct ? 'Edit Product' : 'View Product'}
          </Text>
        </View>

        {canManageProduct ? (
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
        ) : (
          <View style={styles.imageBox}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: 120, height: 120, borderRadius: 8 }}
              />
            ) : (
              <Text style={{ color: '#999' }}>No Image</Text>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            editable={canManageProduct}
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

          {canManageProduct ? (
            <TouchableOpacity
              style={styles.inputIcon}
              onPress={() => {
                setTempDate(storageDate)
                setShowStorage(true)
              }}
            >
              <Text>{storageDate.toDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="#888" />
            </TouchableOpacity>
          ) : (
            <View style={styles.inputIcon}>
              <Text>{storageDate.toDateString()}</Text>
            </View>
          )}

          <Text style={styles.label}>Expiration Date</Text>

          {canManageProduct ? (
            <TouchableOpacity
              style={styles.inputIcon}
              onPress={() => {
                setTempDate(expireDate)
                setShowExpire(true)
              }}
            >
              <Text>{expireDate.toDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="#888" />
            </TouchableOpacity>
          ) : (
            <View style={styles.inputIcon}>
              <Text>{expireDate.toDateString()}</Text>
            </View>
          )}

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            editable={canManageProduct}
          />


          {canManageProduct && (
            <View style={styles.switchRow}>
              <Text>Days before expiration</Text>
              <Switch
                value={notifyEnabled}
                onValueChange={(value) => {
                  setNotifyEnabled(value)
                  if (!value) setNotifyDays('')
                }}
              />
            </View>
          )}

          {notifyEnabled && (
            canManageProduct ? (
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={notifyDays}
                onChangeText={setNotifyDays}
                placeholder="Enter days before expiration"
              />
            ) : (
              <>
                <Text style={styles.label}>Days before expiration</Text>
                <View style={styles.readOnlyInfo}>
                  <Text style={styles.readOnlyValue}>{notifyDays || '-'}</Text>
                </View>
              </>
            )
          )}
        </View>
        {canManageProduct && (
          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.85}
            onPress={() => {
              setDeleteQty(1)
              setShowDeleteQtyModal(true)
            }}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}

        {/* delete quantity modal */}
        <Modal visible={showDeleteQtyModal} transparent animationType="slide">
          <BlurView intensity={40} tint="dark" style={styles.bottomOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.handle} />
              <Text style={styles.modalTitle}>ลบสินค้าออกจากสต๊อก</Text>
              <View style={styles.sectionDivider} />

              <View style={styles.productRow}>
                <Image
                  source={{ uri: image || 'https://via.placeholder.com/100' }}
                  style={styles.modalImage}
                />
                <View style={{ marginLeft: 50 }}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.detail}>{quantity} piece</Text>
                  <Text style={styles.exp}>
                    EXP : {expireDate.toLocaleDateString('en-GB')}
                  </Text>
                </View>
              </View>

              <View style={styles.sectionDivider} />
              <Text style={{ textAlign: 'center', marginTop: 10 }}>จำนวนที่ต้องการลบ</Text>

              {/* counter + all button */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setDeleteQty(Number(quantity) || 0)}>
                  <Text style={{ color: '#007aff', marginRight: 20 }}>All</Text>
                </TouchableOpacity>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setDeleteQty((q) => (q > 1 ? q - 1 : 1))}
                  >
                    <Text style={styles.counterText}>-</Text>
                  </TouchableOpacity>
                  <View style={styles.divider} />
                  <View style={styles.qtyBox}>
                    <Text style={styles.qty}>{deleteQty}</Text>
                  </View>
                  <View style={styles.divider} />
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => {
                      const max = Number(quantity) || 0
                      setDeleteQty((q) => (q < max ? q + 1 : q))
                    }}
                  >
                    <Text style={styles.counterText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rowBtn}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowDeleteQtyModal(false)}
                >
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={async () => {
                    if (!productId) return
                    const num = deleteQty
                    const curQty = Number(quantity) || 0
                    if (!num || num <= 0) {
                      Alert.alert('Error', 'จำนวนไม่ถูกต้อง')
                      return
                    }
                    if (num > curQty) {
                      showToast('ไม่สามารถลบเกินจำนวนที่มีอยู่')
                      return
                    }
                    try {
                      // use shared API helper
                      await deleteProductQuantity(productId as string, num)

                      const curQty = Number(quantity) || 0
                      if (num >= curQty) {
                        Alert.alert('Deleted', 'ลบสินค้าเรียบร้อย')
                        router.replace('/overview')
                      } else {
                        setQuantity((curQty - num).toString())
                        Alert.alert('Deleted', 'ลบสินค้าเรียบร้อย')
                        router.replace('/overview')
                      }
                    } catch (err: any) {
                      Alert.alert('Error', err.message || 'Delete failed')
                    } finally {
                      setShowDeleteQtyModal(false)
                    }
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>ยืนยัน</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Modal>
      </ScrollView>

      {/* bottom toast */}
      {toastVisible && (
        <Animated.View
          style={[styles.toast, { opacity: toastOpacity }]}
        >
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      )}

      {canManageProduct && (
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
      )}
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

  readOnlyInfo: {
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 6,
  },

  readOnlyValue: {
    color: '#1f1f1f',
    fontSize: 15,
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
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(34,34,34,0.35)',
    justifyContent: 'flex-end',
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
  modalBox: {
    width: '100%',
    // mimic deleteProduct modal style
    height: 'auto',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
    marginTop: 15,
    marginBottom: 25,
    lineHeight: 26,
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
  modalImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5eaff',
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#FF4D4F',
    marginHorizontal: 40,
    marginBottom: 40,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  exp: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e6e7f0ff',
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'center',
    marginVertical: 15,
  },
  qty: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  counterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6ff',
  },
  counterText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#080808ff',
  },
  qtyBox: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#c5ccff',
    height: '100%',
  },
  rowBtn: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 35,
    width: '100%',
  },
  cancelBtn: {
    backgroundColor: '#ddd',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 15,
    marginHorizontal: 10,
  },
  toast: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
  },
  confirmBtn: {
    backgroundColor: '#9aa8ff',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 15,
    marginHorizontal: 10,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 15,
  },
  sectionDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#e6e7f0",
    marginVertical: 15,
  },
});
