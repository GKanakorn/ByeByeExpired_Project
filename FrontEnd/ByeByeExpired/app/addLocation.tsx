import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../src/supabase'
import { Ionicons } from '@expo/vector-icons'
import { createLocation } from '../src/api/location.api'
import { LinearGradient } from 'expo-linear-gradient'

export default function AddLocationScreen() {
  const [name, setName] = useState('')
  const [type, setType] = useState<'personal' | 'business'>('personal')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter location name')
      return
    }

    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setLoading(false)
      Alert.alert('Error', 'User not logged in')
      return
    }

    try {
      await createLocation(session.access_token, { name, type })

      Alert.alert('สำเร็จ', 'เพิ่มสถานที่เรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => router.back() },
      ])
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={['#d9c7f7', '#c7d8f7']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#4b2a86" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>เพิ่มสถานที่เก็บใหม่</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Icon Section */}
      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <Ionicons name="location" size={50} color="#7b3fe4" />
        </View>
        <Text style={styles.bigTitle}>เพิ่มสถานที่เก็บ</Text>
        <Text style={styles.subTitle}>
          จัดการสินค้าได้อย่างมีประสิทธิภาพ
        </Text>
      </View>

      {/* Name Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>• ชื่อสถานที่</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="ระบุชื่อสถานที่เก็บของคุณ"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
      </View>

      {/* Type Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>• ประเภทสถานที่</Text>

        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeCard,
              type === 'personal' && styles.selectedCard,
            ]}
            onPress={() => setType('personal')}
          >
            <Image
              source={require('../assets/images/home.png')}
              style={styles.typeImage}
            />
            <Text style={styles.typeText}>ส่วนตัว</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeCard,
              type === 'business' && styles.selectedCard,
            ]}
            onPress={() => setType('business')}
          >
            <Image
              source={require('../assets/images/business.png')}
              style={styles.typeImage}
            />
            <Text style={styles.typeText}>ธุรกิจ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#b794f4', '#7ea7f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.saveButton}
        >
          <Text style={styles.saveText}>
            {loading ? 'กำลังบันทึก...' : '+ เพิ่มสถานที่เก็บ'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b2a86',
  },

  iconWrapper: {
    alignItems: 'center',
    marginBottom: 25,
  },

  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 30,
    backgroundColor: '#eee6fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  bigTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5b2dbf',
  },

  subTitle: {
    fontSize: 14,
    color: '#7a6f9b',
    marginTop: 4,
  },

  sectionCard: {
    backgroundColor: '#f3f3f3',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5b2dbf',
    marginBottom: 12,
  },

  input: {
    backgroundColor: '#e9edf2',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },

  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  typeCard: {
    width: '48%',
    borderRadius: 18,
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 4,
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: '#7b3fe4',
  },

  typeImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 8,
  },

  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5b2dbf',
  },

  saveButton: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },

  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})