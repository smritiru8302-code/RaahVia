import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native'; 

const { width } = Dimensions.get('window');

export default function QRScanner({ onScanSuccess }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const isFocused = useIsFocused(); 

  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]); 

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    let locationName = "";
    let targetZone = "";
    let area = "";

    // Mapping physical QR strings to App Data IDs
    switch (data) {
      case 'aud_entrance':
        locationName = "Auditorium Entrance";
        targetZone = "auditorium";
        area = "Auditorium Indoor Navigation";
        break;
      case 'pharm_g_entrance':
        locationName = "Pharmacy Ground Floor";
        targetZone = "pharm_g";
        area = "Pharmacy Ground Floor Indoor Navigation";
        break;
      case 'pharm_1_stairs':
        locationName = "Pharmacy 1st Floor";
        targetZone = "pharm_1";
        area = "Pharmacy 1st Floor Indoor Navigation";
        break;
      case 'pharm_2_elevator':
        locationName = "Pharmacy 2nd Floor";
        targetZone = "pharm_2";
        area = "Pharmacy 2nd Floor Indoor Navigation";
        break;
      default:
        locationName = "Unknown SBU Location";
    }

    if (locationName !== "Unknown SBU Location") {
      if (onScanSuccess) {
        // Passing ALL the data to the next screen
        onScanSuccess({ 
          id: data, 
          name: locationName, 
          targetZone: targetZone,
          area: area,
          isValid: true,
          scannedLocation: data,
          qrData: data
        });
      }
    } else {
      Alert.alert("Invalid QR", "Code not recognized by RaahVia.", [
        { text: "Try Again", onPress: () => setScanned(false) }
      ]);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission required.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        >
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.middleContainer}>
              <View style={styles.unfocusedContainer} />
              <View style={styles.focusedContainer}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <View style={styles.unfocusedContainer} />
            </View>
            <View style={styles.unfocusedContainer}>
              <Text style={styles.scanText}>Position SBU QR in Frame</Text>
            </View>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  message: { textAlign: 'center', color: 'white', marginTop: '50%' },
  button: { backgroundColor: '#00B8D4', padding: 15, borderRadius: 10, alignSelf: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  overlay: { flex: 1 },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  middleContainer: { flexDirection: 'row', height: width * 0.7 },
  focusedContainer: { width: width * 0.7, height: width * 0.7 },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#00B8D4', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanText: { color: 'white', marginTop: 20 }
});