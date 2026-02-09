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
      await createLocation(session.access_token, {
        name,
        type,
      })

      Alert.alert('Success', 'Location created!', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#6a367a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Location</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title}>Create a new location</Text>
        <Text style={styles.subtitle}>
          Organize your storages by location
        </Text>

        {/* Name */}
        <Text style={styles.label}>📍 Location Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Home, Office"
          style={styles.input}
        />

        {/* Type */}
        <Text style={styles.label}>🏷 Location Type</Text>
        <View style={styles.typeRow}>
          {/* Personal */}
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
            <Text style={styles.typeText}>Personal</Text>
          </TouchableOpacity>

          {/* Business */}
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
            <Text style={styles.typeText}>Business</Text>
          </TouchableOpacity>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? 'Saving...' : 'Create Location'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const PRIMARY = '#6a367a'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f2f8',
    padding: 20,
    paddingTop: 75 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 24,
  },

  /* 🔽 Location type */
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  typeCard: {
    width: '48%',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: PRIMARY,
    backgroundColor: '#f4ecf7',
  },
  typeImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  /* 🔽 Save button */
  saveButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})