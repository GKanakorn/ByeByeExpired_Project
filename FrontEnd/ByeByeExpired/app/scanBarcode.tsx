<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';

export default function ScanBarcodeScreen() {
  const router = useRouter();
  const [scanMode, setScanMode] = useState<'qr' | 'barcode'>('qr');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleScan = () => {
    if (hasPermission === false) {
      Alert.alert('ไม่มีสิทธิ์', 'ไม่มีสิทธิ์ใช้กล้อง กรุณาเปิดอนุญาตในการตั้งค่า');
      return;
    }
    setShowCamera(true);
    setIsScanning(true);
  };

  const closeScan = () => {
    setShowCamera(false);
    setIsScanning(false);
  };

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    setIsScanning(false);
    setScannedData(data);
    Alert.alert('สำเร็จ!', `สแกนสำเร็จ!

ข้อมูล: ${data}`);
  };

  return (
    <View style={showCamera ? styles.fullScreenContainer : styles.container}>
      {showCamera ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing='back'
            onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: scanMode === 'qr' ? ['qr', 'pdf417'] : ['ean13', 'ean8', 'code128', 'code39'],
            }}
          >
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraTitle}>สแกน {scanMode === 'qr' ? 'QR Code' : 'Barcode'}</Text>
              <View style={styles.scanFrame} />
              <TouchableOpacity style={styles.closeButton} onPress={closeScan}>
                <Ionicons name="close" size={24} color="white" />
                <Text style={styles.closeButtonText}>ปิด</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      ) : (
        <>
          {/* Header */}
          <Text style={styles.title}>สแกนโค้ด</Text>

          {/* Scanner Area */}
          <View style={styles.scannerArea}>
            {/* Corner Brackets */}
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            
            {/* Scanner Icon/Loading */}
            <View style={styles.scannerIcon}>
              {isScanning ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <Ionicons 
                  name={scanMode === 'qr' ? 'qr-code-outline' : 'barcode-outline'} 
                  size={48} 
                  color="white" 
                />
              )}
            </View>
            
            {/* Scanning Status Text */}
            {isScanning && (
              <Text style={styles.scanningText}>
                กำลังสแกน {scanMode === 'qr' ? 'QR Code' : 'Barcode'}...
              </Text>
            )}
          </View>

          {/* Scanned Data Display */}
          {scannedData && (
            <View style={styles.dataContainer}>
              <View style={styles.dataContent}>
                <View style={styles.dataText}>
                  <Text style={styles.dataLabel}>ข้อมูลที่สแกนได้:</Text>
                  <Text style={styles.dataValue}>{scannedData}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Mode Selection Buttons */}
          <View style={styles.modeContainer}>
            <TouchableOpacity
              onPress={() => setScanMode('qr')}
              disabled={isScanning}
              style={[
                styles.modeButton,
                scanMode === 'qr' ? styles.modeButtonActive : styles.modeButtonInactive,
                isScanning && styles.modeButtonDisabled
              ]}
            >
              <Text style={[
                styles.modeButtonText,
                scanMode === 'qr' ? styles.modeButtonTextActive : styles.modeButtonTextInactive
              ]}>
                QR Code
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setScanMode('barcode')}
              disabled={isScanning}
              style={[
                styles.modeButton,
                scanMode === 'barcode' ? styles.modeButtonActive : styles.modeButtonInactive,
                isScanning && styles.modeButtonDisabled
              ]}
            >
              <Text style={[
                styles.modeButtonText,
                scanMode === 'barcode' ? styles.modeButtonTextActive : styles.modeButtonTextInactive
              ]}>
                Barcode
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scan Button */}
          <View style={styles.scanButtonContainer}>
            <TouchableOpacity
              onPress={handleScan}
              disabled={isScanning}
              style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
            >
              <Text style={styles.scanButtonText}>
                {isScanning ? 'กำลังสแกน...' : 'เริ่มสแกน'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.hintText}>
              วางโค้ดในกรอบเพื่อสแกน
            </Text>
          </View>

          {/* Back Button - Only show when not scanning */}
          {!isScanning && (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="white" />
              <Text style={styles.backButtonText}>ย้อนกลับ</Text>
            </TouchableOpacity>
          )}
        </>
      )}
