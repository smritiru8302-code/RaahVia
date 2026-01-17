import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native'; 
import { Pedometer, DeviceMotion, Magnetometer, Gyroscope } from 'expo-sensors';
import * as Speech from 'expo-speech';
import Svg, { Line, Circle } from 'react-native-svg';
import { Navigation as NavIcon } from 'lucide-react-native';

// --- ADDED THIS LINE HERE ---
import Slider from '@react-native-community/slider'; 

const { width, height } = Dimensions.get('window');

const STEP_TO_M = 0.762; 
const SCALE_FACTOR = 45;

export default function MapScreen({ data }) {
  const [steps, setSteps] = useState(0);
  const [heading, setHeading] = useState(0);
  const [hasSensors, setHasSensors] = useState(true); // Track sensor availability
  
  const startX = width / 2;
  const startY = height * 0.65;

  const targetX = startX + (data?.targetCoord?.x * SCALE_FACTOR * 10);
  const targetY = startY - (data?.targetCoord?.y * SCALE_FACTOR * 10);

  const [currentPos, setCurrentPos] = useState({ x: startX, y: startY });

  useEffect(() => {
    // --- SAMSUNG A12 SAFETY CHECK ---
    const checkHardware = async () => {
      const isCompassAvailable = await Magnetometer.isAvailableAsync();
      const isGyroAvailable = await Gyroscope.isAvailableAsync();
      if (!isCompassAvailable || !isGyroAvailable) {
        setHasSensors(false);
        console.log("Hardware sensors not found. Map rotation disabled.");
      }
    };
    checkHardware();

    if (data) {
      Speech.speak(`Navigating to ${data.title}. ${data.voiceGuidance}`);
    }

    const pedSub = Pedometer.watchStepCount(result => {
      setSteps(result.steps);
      const rad = (heading * Math.PI) / 180;
      setCurrentPos(prev => ({
        x: prev.x + (STEP_TO_M * Math.sin(rad) * SCALE_FACTOR),
        y: prev.y - (STEP_TO_M * Math.cos(rad) * SCALE_FACTOR)
      }));

      if (result.steps > 0 && result.steps % 20 === 0) {
        Speech.speak(`${Math.floor(result.steps * STEP_TO_M)} meters covered.`);
      }
    });

    // Only listen to motion if hardware is capable
    let motionSub = null;
    if (hasSensors) {
      motionSub = DeviceMotion.addListener(motion => {
        if (motion.rotation) {
          const deg = (motion.rotation.beta * 180) / Math.PI;
          setHeading(Math.floor(deg));
        }
      });
    }

    return () => {
      pedSub.remove();
      if (motionSub) motionSub.remove();
      Speech.stop();
    };
  }, [data, heading, hasSensors]); 

  if (!data) return (
    <View style={styles.loading}><Text>Waiting for destination data...</Text></View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.destName}>{data.title}</Text>
        <Text style={styles.destSub}>{data.block} • {data.floor} Floor</Text>
      </View>

      <View style={styles.mapContainer}>
        <Image source={data.image} style={styles.mapImage} resizeMode="contain" />
        
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Line
            x1={startX} y1={startY}
            x2={targetX} y2={targetY}
            stroke="#FF4757" strokeWidth="3" strokeDasharray="10, 6"
          />
          <Circle 
            cx={targetX} cy={targetY} 
            r="12" fill="#FF4757" stroke="#fff" strokeWidth="3"
          />
        </Svg>

        <View style={[styles.userMarker, { 
          left: currentPos.x - 15, 
          top: currentPos.y - 15,
          transform: [{ rotate: `${heading}deg` }] 
        }]}>
          <NavIcon color="#2E86DE" size={30} fill="#2E86DE" />
        </View>

        {/* --- MANUAL FALLBACK FOR SAMSUNG A12 --- */}
        {!hasSensors && (
          <View style={styles.manualRotationBox}>
            <Text style={styles.sensorWarning}>No Compass Found: Use Slider to Rotate</Text>
            <Slider
              style={{width: 200, height: 40}}
              minimumValue={0}
              maximumValue={360}
              minimumTrackTintColor="#6C5CE7"
              maximumTrackTintColor="#000000"
              onValueChange={(val) => setHeading(Math.floor(val))}
            />
          </View>
        )}
      </View>

      <View style={styles.dataFooter}>
        <View style={styles.statLine}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{(steps * STEP_TO_M).toFixed(1)}m</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statLine}>
          <Text style={styles.statLabel}>Steps</Text>
          <Text style={styles.statValue}>{steps}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statLine}>
          <Text style={styles.statLabel}>Heading</Text>
          <Text style={styles.statValue}>{heading}°</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topHeader: { padding: 20, paddingTop: 50, backgroundColor: '#6C5CE7', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 8 },
  destName: { color: '#fff', fontSize: 22 },
  destSub: { color: '#DCDDE1', fontSize: 14, marginTop: 4 },
  mapContainer: { flex: 1, backgroundColor: '#f9f9f9', overflow: 'hidden' },
  mapImage: { width: '100%', height: '100%', opacity: 0.3 },
  userMarker: { position: 'absolute', width: 30, height: 30, zIndex: 10 },
  dataFooter: { flexDirection: 'row', backgroundColor: '#2F3542', margin: 20, padding: 20, borderRadius: 20, justifyContent: 'space-around', alignItems: 'center', position: 'absolute', bottom: 80, left: 10, right: 10, elevation: 10 },
  statLine: { alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#A4B0BE', textTransform: 'uppercase', marginBottom: 5 },
  statValue: { fontSize: 20, color: '#fff' },
  separator: { width: 1, height: 30, backgroundColor: '#57606F' },
  manualRotationBox: { position: 'absolute', top: 20, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  sensorWarning: { fontSize: 10, color: '#FF4757', marginBottom: 5 }
});