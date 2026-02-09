import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Platform
} from 'react-native';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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
 
  const [category, setCategory] = useState('');
  const [storage, setStorage] = useState('');
  const [store, setStore] = useState('');
 
  const [storageDate, setStorageDate] = useState(new Date());
  const [expireDate, setExpireDate] = useState(new Date());
 
  const [tempDate, setTempDate] = useState(new Date());
 
  const [showStorage, setShowStorage] = useState(false);
  const [showExpire, setShowExpire] = useState(false);
 
  const [expireAlert, setExpireAlert] = useState(true);
  const [lowStock, setLowStock] = useState(true);
 
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
 
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
                    onSelect(item.value);
                    setOpenDropdown(null);
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
            <Text style={styles.headerBtn} onPress={() => router.back()}>
              Cancel
            </Text>
            <Text style={styles.headerBtn}>Save</Text>
          </View>
 
          <Text style={styles.headerTitle}>New Product</Text>
 
          <TouchableOpacity style={styles.imageBox}>
            <Ionicons name="image-outline" size={32} color="#999" />
            <Text style={styles.imageText}>Add Image</Text>
          </TouchableOpacity>
        </View>
 
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} />
 
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
            options={[
              { label: 'Fridge', value: 'fridge' },
              { label: 'Freezer', value: 'freezer' },
              { label: 'Dry Food', value: 'dry' }
            ]}
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
          <TextInput style={styles.input} keyboardType="numeric" />
 
          <View style={styles.switchRow}>
            <Text>Days before expiration</Text>
            <Switch value={expireAlert} onValueChange={setExpireAlert} />
          </View>
          <TextInput style={styles.input} keyboardType="numeric" />
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
    backgroundColor: '#b489f5ff',
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
  }
});