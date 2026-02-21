import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function AddSupplierScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    contact: '',
    note: '',
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'You need to allow access to your photos to upload an image.');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <LinearGradient colors={['#F8EFFF', '#FBE9FF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.headerAction}>Cancle</Text>
          </TouchableOpacity>
          <Text style={styles.headerAction}>Save</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <ScrollView 
            contentContainerStyle={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          <Text style={styles.title}>New Supplier</Text>

          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={60} color="#FFFFFF" />
              )}
            </View>
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
              <Text style={styles.addPhotoText}>เพิ่มรูปภาพ</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Input
              label="ชื่อร้าน / บริษัท *"
              value={form.name}
              onChangeText={(value) => handleChange('name', value)}
            />
            <Input
              label="เบอร์โทรศัพท์ *"
              value={form.phone}
              onChangeText={(value) => handleChange('phone', value)}
            />
            <Input
              label="ที่อยู่ *"
              value={form.address}
              onChangeText={(value) => handleChange('address', value)}
            />
          </View>

          <View style={styles.card}>
            <Input
              label="อีเมล"
              value={form.email}
              onChangeText={(value) => handleChange('email', value)}
            />
            <Input
              label="ชื่อผู้ติดต่อ"
              value={form.contact}
              onChangeText={(value) => handleChange('contact', value)}
            />
            <Input
              label="หมายเหตุ"
              value={form.note}
              onChangeText={(value) => handleChange('note', value)}
            />
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
};

const Input = ({ label, value, onChangeText }: InputProps) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder=""
      placeholderTextColor="#B1A0C8"
    />
    <View style={styles.divider} />
  </View>
);

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
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerAction: {
    fontSize: 16,
    color: '#8E5AE8',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: '#5F37C4',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#B184FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  addPhotoButton: {
    marginTop: 16,
    backgroundColor: '#D8D2DF',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 6,
  },
  addPhotoText: {
    color: '#7C6E93',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9F81C6',
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    color: '#2D1B4E',
  },
  divider: {
    height: 1,
    backgroundColor: '#E7DFF2',
    marginTop: 8,
  },
});