=======
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useCallback, useEffect, useRef } from 'react';

// ขนาดหน้าจอ
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCANNER_WIDTH = SCREEN_WIDTH - 60;
const SCANNER_HEIGHT = 200;

export default function ScanBarcodeScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcodeData, setBarcodeData] = useState<string | null>(null);
  const [barcodeType, setBarcodeType] = useState<string | null>(null);
  
  // Animation สำหรับ scan line
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation loop สำหรับ scan line
  useEffect(() => {
    if (!scanned) {
      const scanAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      scanAnimation.start();
      return () => scanAnimation.stop();
    }
  }, [scanned, scanLineAnim]);

  // Pulse animation สำหรับกรอบเมื่อสแกนได้
  useEffect(() => {
    if (scanned) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [scanned, pulseAnim]);

  // ฟังก์ชันเมื่อสแกนบาร์โค้ดได้
  const handleBarcodeScanned = useCallback(({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      setBarcodeData(data);
      setBarcodeType(type);
    }
  }, [scanned]);

  // ฟังก์ชันลบสินค้า
  const handleDelete = useCallback(() => {
    if (!barcodeData) {
      Alert.alert('แจ้งเตือน', 'กรุณาสแกนบาร์โค้ดก่อน');
      return;
    }
    Alert.alert(
      'ยืนยันการลบ',
      `ต้องการลบสินค้า\nบาร์โค้ด: ${barcodeData}`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบ', 
          style: 'destructive',
          onPress: () => {
            // TODO: เรียก API ลบสินค้า
            Alert.alert('สำเร็จ', 'ลบสินค้าเรียบร้อย');
            setScanned(false);
            setBarcodeData(null);
            setBarcodeType(null);
          }
        }
      ]
    );
  }, [barcodeData]);

  // ฟังก์ชันเพิ่มสินค้า
  const handleAdd = useCallback(() => {
    if (!barcodeData) {
      Alert.alert('แจ้งเตือน', 'กรุณาสแกนบาร์โค้ดก่อน');
      return;
    }
    // TODO: นำทางไปหน้าเพิ่มสินค้าพร้อมข้อมูลบาร์โค้ด
    router.push({
      pathname: '/addProduct',
      params: { barcode: barcodeData, type: barcodeType }
    });
  }, [barcodeData, barcodeType, router]);

  // ฟังก์ชันสแกนใหม่
  const handleRescan = useCallback(() => {
    setScanned(false);
    setBarcodeData(null);
    setBarcodeType(null);
  }, []);

  // กำลังโหลดสิทธิ์กล้อง
  if (!permission) {
    return (
      <LinearGradient colors={['#D2EBFF', '#FAE1FA']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </View>
      </LinearGradient>
    );
  }

  // ยังไม่ได้รับสิทธิ์กล้อง
  if (!permission.granted) {
    return (
      <LinearGradient
        colors={['#D2EBFF', '#FAE1FA']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>สแกนโค้ด</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6750A4" />
          </TouchableOpacity>
        </View>

        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={80} color="#7c3aed" />
          <Text style={styles.permissionTitle}>ต้องการสิทธิ์เข้าถึงกล้อง</Text>
          <Text style={styles.permissionDesc}>
            เพื่อสแกนบาร์โค้ดสินค้า กรุณาอนุญาตให้แอปเข้าถึงกล้อง
          </Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <LinearGradient
              colors={['#9B5CFF', '#FF4DA6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.permissionButtonGradient}
            >
              <Text style={styles.permissionButtonText}>อนุญาตใช้กล้อง</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full Screen Camera Background */}
      <CameraView
        style={styles.fullScreenCamera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code128', 'codabar', 'itf14'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Gradient Overlay Top */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent']}
        style={styles.topGradient}
      />

      {/* Gradient Overlay Bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomGradient}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="scan-outline" size={22} color="#C084FC" />
            <Text style={styles.headerTitle}>สแกนโค้ด</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Scanner Area */}
        <View style={styles.scannerContainer}>
          {/* Scanner Frame */}
          <Animated.View style={[styles.scannerFrame, { transform: [{ scale: pulseAnim }] }]}>
            {/* Glass effect background */}
            <View style={styles.glassBackground} />

            {/* Corner Brackets */}
            <View style={[styles.cornerBracket, styles.topLeft]}>
              <View style={styles.bracketHorizontal} />
              <View style={styles.bracketVertical} />
            </View>
            <View style={[styles.cornerBracket, styles.topRight]}>
              <View style={styles.bracketHorizontal} />
              <View style={styles.bracketVertical} />
            </View>
            <View style={[styles.cornerBracket, styles.bottomLeft]}>
              <View style={styles.bracketHorizontal} />
              <View style={styles.bracketVertical} />
            </View>
            <View style={[styles.cornerBracket, styles.bottomRight]}>
              <View style={styles.bracketHorizontal} />
              <View style={styles.bracketVertical} />
            </View>

            {/* Animated Scan Line */}
            {!scanned && (
              <Animated.View 
                style={[
                  styles.scanLine,
                  {
                    transform: [{
                      translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-SCANNER_HEIGHT / 2 + 30, SCANNER_HEIGHT / 2 - 30],
                      }),
                    }],
                  },
                ]} 
              />
            )}

            {/* Scanned checkmark */}
            {scanned && (
              <View style={styles.scannedIcon}>
                <Ionicons name="checkmark-circle" size={50} color="#4ade80" />
              </View>
            )}
          </Animated.View>

          {/* Instruction text */}
          <Text style={styles.instructionText}>
            {scanned ? 'สแกนสำเร็จ!' : 'วางบาร์โค้ดในกรอบ'}
          </Text>
        </View>

        {/* Bottom Content */}
        <View style={styles.bottomContent}>
          {/* แสดงผลบาร์โค้ดที่สแกนได้ */}
          {barcodeData && (
            <View style={styles.resultContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.barcodeResult}
              >
                <View style={styles.barcodeIconWrapper}>
                  <Ionicons name="barcode-outline" size={24} color="#C084FC" />
                </View>
                <View style={styles.barcodeInfo}>
                  <Text style={styles.barcodeLabel}>บาร์โค้ด</Text>
                  <Text style={styles.barcodeResultText}>{barcodeData}</Text>
                </View>
              </LinearGradient>
              <TouchableOpacity onPress={handleRescan} style={styles.rescanButton}>
                <Ionicons name="refresh-outline" size={16} color="#C084FC" />
                <Text style={styles.rescanButtonText}>สแกนใหม่</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, !barcodeData && styles.buttonDisabled]} 
              onPress={handleDelete}
              disabled={!barcodeData}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={barcodeData ? ['#ef4444', '#dc2626'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text style={styles.buttonText}>ลบ</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary, !barcodeData && styles.buttonDisabled]} 
              onPress={handleAdd}
              disabled={!barcodeData}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={barcodeData ? ['#9B5CFF', '#FF4DA6'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.buttonText}>เพิ่มสินค้า</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Hint text */}
          <Text style={styles.hintText}>
            รองรับบาร์โค้ดเท่านั้น
          </Text>
        </View>
      </View>
>>>>>>> 8083ff4 (Update Register and ScanBarcode UI - Add Google login button, beautify forms)
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  fullScreenContainer: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#e0e7ff', // Light purple gradient background
    padding: 24,
    justifyContent: 'center'
  },
  cameraContainer: {
=======
  // === Container Styles ===
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreenCamera: {
>>>>>>> 8083ff4 (Update Register and ScanBarcode UI - Add Google login button, beautify forms)
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
<<<<<<< HEAD
    bottom: 0
  },
  camera: {
    flex: 1
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 40
  },
  cameraTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 20,
    backgroundColor: 'transparent'
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    marginBottom: 20
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B46C1', // Purple-700
    textAlign: 'center',
    marginBottom: 48
  },
  scannerArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center'
  },
  // Corner brackets
  cornerTL: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 64,
    height: 64,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#8B5CF6', // Purple-500
    borderTopLeftRadius: 8
  },
  cornerTR: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 64,
    height: 64,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#8B5CF6',
    borderTopRightRadius: 8
  },
  cornerBL: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 64,
    height: 64,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#8B5CF6',
    borderBottomLeftRadius: 8
  },
  cornerBR: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#8B5CF6',
    borderBottomRightRadius: 8
  },
  scannerIcon: {
    backgroundColor: '#6B46C1', // Purple-700
    borderRadius: 24,
    padding: 40,
    marginBottom: 16
  },
  scanningText: {
    color: '#6B46C1',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  dataContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  dataContent: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  dataText: {
    flex: 1
  },
  dataLabel: {
    fontSize: 14,
    color: '#8B5CF6', // Purple-500
    marginBottom: 4
  },
  dataValue: {
    fontSize: 16,
    color: '#581C87', // Purple-900
    flexWrap: 'wrap'
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 16
  },
  modeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24
  },
  modeButtonActive: {
    backgroundColor: '#7C3AED', // Purple-600
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  modeButtonInactive: {
    backgroundColor: 'rgba(196, 181, 253, 0.5)' // Purple-300 with opacity
  },
  modeButtonDisabled: {
    opacity: 0.3
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  modeButtonTextActive: {
    color: 'white'
  },
  modeButtonTextInactive: {
    color: '#7C3AED' // Purple-600
  },
  scanButtonContainer: {
    alignItems: 'center',
    marginBottom: 32
  },
  scanButton: {
    backgroundColor: '#EC4899', // Pink-400 (gradient effect)
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 200,
    alignItems: 'center'
  },
  scanButtonDisabled: {
    opacity: 0.5
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  hintText: {
    fontSize: 14,
    color: '#8B5CF6', // Purple-500
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444', // Red-500
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'center'
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
=======
    bottom: 0,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 1,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 350,
    zIndex: 1,
  },
  overlay: {
    flex: 1,
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7c3aed',
  },

  // === Header Styles ===
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // === Permission Styles ===
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // === Scanner Styles ===
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scannerFrame: {
    width: SCANNER_WIDTH,
    height: SCANNER_HEIGHT,
    borderRadius: 24,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    position: 'absolute',
    width: '85%',
    height: 3,
    borderRadius: 2,
    backgroundColor: '#C084FC',
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  scannedIcon: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    padding: 10,
  },
  instructionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 25,
    fontWeight: '500',
  },

  // === Corner Bracket Styles ===
  cornerBracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 10,
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    transform: [{ scaleX: -1 }],
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    transform: [{ scaleY: -1 }],
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    transform: [{ scaleX: -1 }, { scaleY: -1 }],
  },
  bracketHorizontal: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 5,
    backgroundColor: '#C084FC',
    borderRadius: 3,
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  bracketVertical: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 5,
    height: 40,
    backgroundColor: '#C084FC',
    borderRadius: 3,
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  // === Bottom Content ===
  bottomContent: {
    paddingHorizontal: 25,
    paddingBottom: 50,
  },

  // === Result Styles ===
  resultContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  barcodeResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  barcodeIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(192,132,252,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  barcodeInfo: {
    flex: 1,
  },
  barcodeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  barcodeResultText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  rescanButtonText: {
    fontSize: 14,
    color: '#C084FC',
    fontWeight: '600',
  },

  // === Button Styles ===
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonPrimary: {
    flex: 1.5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 20,
  },
});
});