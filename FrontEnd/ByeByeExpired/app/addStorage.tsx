import React, { useEffect, useState } from 'react';
import { useLocation } from '../src/context/LocationContext'
import { supabase } from '../src/supabase';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  ImageSourcePropType,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { createStorage } from '../src/api/storage.api'
import { getStorageDetail, updateStorage } from '../src/api/storage.api'

const { width } = Dimensions.get('window');


// Storage icons data with images
const STORAGE_ICONS: { id: string; name: string; icon: ImageSourcePropType }[] = [
  { id: 'freezer1', name: 'Freezer1', icon: require('../assets/images/snow1.png') },
  { id: 'freezer2', name: 'Freezer2', icon: require('../assets/images/snow2.webp') },
  { id: 'shelf', name: 'Shelf', icon: require('../assets/images/shel2.png') },
  { id: 'fridge1', name: 'Fridge1', icon: require('../assets/images/fridge1.png') },
  { id: 'can', name: 'Can', icon: require('../assets/images/can1.png') },
  { id: 'freezer', name: 'Freezer', icon: require('../assets/images/Freezer.png') },
  { id: 'cabinet', name: 'Cabinet', icon: require('../assets/images/can.png') },
  { id: 'fridge', name: 'Fridge', icon: require('../assets/images/fridge.png') },
  { id: 'cooler', name: 'Cooler', icon: require('../assets/images/ICEEE1.png') },
  { id: 'pantry', name: 'Pantry', icon: require('../assets/images/shelf.png') },
];

// Color options
const COLORS = [
  '#2C3E50', '#E74C3C', '#9B59B6', '#3498DB',
  '#27AE60', '#F1C40F', '#E67E22', '#FFB6C1', '#FFEBCD'
];

export default function AddStorageScreen() {
  const router = useRouter();
  const [storageName, setStorageName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('fridge');
  const [selectedColor, setSelectedColor] = useState('#FFEBCD');
  const { currentLocation } = useLocation()
  const { storageId } = useLocalSearchParams();

  useEffect(() => {
    if (storageId) {
      fetchStorageDetail();
    }
  }, [storageId]);

  const fetchStorageDetail = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token = session?.access_token

      const data = await getStorageDetail(token!, storageId as string)

      setStorageName(data.name)
      setSelectedIcon(data.icon)
      setSelectedColor(data.color)
    } catch (err) {
      console.log("FETCH STORAGE DETAIL ERROR:", err)
    }
  }

  const handleSave = async () => {
    if (!storageName.trim()) {
      Alert.alert("Error", "Storage name is required")
      return
    }

    if (!currentLocation) {
      Alert.alert("Error", "Please select location first")
      return
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        Alert.alert("Error", "Not authenticated")
        return
      }

      const token = session.access_token

      if (storageId) {
        // ✅ UPDATE
        await updateStorage(
          token,
          storageId as string,
          {
            name: storageName.trim(),
            icon: selectedIcon,
            color: selectedColor,
          }
        )

        Alert.alert("Success", "Storage updated")
      } else {
        // ✅ CREATE
        await createStorage(
          token,
          currentLocation.id,
          {
            name: storageName.trim(),
            icon: selectedIcon,
            color: selectedColor,
          }
        )

        Alert.alert("Success", "Storage created")
      }

      router.back()
    } catch (err: any) {
      console.log("SAVE STORAGE ERROR:", err)
      Alert.alert("Error", err.message || "Something went wrong")
    }
  }

  const handleCancel = () => {
    router.back();
  };

  // Get selected icon image
  const getSelectedIconImage = () => {
    const selectedIconData = STORAGE_ICONS.find(icon => icon.id === selectedIcon);
    return selectedIconData?.icon;
  };

  const renderSelectedIcon = () => (
    <View style={styles.iconDisplayWrapper}>
      <View style={[styles.iconDisplayBox, { backgroundColor: selectedColor }]}>
        <Image source={getSelectedIconImage()!} style={styles.largeIconImage} />
      </View>
      <View style={styles.iconShadow} />
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#cbd1faff', '#eef4f8ff', '#cfe9f9ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {storageId ? "Edit Storage" : "New Storage"}
            </Text>

            <Text style={styles.subtitle}>
              {storageId ? "Update your storage" : "Create your storage space"}
            </Text>
          </View>

          {/* Large Icon Display */}
          <View style={styles.iconDisplayContainer}>
            {renderSelectedIcon()}
          </View>

          {/* Form Card */}
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.formCard}>

              {/* Name Section */}
              <View style={styles.section}>
                <Text style={styles.label}>📝 Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="pricetag-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={storageName}
                    onChangeText={setStorageName}
                    placeholder="Enter storage name"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Icon Section */}
              <View style={styles.section}>
                <Text style={styles.label}>🎨 Icon</Text>
                <View style={styles.iconRow}>
                  {STORAGE_ICONS.map((iconData) => (
                    <TouchableOpacity
                      key={iconData.id}
                      style={[
                        styles.iconButton,
                        selectedIcon === iconData.id && styles.selectedIconButton
                      ]}
                      onPress={() => setSelectedIcon(iconData.id)}
                      activeOpacity={0.7}
                    >
                      <Image source={iconData.icon} style={styles.iconImage} />
                      {selectedIcon === iconData.id && (
                        <View style={styles.iconCheckBadge}>
                          <Ionicons name="checkmark" size={10} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Color Section */}
              <View style={styles.section}>
                <Text style={styles.label}>🌈 Color</Text>
                <View style={styles.colorRow}>
                  {COLORS.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedColorButton
                      ]}
                      onPress={() => setSelectedColor(color)}
                      activeOpacity={0.7}
                    >
                      {selectedColor === color && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4f8ff',
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  cancelButton: {
    backgroundColor: 'rgba(150,150,150,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(100,100,100,0.3)',
  },
  saveButton: {
    backgroundColor: '#4CAF7C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#4CAF7C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  saveText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  iconDisplayContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  iconDisplayWrapper: {
    position: 'relative',
  },
  iconDisplayBox: {
    width: 180,
    height: 180,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  iconShadow: {
    position: 'absolute',
    bottom: -10,
    left: 20,
    right: 20,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 100,
  },
  largeIconImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 30,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E8ECF0',
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: 15,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 15,
    fontSize: 16,
    color: '#333',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedIconButton: {
    backgroundColor: '#E8F4FD',
    borderColor: '#667eea',
    transform: [{ scale: 1.05 }],
  },
  iconCheckBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  iconImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedColorButton: {
    borderColor: '#333',
    transform: [{ scale: 1.15 }],
  },
});