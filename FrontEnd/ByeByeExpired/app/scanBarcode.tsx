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
    const getCameraPermissions = async () => {
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
    </View>
  );
}

const styles = StyleSheet.create({
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
});