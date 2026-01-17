import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Auditorium destinations data
const AUDITORIUM_DATA = [
  {
    id: 'aud_stage',
    title: 'Auditorium Stage',
    block: 'Auditorium',
    floor: 'Ground',
    image: require('../assets/auditorium_map.png'),
    maxSteps: 42,
    distanceInMeters: 32.0,
    angle: 171,
    targetCoord: { x: 50, y: 3.2 },
    startCoord: { x: 50, y: 95 },
    pathPoints: "50,95 50,3.2",
    voiceGuidance: "Origin Locked. Walk 32 meters straight to reach the stage.",
    icon: 'stage',
    color: '#FFB6C1', // Pastel Pink
  },
  {
    id: 'aud_green_room',
    title: 'Green Room',
    block: 'Auditorium',
    floor: 'Ground',
    image: require('../assets/auditorium_map.png'),
    maxSteps: 16,
    distanceInMeters: 12.2,
    angle: 81,
    targetCoord: { x: 40, y: 40 },
    startCoord: { x: 50, y: 95 },
    pathPoints: "50,95 50,60 40,60 40,40",
    voiceGuidance: "Walk 4 steps forward then turn left for the Green Room.",
    icon: 'door',
    color: '#98FB98', // Pastel Green
    hasOptions: true,
    options: [
      {
        id: 'aud_green_left',
        title: 'Left Green Room',
        pathPoints: "50,95 50,60 20,60 20,40",
        targetCoord: { x: 20, y: 40 },
      },
      {
        id: 'aud_green_right',
        title: 'Right Green Room',
        pathPoints: "50,95 50,60 80,60 80,40",
        targetCoord: { x: 80, y: 40 },
      }
    ]
  },
  {
    id: 'aud_emergency_exit',
    title: 'Emergency Exit',
    block: 'Auditorium',
    floor: 'Ground',
    image: require('../assets/auditorium_map.png'),
    maxSteps: 20,
    distanceInMeters: 15.2,
    angle: 251,
    targetCoord: { x: 80, y: 20 },
    startCoord: { x: 50, y: 95 },
    pathPoints: "50,95 50,70 80,70 80,20",
    voiceGuidance: "Emergency exit located on the right wall, 15 meters ahead.",
    icon: 'exit-run',
    color: '#ADD8E6', // Pastel Blue
  },
];

export default function FloorSelection({ route, onSelect, onBack }) {
  const { area, scannedLocation, qrData } = route.params;
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [greenRoomModal, setGreenRoomModal] = useState(false);
  
  // Check if QR code contains "Auditorium Entrance - aud_entrance"
  const isAuditoriumEntrance = qrData?.includes('Auditorium Entrance') || 
                               qrData?.includes('aud_entrance') ||
                               scannedLocation?.includes('aud_entrance');

  const handleDestinationSelect = (destination, option = null) => {
    let finalDestination = { ...destination };
    
    // If there's an option selected (for Green Room), update the path
    if (option) {
      finalDestination = {
        ...finalDestination,
        id: option.id,
        title: option.title,
        pathPoints: option.pathPoints,
        targetCoord: option.targetCoord,
      };
    }
    
    setSelectedDestination(finalDestination);
    onSelect({
      ...finalDestination,
      startPoint: scannedLocation || 'aud_entrance',
      area: area || 'Auditorium Indoor Navigation'
    });
  };

  const filteredDestinations = AUDITORIUM_DATA.filter(destination =>
    destination.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>RaahVia</Text>
            <Text style={styles.headerSubtitle}>SBU Ranchi Campus</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Welcome Message */}
          {isAuditoriumEntrance && (
            <View style={styles.welcomeCard}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#4CAF50" />
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>QR Code Verified!</Text>
                <Text style={styles.welcomeSubtitle}>
                  Auditorium Entrance scanned successfully
                </Text>
              </View>
            </View>
          )}

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Where to next?</Text>
            <Text style={styles.locationText}>
              {isAuditoriumEntrance ? 'Auditorium Indoor Navigation' : area || 'Select Destination'}
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for people or places..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          {/* Destinations Grid */}
          <View style={styles.destinationsContainer}>
            {filteredDestinations.map((destination) => (
              <TouchableOpacity
                key={destination.id}
                style={[
                  styles.destinationCard,
                  { backgroundColor: destination.color || '#FFF' }
                ]}
                onPress={() => {
                  if (destination.hasOptions) {
                    setGreenRoomModal(true);
                  } else {
                    handleDestinationSelect(destination);
                  }
                }}
              >
                <View style={styles.destinationIconContainer}>
                  <MaterialCommunityIcons 
                    name={destination.icon} 
                    size={28} 
                    color="#000" 
                  />
                </View>
                <Text style={styles.destinationTitle}>{destination.title}</Text>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>
                    {destination.distanceInMeters}m
                  </Text>
                </View>
                {destination.hasOptions && (
                  <View style={styles.optionsIndicator}>
                    <Text style={styles.optionsText}>Tap to choose side</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={18} color="#666" />
              <Text style={styles.infoText}>
                Current Location: Main Entrance - Auditorium
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={18} color="#666" />
              <Text style={styles.infoText}>
                Select a destination to begin indoor navigation
              </Text>
            </View>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Green Room Options Modal */}
        <Modal
          visible={greenRoomModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setGreenRoomModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Green Room</Text>
                <TouchableOpacity 
                  onPress={() => setGreenRoomModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDescription}>
                Choose which Green Room you want to navigate to
              </Text>
              
              {AUDITORIUM_DATA.find(d => d.id === 'aud_green_room')?.options?.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.optionCard}
                  onPress={() => {
                    setGreenRoomModal(false);
                    handleDestinationSelect(
                      AUDITORIUM_DATA.find(d => d.id === 'aud_green_room'),
                      option
                    );
                  }}
                >
                  <MaterialCommunityIcons 
                    name="door-open" 
                    size={24} 
                    color="#000" 
                  />
                  <Text style={styles.optionText}>{option.title}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  welcomeTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  titleContainer: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },
  destinationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  destinationCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  destinationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  distanceBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  optionsIndicator: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  optionsText: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
});