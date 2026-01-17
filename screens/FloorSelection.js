import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ChevronRight, ChevronDown, MapPin, ArrowLeft } from 'lucide-react-native';

export default function FloorSelection({ route, navigation }) {
  const { targetZone } = route.params || {};
  const [washroomOpen, setWashroomOpen] = useState(false);

  // ✅ SAFETY FIX (unchanged)
  const selectDestination = (destination) => {
    navigation.push('MapScreen', {
      destination,
    });
  };

  const renderDestinations = () => {
    switch (targetZone) {

      case 'pharm_g_entrance':
        return (
          <>
            <Text style={styles.subHeader}>Pharmacy – Ground Floor</Text>

            <TouchableOpacity style={styles.btn} onPress={() => selectDestination('pharm_principal')}>
              <Text style={styles.btnText}>Principal Room</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => selectDestination('pharm_office')}>
              <Text style={styles.btnText}>Office</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>
          </>
        );

      case 'pharm_1_stairs':
        return (
          <>
            <Text style={styles.subHeader}>Pharmacy – 1st Floor</Text>

            <TouchableOpacity style={styles.btn} onPress={() => selectDestination('pharm_boys_common')}>
              <Text style={styles.btnText}>Boys Common Room</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => selectDestination('pharm_girls_common')}>
              <Text style={styles.btnText}>Girls Common Room</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>
          </>
        );

      case 'pharm_2_elevator':
        return (
          <>
            <Text style={styles.subHeader}>Pharmacy – 2nd Floor</Text>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#20C997' }]}
              onPress={() => selectDestination('pharm_library')}
            >
              <Text style={styles.btnText}>Library</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>
          </>
        );

      case 'aud_entrance':
        return (
          <>
            <Text style={styles.subHeader}>Auditorium – Select Destination</Text>

            {/* Stage */}
            <TouchableOpacity style={styles.btn} onPress={() => selectDestination('aud_stage')}>
              <MapPin color="white" size={20} />
              <Text style={styles.btnText}>Auditorium Stage</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>

            {/* Left Green Room */}
            <TouchableOpacity style={styles.btn} onPress={() => selectDestination('aud_green_left')}>
              <MapPin color="white" size={20} />
              <Text style={styles.btnText}>Left Green Room</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>

            {/* ✅ Right Green Room (FIXED) */}
            <TouchableOpacity style={styles.btn} onPress={() => selectDestination('aud_green_right')}>
              <MapPin color="white" size={20} />
              <Text style={styles.btnText}>Right Green Room</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>

            {/* Washrooms */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#20C997' }]}
              onPress={() => setWashroomOpen(!washroomOpen)}
            >
              <MapPin color="white" size={20} />
              <Text style={styles.btnText}>Washrooms</Text>
              <ChevronDown
                color="white"
                size={20}
                style={{ transform: [{ rotate: washroomOpen ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>

            {washroomOpen && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.subBtn} onPress={() => selectDestination('aud_washroom_boys')}>
                  <Text style={styles.subBtnText}>• Boys Washroom (Left)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.subBtn} onPress={() => selectDestination('aud_washroom_girls')}>
                  <Text style={styles.subBtnText}>• Girls Washroom (Right)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Emergency Exit */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#FD7E14' }]}
              onPress={() => selectDestination('aud_emergency_exit')}
            >
              <MapPin color="white" size={20} />
              <Text style={styles.btnText}>Emergency Exit</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>
          </>
        );

      default:
        return (
          <Text style={styles.errorText}>
            Please scan a valid campus QR code to see destinations.
          </Text>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
      >
        <ArrowLeft color="#666" size={24} />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Where to next?</Text>
      <ScrollView>{renderDestinations()}</ScrollView>
    </View>
  );
}

/* ================= Styles ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  backText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },

  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  subHeader: { fontSize: 18, fontWeight: '600', marginVertical: 12 },
  btn: {
    backgroundColor: '#0D6EFD',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  btnText: { color: 'white', fontSize: 15, flex: 1, marginLeft: 10 },
  dropdown: { marginLeft: 10, marginBottom: 10 },
  subBtn: { paddingVertical: 8 },
  subBtnText: { fontSize: 14, color: '#333' },
  errorText: { textAlign: 'center', marginTop: 30, color: '#888' },
});
