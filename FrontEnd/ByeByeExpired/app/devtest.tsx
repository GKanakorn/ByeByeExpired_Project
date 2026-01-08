import { useRouter } from 'expo-router';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

export default function DevTestScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🛠️ Dev Test Menu</Text>
      <Text style={styles.subtitle}>เมนูสำหรับทดสอบระบบ</Text>

      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button 
            title="ไปหน้า Overview" 
            onPress={() => router.push('/overview')} 
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