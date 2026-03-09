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
  Animated,
  KeyboardAvoidingView
} from 'react-native';
import { BlurView } from 'expo-blur'
import { useEffect, useState } from 'react';
import React from 'react'
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'react-native'
import { getStoragesByLocation } from '../src/api/storage.api'
import { supabase } from '../src/supabase'
import { getSuppliersByLocation, getSupplierById } from '@/src/api/supplier.api';
import { updateProduct, deleteProductQuantity } from '../src/api/product.api';
import { getProductById } from '../src/api/product.api'
import { permissions } from '../src/utils/permissions'
import { useLocation } from '../src/context/LocationContext'

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

export default function showDetailBusiness() {
  const router = useRouter();
  const { currentLocation } = useLocation()
  const role = currentLocation?.role
  const canManageProduct = role ? permissions.canManageProduct(role) : false

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

  // delete modal states
  const [showDeleteQtyModal, setShowDeleteQtyModal] = useState(false)
  const [deleteQty, setDeleteQty] = useState(1)

  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastOpacity = React.useRef(new Animated.Value(0)).current
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

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
  const handleDelete = async () => {
    if (!productId) return

    try {
      await deleteProductQuantity(productId as string, deleteQty)

      const newQty = (Number(quantity) || 0) - deleteQty

      setShowConfirmDelete(false)

      if (newQty <= 0) {
        router.back()
        return
      }

      setQuantity(newQty.toString())

      showToast('Product deleted successfully')

    } catch (err) {
      Alert.alert('Error', 'Delete failed')
    }
  }

  const [store, setStore] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [expireAlert, setExpireAlert] = useState(false)
  const [price, setPrice] = useState<string>('')
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('')
  const [supplierOptions, setSupplierOptions] = useState<Option[]>([])
  const [supplier, setSupplier] = useState<string | null>(null)
  const [supplierName, setSupplierName] = useState('')

  const supplierDisplayName =
    supplierOptions.find((s) => s.value === supplier)?.label ||
    supplierName ||
    '-'

  const handleSave = async () => {
    if (!canManageProduct) {
      Alert.alert('Permission denied', 'You do not have permission to edit this product')
      return
    }
    try {
      setUploading(true)

      const quantityNumber = Number(quantity)
      const priceNumber = Number(price)

      if (!quantityNumber || quantityNumber <= 0) {
        Alert.alert('Error', 'Quantity must be greater than 0')
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
        price: priceNumber || null,
        lowStockEnabled: lowStock,
        notifyEnabled,
        lowStockThreshold: lowStock ? Number(lowStockThreshold) : null,
        notifyBeforeDays: notifyEnabled ? Number(notifyDays) : null,
        supplierId: supplier,
      }

      if (!productId) {
        Alert.alert('Error', 'Product ID not found')
        return
      }

      await updateProduct(productId as string, payload)
      Alert.alert('Success', 'Product updated successfully 🎉')
      router.back()
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Save failed')
    } finally {
      setUploading(false)
    }
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

        // prefer product-specific fields, template only as fallback
        setName(data.name ?? data.product_templates?.name ?? '')
        setCategory(data.category ?? data.product_templates?.category ?? '')
        setImage(data.product_templates?.image_url ?? null)
        setQuantity(data.quantity?.toString() ?? '')
        setStorage(data.storage_id ?? '')

        setStorageDate(new Date(data.storage_date))
        setExpireDate(new Date(data.expiration_date))

        setNotifyEnabled(data.notify_enabled ?? false)
        setNotifyDays(data.notify_before_days?.toString() ?? '')
        setPrice(data.price?.toString() ?? '')
        setSupplier(data.supplier_id ?? '')
        setSupplierName(
          data?.suppliers?.company_name ??
          data?.supplier?.company_name ??
          ''
        )
        setLowStock(data.low_stock_enabled ?? false)
        setLowStockThreshold(data.low_stock_threshold?.toString() ?? '')
        console.log("FULL PRODUCT DATA:", data)

      } catch (err) {
        console.log("FETCH PRODUCT ERROR:", err)
      }
    }

    fetchProduct()
  }, [productId])

  useEffect(() => {
    if (!canManageProduct || !supplier || supplierName) return

    const fetchSupplierName = async () => {
      try {
        if (!locationId) return
        const supplierData = await getSupplierById(supplier, locationId as string)
        const name =
          supplierData?.company_name ||
          supplierData?.data?.company_name ||
          ''
        if (name) setSupplierName(name)
      } catch (err) {
        console.log('Fetch supplier by id error:', err)
      }
    }

    fetchSupplierName()
  }, [supplier, supplierName, canManageProduct])
  
  useFocusEffect(
    React.useCallback(() => {
      const fetchSuppliers = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (!session) return

          if (!locationId) return

          const suppliers = await getSuppliersByLocation(
            session.access_token,
            locationId as string
          )

          const formatted: Option[] = [
            ...suppliers.map((s: any) => ({
              label: s.company_name,
              value: s.id,
            })),
            {
              label: '+ Add Supplier',
              value: '__add_new__',
            },
          ]

          setSupplierOptions(formatted)
        } catch (err) {
          console.log('Fetch suppliers error:', err)
        }
      }

      fetchSuppliers()
    }, [locationId])
  )

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
    router.back()
  }
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo access permission required')
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

        <Modal transparent visible={openDropdown === type} animationType="fade">
          <TouchableOpacity
            disabled={!canManageProduct}
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

                      if (type === 'storage') {
                        router.push({
                          pathname: '/addStorage',
                          params: { locationId: locationId ?? '' },
                        });
                        return;
                      }

                      if (type === 'supplier') {
                        router.push({
                          pathname: '/addSupplier',
                          params: { locationId: locationId ?? '' },
                        });
                        return;
                      }
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
    <View style={styles.bg}>
      <LinearGradient colors={['#cbd1faff', '#eef4f8ff', '#cfe9f9ff']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          style={{ flex: 1 }}
        >
          <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 0 }}
        >
          <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
              <Text style={[styles.headerBtn, { fontWeight: 'bold' }]}>Cancel</Text>
            </TouchableOpacity>

            {canManageProduct && (
              <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
                <Text style={[styles.headerBtn, { fontWeight: 'bold' }]}>Save</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.headerTitle}>
            {canManageProduct ? 'Edit Product' : 'View Product'}
          </Text>

          {canManageProduct ? (
            <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{ width: 120, height: 120, borderRadius: 8 }}
                />
              ) : (
                <Text style={{ color: '#999' }}>Tap to select image</Text>
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
        </View>

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
                setTempDate(storageDate);
                setShowStorage(true);
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
                setTempDate(expireDate);
                setShowExpire(true);
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

          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            editable={canManageProduct}
          />

          <Text style={styles.label}>Supplier</Text>
          {canManageProduct ? (
            <Dropdown
              label="Select Supplier"
              value={supplier ?? ''}
              type="supplier"
              onSelect={(value) => setSupplier(value)}
              options={supplierOptions}
            />
          ) : (
            <View style={styles.readOnlyInfo}>
              <Text style={styles.readOnlyValue}>{supplierDisplayName}</Text>
            </View>
          )}

          {canManageProduct && (
            <View style={styles.switchRow}>
              <Text>Days before expiration</Text>
              <Switch
                value={notifyEnabled}
                onValueChange={(value) => {
                  setNotifyEnabled(value)
                  if (!value) {
                    setNotifyDays('')
                  }
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

          {canManageProduct && (
            <View style={styles.switchRow}>
              <Text>Low Stock Alert</Text>
              <Switch
                value={lowStock}
                onValueChange={(value) => {
                  setLowStock(value)
                  if (!value) setLowStockThreshold('')
                }}
              />
            </View>
          )}

          {lowStock && (
            canManageProduct ? (
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={lowStockThreshold}
                onChangeText={setLowStockThreshold}
                placeholder="Enter low stock threshold"
              />
            ) : (
              <>
                <Text style={styles.label}>Low Stock Alert</Text>
                <View style={styles.readOnlyInfo}>
                  <Text style={styles.readOnlyValue}>{lowStockThreshold || '-'}</Text>
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

        {toastVisible && (
          <Animated.View style={[styles.toast, { opacity: toastOpacity }]}> 
            <Text style={styles.toastText}>{toastMsg}</Text>
          </Animated.View>
        )}

        <Modal visible={showDeleteQtyModal} transparent animationType="slide">
          <BlurView intensity={40} tint="dark" style={styles.bottomOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.handle} />
              <Text style={styles.modalTitle}>Remove Product from Stock</Text>
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
              <Text style={{ textAlign: 'center', marginTop: 10 }}>Quantity to delete</Text>

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
    <Text style={{ fontSize: 16, fontWeight: '500' }}>Cancel</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.confirmBtn}
    onPress={() => {
      setShowDeleteQtyModal(false)
      setShowConfirmDelete(true)
    }}
  >
    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>
      Confirm
    </Text>
  </TouchableOpacity>
  </View>

</View>
</BlurView>
</Modal>
<Modal
  visible={showConfirmDelete}
  transparent
  animationType="fade"
>
  <View style={styles.confirmOverlay}>
    <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFillObject} />

    <View style={styles.confirmBox}>
      <Ionicons name="warning" size={55} color="#F4B400" />

      <Text style={styles.confirmTitle}>
        Confirm Product Deletion
      </Text>

      <Text style={styles.confirmText}>
        Do you want to delete {deleteQty} piece(s) of {name}?
      </Text>

      <View style={styles.confirmButtons}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setShowConfirmDelete(false)}
        >
          <Text>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleDelete}
        >
          <Text style={{ color: "#fff" }}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>

  </View>
</Modal>
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
        </ScrollView>
      </KeyboardAvoidingView>
      </LinearGradient>
    </View>
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
    shadowColor: '#000',
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
  modalImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5eaff',
    marginRight: 5,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    top: '50%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    transform: [{ translateY: -25 }],
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
  confirmOverlay: {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  justifyContent: 'center',
  alignItems: 'center',
},

confirmBox: {
  width: '80%',
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 25,
  alignItems: 'center',
},

confirmTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginTop: 10,
},

confirmText: {
  textAlign: 'center',
  marginVertical: 15,
},

confirmButtons: {
  flexDirection: 'row',
  marginTop: 10,
},
});