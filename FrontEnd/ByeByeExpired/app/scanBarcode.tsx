import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router'
import { useFocusEffect } from 'expo-router'
import { lookupBarcode } from '../src/api/barcode.api'

export default function ScanBarcodeScreen() {
  const router = useRouter();
  const [scanLineAnimation] = useState(new Animated.Value(0));
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanned, setIsScanned] = useState(false)
  const scannedRef = useRef(false)
  const [loading, setLoading] = useState(false)
  const [cameraKey, setCameraKey] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    mode,
    context,
    locationId,
  } = useLocalSearchParams<{
    mode: 'add' | 'remove'
    context: 'personal' | 'business'
    locationId: string
  }>()

  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Screen focused → reset scan')

      scannedRef.current = false
      setIsScanned(false)
      setScannedData(null)
      setLoading(false)

      setCameraKey(prev => prev + 1)

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }, [])
  )
  useEffect(() => {
    async function getCameraPermissions() {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    }
    getCameraPermissions();
  }, []);
  // Scanning animation - เคลื่อนตลอดเวลา
  useEffect(() => {
    const animateScanLine = () => {
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        })
      ]).start(() => {
        animateScanLine(); // เคลื่อนตลอดเวลา
      });
    };

    animateScanLine(); // เริ่มทันที
  }, []);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scannedRef.current) return
    scannedRef.current = true

    setIsScanned(true)
    setLoading(true)

    const res = await lookupBarcode(data)

    // 👉 ส่งข้อมูลไปหน้า AddProduct
    router.replace({
      pathname:
        context === 'business'
          ? '/addProductBusiness'
          : '/addProductPersonal',
      params: {
        barcode: data,
        template: JSON.stringify(res.template),
        isNew: (!res.found).toString(),
        locationId,
      },
    })
  }

  const handleAddProduct = () => {
    if (mode !== 'add') return

    const target =
      context === 'business'
        ? '/addProductBusiness'
        : '/addProductPersonal'

    router.replace({
      pathname: target,
      params: {
        barcode: scannedData ?? undefined,
        locationId,
      },
    })
  }

  const handleDeleteProduct = () => {
    if (mode !== 'remove') return

    router.replace({
      pathname: '/deleteProduct',
      params: {
        barcode: scannedData ?? undefined,
        locationId,
        context, // 👈 personal | business
      },
    })
  }
  if (hasPermission === null) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size="large" color="#9B59B6" />
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.fullScreenContainer}>
        <Text style={{ color: 'white' }}>ไม่อนุญาตให้ใช้กล้อง</Text>
      </View>
    )
  }
  return (
    <View style={styles.fullScreenContainer}>
      {/* Camera View - สแกนตลอดเวลา */}

      <CameraView
        key={cameraKey}
        style={styles.camera}
        facing="back"
        onBarcodeScanned={isScanned ? undefined : handleBarcodeScanned}
      />

      {/* Dark Overlay with Scanning Window */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanningWindow}>
            {/* Corner Brackets */}
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            {/* Animated Scan Line */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{
                    translateY: scanLineAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-80, 80]
                    })
                  }]
                }
              ]}
            />

            {/* Barcode Icon */}
            <View style={styles.barcodeIcon}>
              <Ionicons
                name="barcode-outline"
                size={28}
                color="#9B59B6"
              />
            </View>
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {mode === 'add' ? 'สแกนเพื่อเพิ่มสินค้า' : 'สแกนเพื่อลบสินค้า'}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.replace('/overview')}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Action Buttons */}
        {!isScanned && (
          <View style={styles.buttonsContainer}>
            {mode === 'remove' && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteProduct}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF4757']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Delete</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {mode === 'add' && (
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleAddProduct}
              >
                <LinearGradient
                  colors={['#9B59B6', '#8E44AD']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Add</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#9B59B6" />
                <Text style={styles.loadingText}>กำลังตรวจสอบ Barcode…</Text>
              </View>
            )}
          </View>
        )}

        {/* Instruction Text */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            วาง Barcode ไว้ตรงกลางกรอบเพื่อสแกน
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  camera: {
    flex: 1
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 180,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  scanningWindow: {
    width: 360,
    height: 180,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
    zIndex: 10
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 10
  },
  instructionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10
  },
  instructionText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500'
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteButton: {
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8
  },
  scanButton: {
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8
  },
  gradientButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 130
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#9B59B6',
    borderTopLeftRadius: 12
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#9B59B6',
    borderTopRightRadius: 12
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#9B59B6',
    borderBottomLeftRadius: 12
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#9B59B6',
    borderBottomRightRadius: 12
  },
  barcodeIcon: {
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(155, 89, 182, 0.4)'
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#9B59B6',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});