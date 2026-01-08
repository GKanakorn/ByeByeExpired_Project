import { useRouter } from 'expo-router';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function OverviewScreen() {
  const router = useRouter();

  const handleBack = () => {
    // สั่งให้ถอยกลับไปหน้าก่อนหน้า (เหมือนกดปุ่ม Back)
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 หน้า Overview</Text>
      <Text style={styles.subtitle}>ยินดีต้อนรับเข้าสู่ระบบ</Text>
      <Button title="กลับ" color="red" onPress={handleBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f7ff', // เปลี่ยนสีพื้นหลังนิดหน่อยให้รู้ว่าคนละหน้า
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
  },
});