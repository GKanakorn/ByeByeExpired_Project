import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router'


export default function DeleteProductScreen() {
  const { barcode, locationId, context } = useLocalSearchParams<{
  barcode?: string
  locationId: string
  context: 'personal' | 'business'
}>()
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗑️ หน้าลบสินค้า</Text>
      <Text style={styles.subtitle}>Barcode: {barcode}</Text>
      <Text style={styles.subtitle}>Location ID: {locationId}</Text>
      <Text style={styles.subtitle}>Context: {context}</Text>
      <Button title="ย้อนกลับ" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 16, marginBottom: 10 }
});