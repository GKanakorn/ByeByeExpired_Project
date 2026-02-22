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
import { useState } from 'react';
import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';

interface Option {
  label: string;
  value: string;
}

export default function PersonalDetailScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [storage, setStorage] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expireAlert, setExpireAlert] = useState(false);
  const [expireDays, setExpireDays] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [storageDate, setStorageDate] = useState(new Date());
  const [expireDate, setExpireDate] = useState(new Date());
  const [showStorage, setShowStorage] = useState(false);
  const [showExpire, setShowExpire] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const categoryOptions: Option[] = [
    { label: 'Vegetables & Fruits', value: 'veg' },
    { label: 'Meat & Poultry', value: 'meat' },
    { label: 'Eggs & Dairy', value: 'egg' },
    { label: 'Processed Foods', value: 'processed' },
    { label: 'Beverages', value: 'drink' }
  ];

  const storageOptions: Option[] = [
    { label: 'Freezer', value: 'freezer' },
    { label: 'Fridge', value: 'fridge' },
    { label: 'Dry Food', value: 'dry' }
  ];

  const Dropdown = ({
    label,
    value,
    options,
    onSelect,
    type
  }: {
    label: string;
    value: string;
    options: Option[];
    onSelect: (value: string) => void;
    type: string;
  }) => {
    const selectedLabel =
      options.find((o) => o.value === value)?.label || label;

    return (
      <>
        <TouchableOpacity
          style={[
            styles.inputIcon,
            openDropdown === type && styles.dropdownActive
          ]}
          onPress={() =>
            setOpenDropdown(openDropdown === type ? null : type)
          }
        >
          <Text style={{ color: value ? '#333' : '#999' }}>
            {selectedLabel}
          </Text>
          <Ionicons name="chevron-down" size={20} />
        </TouchableOpacity>

        <Modal transparent visible={openDropdown === type} animationType="fade">
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setOpenDropdown(null)}
          >
            <View style={styles.dropdownModal}>
              {options.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.dropdownItem,
                    value === item.value && styles.dropdownItemActive
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setOpenDropdown(null);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      value === item.value && styles.dropdownItemTextActive
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

  const handleSave = () => {
    Alert.alert('Saved', 'บันทึกข้อมูลเรียบร้อย (Demo)');
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Deleted', 'ลบสินค้าเรียบร้อย (Demo)');
            router.back();
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#e8d7ff', '#cfe9f9']} style={styles.bg}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.headerBtn, { fontWeight: 'bold' }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.headerBtn, { fontWeight: 'bold' }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Detail Of Product</Text>

          <View style={styles.imageBox}>
            {image && (
              <Image source={{ uri: image }} style={styles.image} />
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Category</Text>
          <Dropdown
            label="Select Category"
            value={category}
            options={categoryOptions}
            onSelect={setCategory}
            type="category"
          />

          <Text style={styles.label}>Storage</Text>
          <Dropdown
            label="Select Storage"
            value={storage}
            options={storageOptions}
            onSelect={setStorage}
            type="storage"
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
            <Ionicons name="calendar-outline" size={20} />
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
            <Ionicons name="calendar-outline" size={20} />
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
            <Switch value={expireAlert} onValueChange={setExpireAlert} />
          </View>

          {expireAlert && (
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={expireDays}
              onChangeText={setExpireDays}
              placeholder="Enter days before expiration"
            />
          )}
      </View>
      {/* 🔴 DELETE BUTTON */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={handleDelete}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={showStorage || showExpire}>
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => {
            setShowStorage(false);
            setShowExpire(false);
          }}
        >
          <View style={styles.calendarBox}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              onChange={(e, d) => d && setTempDate(d)}
            />
            <TouchableOpacity
              onPress={() => {
                if (showStorage) setStorageDate(tempDate);
                if (showExpire) setExpireDate(tempDate);
                setShowStorage(false);
                setShowExpire(false);
              }}
            >
              <Text style={{ textAlign: 'right', marginTop: 10 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  header: {
    paddingTop: 60,
    paddingHorizontal: 24
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  headerBtn: {
    fontSize: 16,
    color: '#444'
  },

  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#5B5FC7'
  },

  imageBox: {
    marginTop: 20,
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 20,
    margin: 20,
    elevation: 5
  },

  label: {
    marginTop: 10,
    marginBottom: 5
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
    marginTop: 15
  },

  deleteBtn: {
    backgroundColor: '#FF4D4F',
    marginHorizontal: 40,
    marginBottom: 40,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center'
  },

  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  calendarBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    width: '90%'
  },

  dropdownActive: {
    borderWidth: 2,
    borderColor: '#A7C7FF'
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
    color: '#5B5FC7'
  },

});