import { getMyLocations } from '../src/api/location.api'
import { useEffect, useState } from 'react'
import { supabase } from '../src/supabase'
import { useLocation } from '../src/context/LocationContext'
import { useRouter } from 'expo-router';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'

export default function DevTestScreen() {
  const router = useRouter();

  const { selectedLocation, setSelectedLocation } = useLocation()
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([])

  useFocusEffect(
  useCallback(() => {
    const loadLocations = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) return

      try {
        const data = await getMyLocations(session.access_token)
        setLocations(data)
      } catch (err) {
        console.log('LOAD LOCATIONS ERROR', err)
      }
    }

    loadLocations()
  }, [])
)

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🛠️ Dev Test Menu</Text>
      <Text style={styles.subtitle}>เมนูสำหรับทดสอบระบบ</Text>

      <View style={{ width: '100%', maxWidth: 300, marginBottom: 20 }}>
        <Text style={{ marginBottom: 8 }}>📍 เลือก Location</Text>

        {locations.length === 0 && (
          <Text style={{ color: 'gray' }}>ยังไม่มี location</Text>
        )}

        {locations.map(loc => {
          const selected = selectedLocation?.id === loc.id

          return (
            <TouchableOpacity
              key={loc.id}
              onPress={() => setSelectedLocation(loc)}
              style={{
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: selected ? '#6a367a' : '#ccc',
                backgroundColor: selected ? '#f4ecf7' : '#fff',
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  color: selected ? '#6a367a' : '#333',
                }}
              >
                {loc.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button 
            title="ไปหน้า Overview" 
            onPress={() => router.push('/overview')} 
          />
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button 
            title="ไปหน้า Overview Business" 
            onPress={() => router.push('/overviewBusiness')} 
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button 
            title="ไปหน้า Add Product" 
            onPress={() => router.push('/addProduct')} 
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button 
            title="ไปหน้า Add Location" 
            onPress={() => router.push('/addLocation')} 
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button 
            title="ไปหน้า Delete Product" 
            color="red" // เปลี่ยนสีหน่อยให้รู้ว่าเป็นปุ่มลบ
            onPress={() => router.push('/deleteProduct')} 
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button 
            title="ไปหน้า Add Storage" 
            onPress={() => router.push('/addStorage')} 
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button 
            title="ไปหน้า Scan Barcode" 
            color="green" 
            onPress={() => router.push('/scanBarcode')} 
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button 
            title="ไปหน้า Register" 
            color="purple" 
            onPress={() => router.push('/Register')} 
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button 
            title="ไปหน้า Settings" 
            color="purple" 
            onPress={() => router.push('/setting')} 
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 300,
    gap: 15, // ระยะห่างระหว่างปุ่ม
  },
  buttonWrapper: {
    marginBottom: 10, // เผื่อสำหรับ Android หรือ iOS เก่าๆ ที่ไม่รองรับ gap
  }
});