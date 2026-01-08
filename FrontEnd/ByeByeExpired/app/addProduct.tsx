import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'react-native';

// ต้องมีคำว่า export default เสมอ!
export default function AddProductScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➕ หน้าเพิ่มสินค้า</Text>
      <Text>Add Product Screen</Text>
      
      {/* ปุ่มย้อนกลับแบบง่ายๆ */}
      <Button title="ย้อนกลับ" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  }
});