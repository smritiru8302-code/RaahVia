import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, SafeAreaView, ScrollView, Platform, Modal, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// --- SAFE NATIVE IMPORTS ---
let useSpeechRecognitionEvent = () => {}; 
let ExpoSpeechRecognitionModule = null;

if (Platform.OS !== 'web') {
  try {
    const SpeechLib = require('expo-speech-recognition');
    useSpeechRecognitionEvent = SpeechLib.useSpeechRecognitionEvent;
    ExpoSpeechRecognitionModule = SpeechLib.ExpoSpeechRecognitionModule;
  } catch (e) {
    console.log("Speech module not available", e);
  }
}

export default function Dashboard({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [pharmacyOptionsVisible, setPharmacyOptionsVisible] = useState(false);
  const [customAlert, setCustomAlert] = useState({ visible: false, message: '', targetId: '' });
  const [mapVisible, setMapVisible] = useState(false); // Controls the full map

  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => setIsListening(false));
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) setSearchQuery(transcript);
  });

  const mainZones = [
    { id: 'pharm_gateway', title: 'Pharmacy Block' },
    { id: 'aud_entrance', title: 'Auditorium Entrance' },
  ];

  const handleStartNavigation = (zoneTitle, zoneId) => {
    setCustomAlert({
      visible: true,
      message: `Please scan the QR code located at the ${zoneTitle}.`,
      targetId: zoneId
    });
  };

  const handleMicPress = async () => {
    if (Platform.OS === 'web' || !ExpoSpeechRecognitionModule) {
      setCustomAlert({ visible: true, message: "Voice recognition requires mobile build.", targetId: '' });
      return;
    }
    const result = await ExpoSpeechRecognitionModule?.requestPermissionsAsync();
    if (result?.granted) {
      ExpoSpeechRecognitionModule.start({ lang: "en-IN", interimResults: true });
    }
  };

  const handleMicRelease = () => {
    if (Platform.OS !== 'web' && ExpoSpeechRecognitionModule) {
      ExpoSpeechRecognitionModule.stop();
    }
  };

  const handleSearchSelection = (item) => {
    setSearchQuery('');
    if (item.title.toLowerCase().includes('pharmacy')) {
      setPharmacyOptionsVisible(true);
    } else if (item.id.includes('aud')) {
      handleStartNavigation("Auditorium Entrance", 'aud_entrance');
    } else {
      onNavigate('MapScreen', { data: item });
    }
  };

  const handleZoneSelect = (zoneId) => {
    setPharmacyOptionsVisible(false);
    let zoneTitle = "";
    let qrId = "";
    if (zoneId === 'pharm_g') { zoneTitle = "Pharmacy Ground Floor"; qrId = "pharm_g_entrance"; }
    else if (zoneId === 'pharm_1') { zoneTitle = "Pharmacy 1st Floor"; qrId = "pharm_1_stairs"; }
    else if (zoneId === 'pharm_2') { zoneTitle = "Pharmacy 2nd Floor"; qrId = "pharm_2_elevator"; }
    handleStartNavigation(zoneTitle, qrId);
  };

  const filteredZones = searchQuery.length > 0 
    ? mainZones.filter(z => z.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => console.log("Menu")}>
              <Feather name="menu" size={24} color="#000000" />
            </TouchableOpacity>
            <View style={styles.titleStack}>
              <Text style={styles.brandName}>RaahVia</Text>
              <Text style={styles.brandSub}>SBU RANCHI CAMPUS</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate('Profile')}>
              <Feather name="user" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.directoryTitle}>Directory</Text>
        </View>

        {/* SEARCH BOX */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#000000" />
            <TextInput 
              placeholder={isListening ? "Listening..." : "Search personnel or blocks..."} 
              style={[styles.searchInput, Platform.select({ web: { outlineStyle: 'none' } })]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666666"
            />
            <TouchableOpacity 
              style={[styles.voiceBtn, isListening && styles.voiceBtnActive]} 
              onPressIn={handleMicPress} 
              onPressOut={handleMicRelease}
            >
              <Ionicons name={isListening ? "mic" : "mic-outline"} size={22} color="#000000" />
            </TouchableOpacity>
          </View>

          {searchQuery.length > 0 && (
            <View style={styles.dropdown}>
              {filteredZones.map((item) => (
                <TouchableOpacity key={item.id} style={styles.dropItem} onPress={() => handleSearchSelection(item)}>
                  <Text style={styles.dropText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* QR SECTION */}
        <View style={styles.qrSection}>
          <TouchableOpacity 
            style={styles.qrOuterRing} 
            onPress={() => onNavigate('QRScanner')}
          >
            <View style={styles.qrMainButton}>
              <MaterialCommunityIcons name="qrcode-scan" size={width * 0.15} color="#000000" />
              <Text style={styles.scanLabel}>Scan to Start</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* CAMPUS OVERVIEW */}
        <View style={styles.mapSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.overviewTitle}>Campus Overview</Text>
            <TouchableOpacity onPress={() => setMapVisible(true)}>
              <Text style={styles.seeAll}>View Full Map</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.bigMapCard} onPress={() => setMapVisible(true)}>
            <Image source={require('../assets/campus_satellite.png')} style={styles.mapImg} />
            <View style={styles.mapOverlayLabel}>
               <Text style={styles.mapFooterText}>Interactive Satellite View</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MODALS --- */}

      {/* FULL MAP OVERVIEW MODAL */}
      <Modal visible={mapVisible} transparent animationType="fade">
        <View style={styles.fullMapOverlay}>
          <View style={styles.fullMapContainer}>
            <View style={styles.fullMapHeader}>
              <Text style={styles.modalTitle}>SBU Campus Map</Text>
              <TouchableOpacity onPress={() => setMapVisible(false)}>
                <Ionicons name="close-circle" size={35} color="#000000" />
              </TouchableOpacity>
            </View>
            <Image 
              source={require('../assets/campus_satellite.png')} 
              style={styles.fullMapImage} 
              resizeMode="contain" 
            />
          </View>
        </View>
      </Modal>

      {/* PHARMACY MODAL */}
      <Modal visible={pharmacyOptionsVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Pharmacy Floor</Text>
            <TouchableOpacity style={styles.floorBtn} onPress={() => handleZoneSelect('pharm_g')}><Text style={styles.floorBtnText}>Ground Floor</Text></TouchableOpacity>
            <TouchableOpacity style={styles.floorBtn} onPress={() => handleZoneSelect('pharm_1')}><Text style={styles.floorBtnText}>1st Floor</Text></TouchableOpacity>
            <TouchableOpacity style={styles.floorBtn} onPress={() => handleZoneSelect('pharm_2')}><Text style={styles.floorBtnText}>2nd Floor</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setPharmacyOptionsVisible(false)}><Text style={styles.cancelText}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ALERT MODAL */}
      <Modal visible={customAlert.visible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Navigation</Text>
            <Text style={styles.alertMessage}>{customAlert.message}</Text>
            <TouchableOpacity style={styles.alertBtn} onPress={() => {
                const target = customAlert.targetId;
                setCustomAlert({ visible: false, message: '', targetId: '' });
                if (target) onNavigate('QRScanner', { targetZone: target });
              }}>
              <Text style={styles.alertBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F8E9' }, 
  scrollContainer: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleStack: { alignItems: 'center' },
  brandName: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
  brandSub: { color: '#000000', fontSize: 9 },
  directoryTitle: { color: '#000000', fontSize: 32, marginTop: 15, fontWeight: 'bold' },
  searchWrapper: { paddingHorizontal: 20, marginTop: 10 },
  searchBox: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, height: 50, alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: '#C8E6C9' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#000000' },
  voiceBtn: { padding: 5 },
  voiceBtnActive: { backgroundColor: '#F0F0F0', borderRadius: 5 },
  dropdown: { backgroundColor: 'white', marginTop: 5, borderRadius: 12, borderWidth: 1, borderColor: '#C8E6C9' },
  dropItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dropText: { color: '#000000', fontSize: 14 },
  qrSection: { height: height * 0.35, justifyContent: 'center', alignItems: 'center' },
  qrOuterRing: { width: width * 0.5, height: width * 0.5, borderRadius: width * 0.25, backgroundColor: '#C8E6C9', justifyContent: 'center', alignItems: 'center' },
  qrMainButton: { width: width * 0.4, height: width * 0.4, borderRadius: width * 0.2, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#A5D6A7' },
  scanLabel: { color: '#000000', marginTop: 5, fontSize: 14, fontWeight: 'bold' },
  mapSection: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  overviewTitle: { fontSize: 18, color: '#000000', fontWeight: 'bold' },
  seeAll: { color: '#000000', textDecorationLine: 'underline' },
  bigMapCard: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#C8E6C9' },
  mapImg: { width: '100%', height: '100%' },
  mapOverlayLabel: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255, 255, 255, 0.8)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  mapFooterText: { color: '#000000', fontWeight: 'bold' },
  
  // FULL MAP STYLES
  fullMapOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  fullMapContainer: { width: '95%', height: '80%', backgroundColor: '#F1F8E9', borderRadius: 25, padding: 15, alignItems: 'center' },
  fullMapHeader: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  fullMapImage: { width: '100%', height: '90%', borderRadius: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#F1F8E9', padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalTitle: { fontSize: 20, color: '#000000', marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  floorBtn: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: '#C8E6C9', alignItems: 'center' },
  floorBtnText: { color: '#000000', fontSize: 16, fontWeight: '600' },
  cancelBtn: { marginTop: 10, padding: 15, alignItems: 'center' },
  cancelText: { color: '#000000' },
  alertOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { width: '80%', backgroundColor: '#FFF', borderRadius: 20, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#000000' },
  alertTitle: { fontSize: 20, color: '#000000', marginBottom: 10, fontWeight: 'bold' },
  alertMessage: { color: '#000000', textAlign: 'center', marginBottom: 20, fontSize: 16 },
  alertBtn: { backgroundColor: '#000000', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 10 },
  alertBtnText: { color: '#FFFFFF' },
});