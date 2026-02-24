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
            title="ไปหน้า Add Product for Business"
            onPress={() => router.push('/addProductBusiness')}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Add Product for Personal"
            onPress={() => router.push('/addProductPersonal')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า ShowdetailBusiness"
            onPress={() => router.push('/showDetailBusiness')}
          />
        </View> 
        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า ShowdetailPersonal"
            onPress={() => router.push('/showDetailPersonal')}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า ShowdetailPersonal"
            onPress={() => router.push('/showDetailPersonal')}

          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Add Product for Personal"
            onPress={() => router.push('/addProductPersonal')}
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
            title="ไปหน้า Delete Product"
            color="red" // เปลี่ยนสีหน่อยให้รู้ว่าเป็นปุ่มลบ
            onPress={() => router.push('/deleteProduct')}
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
            title="ไปหน้า Nearly Expired"
            color="green"
            onPress={() => router.push('/NearlyExpired')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Expired"
            color="green"
            onPress={() => router.push('/Expired')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Storage Fridge"
            color="#FE7EA9"
            onPress={() => router.push('/storageFridge')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Storage Freezer"
            color="#FE7EA9"
            onPress={() => router.push('/storageFreezer')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Storage Dryfood"
            color="#FE7EA9"
            onPress={() => router.push('/storageDryfood')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Settings"
            color="purple"
            onPress={() => router.push('/setting')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Profile"
            color="orange"
            onPress={() => router.push('/profile')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Dashboard"
            color="blue"
            onPress={() => router.push('/Dashboard')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Supplier Tracking"
            color="#7C3AED"
            onPress={() => router.push('/supplier')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Add Supplier"
            color="#9626C2"
            onPress={() => router.push('/addSupplier')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Detail Supplier"
            color="#8B5CF6"
            onPress={() => router.push('/detailSupplier')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="ไปหน้า Show List (หมดอายุ)"
            color="#FF1493"
            onPress={() => router.push('/showList')}
          />
        </View>
      </View>
    </ScrollView >
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