import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { Polyline, Polygon, Circle } from 'react-native-svg';
import {
  Accelerometer,
  Gyroscope,
  Magnetometer,
  Pedometer,
} from 'expo-sensors';
import * as Speech from 'expo-speech';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function MapScreen({ route, data: propData }) {
  // Use route.params if available (React Navigation), otherwise use propData
  const data = route?.params?.data || propData;
  const [heading, setHeading] = useState(0);
  const [userSteps, setUserSteps] = useState(0);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [isNavigating, setIsNavigating] = useState(true);
  const [hasArrived, setHasArrived] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [useManualSteps, setUseManualSteps] = useState(false); // Toggle between auto and manual step detection

  // Parse path points from string to array
  const parsePathPoints = (pointsString) => {
    return pointsString.split(' ').map(point => {
      const [x, y] = point.split(',').map(Number);
      return { x, y };
    });
  };

  const pathPoints = data?.pathPoints ? parsePathPoints(data.pathPoints) : [];
  const startPoint = data?.startCoord || { x: 50, y: 95 };
  const endPoint = data?.targetCoord || { x: 50, y: 20 };

  // Calculate current position based on steps
  const calculateCurrentPosition = () => {
    if (pathPoints.length < 2 || userSteps >= data.maxSteps) {
      return endPoint;
    }

    const totalDistance = data.distanceInMeters;
    const distancePerStep = totalDistance / data.maxSteps;
    const currentDistance = userSteps * distancePerStep;

    // Find which segment we're on
    let accumulatedDistance = 0;
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const p1 = pathPoints[i];
      const p2 = pathPoints[i + 1];
      
      // Calculate distance between points (assuming 100 units = total map)
      const segmentDistance = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );
      
      if (accumulatedDistance + segmentDistance >= currentDistance) {
        // We're on this segment
        const ratio = (currentDistance - accumulatedDistance) / segmentDistance;
        return {
          x: p1.x + (p2.x - p1.x) * ratio,
          y: p1.y + (p2.y - p1.y) * ratio,
        };
      }
      accumulatedDistance += segmentDistance;
    }
    
    return endPoint;
  };

  const currentPosition = calculateCurrentPosition();

  // Handle SVG layout
  const onSvgLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setSvgDimensions({ width, height });
  };

  // Sensor setup
  useEffect(() => {
    let isMounted = true;
    let stepCount = 0;
    let lastStepTime = Date.now();
    // Increased threshold from 0.5 to 2.5 to prevent false step detection from vibrations
    // Only real walking movements will trigger steps now
    const stepThreshold = 2.5;

    // Setup sensors
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);
    Magnetometer.setUpdateInterval(100);

    const accelerometerSubscription = Accelerometer.addListener(data => {
      if (!isMounted || isPaused || hasArrived || useManualSteps) return; // Skip if using manual mode

      // Simple step detection using acceleration magnitude
      const magnitude = Math.sqrt(
        data.x * data.x + data.y * data.y + data.z * data.z
      );
      
      const currentTime = Date.now();
      if (magnitude > stepThreshold && currentTime - lastStepTime > 300) {
        // Detected a step
        lastStepTime = currentTime;
        if (isMounted) {
          setUserSteps(prev => {
            const newSteps = prev + 1;
            
            // Check if arrived
            if (newSteps >= data.maxSteps) {
              setHasArrived(true);
              setIsNavigating(false);
              Speech.speak(`You have arrived at ${data.title}`);
            }
            
            return newSteps;
          });
        }
      }
    });

    const magnetometerSubscription = Magnetometer.addListener(data => {
      if (!isMounted || isPaused) return;
      
      // Calculate heading from magnetometer
      let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
      angle = angle < 0 ? angle + 360 : angle;
      
      // Adjust for phone orientation (portrait)
      angle = (angle + 360 - 90) % 360;
      
      if (isMounted) {
        setHeading(angle);
      }
    });

    // Gyroscope for rotation smoothing
    const gyroscopeSubscription = Gyroscope.addListener(() => {
      // Could be used for more accurate rotation tracking
    });

    // Start navigation voice guidance
    Speech.speak(data.voiceGuidance || "Navigation started. Start walking.");

    return () => {
      isMounted = false;
      accelerometerSubscription?.remove();
      magnetometerSubscription?.remove();
      gyroscopeSubscription?.remove();
      Speech.stop();
    };
  }, [isPaused, hasArrived]);

  // Check if arrived
  useEffect(() => {
    if (userSteps >= data.maxSteps && !hasArrived) {
      setHasArrived(true);
      setIsNavigating(false);
      Speech.speak(`You have arrived at ${data.title}`);
    }
  }, [userSteps, hasArrived]);

  const handlePause = () => {
    setIsPaused(!isPaused);
    Speech.speak(isPaused ? "Navigation resumed" : "Navigation paused");
  };

  const handleStop = () => {
    setIsNavigating(false);
    Speech.speak("Navigation stopped");
  };

  const handleManualStep = () => {
    setUserSteps(prev => {
      const newSteps = prev + 1;
      
      // Check if arrived
      if (newSteps >= data.maxSteps) {
        setHasArrived(true);
        setIsNavigating(false);
        Speech.speak(`You have arrived at ${data.title}`);
      }
      
      return newSteps;
    });
  };

  const toggleStepMode = () => {
    setUseManualSteps(!useManualSteps);
    Speech.speak(useManualSteps ? "Switched to automatic step detection" : "Switched to manual step mode");
  };

  // Safety check for missing data
  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Navigation Error</Text>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Ionicons name="alert-circle" size={60} color="#FF6B6B" />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>No Location Data</Text>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10 }}>
              Please scan a QR code or select a location to start navigation.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const progressPercentage = Math.min((userSteps / data.maxSteps) * 100, 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => {}}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>{data.title}</Text>
            <Text style={styles.headerSubtitle}>
              {hasArrived ? 'Arrived!' : `${userSteps}/${data.maxSteps} steps • ${data.distanceInMeters}m`}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mapContainer}>
            <View style={styles.mapWrapper} onLayout={onSvgLayout}>
              <Image 
                source={data.image} 
                style={styles.mapImage} 
                resizeMode="contain"
              />
              
              <Svg
                width={svgDimensions.width || '100%'}
                height={svgDimensions.height || '100%'}
                viewBox="0 0 100 100"
                style={styles.svgOverlay}
              >
                {/* Red dotted path */}
                <Polyline
                  points={data.pathPoints || "50,95 50,20"}
                  fill="none"
                  stroke="red"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />

                {/* Start point (Blue dot) */}
                <Circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="2"
                  fill="#4A90E2"
                  stroke="white"
                  strokeWidth="1"
                />

                {/* End point (Green dot) */}
                <Circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="2"
                  fill="#50C878"
                  stroke="white"
                  strokeWidth="1"
                />

                {/* User arrow */}
                <Polygon
                  points="0,-2 -2,2 0,1 2,2"
                  fill="#FF6B6B"
                  stroke="white"
                  strokeWidth="0.5"
                  transform={`
                    translate(${currentPosition.x}, ${currentPosition.y})
                    rotate(${heading})
                  `}
                />
              </Svg>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${progressPercentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(progressPercentage)}% Complete
              </Text>
            </View>
          </View>

          {/* Stats Container */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F4FD' }]}>
                <Ionicons name="walk" size={18} color="#4A90E2" />
              </View>
              <Text style={styles.statValue}>{userSteps}</Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#FFE8E8' }]}>
                <Ionicons name="compass" size={18} color="#FF6B6B" />
              </View>
              <Text style={styles.statValue}>{Math.round(heading)}°</Text>
              <Text style={styles.statLabel}>Heading</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F8F0' }]}>
                <MaterialCommunityIcons name="target" size={18} color="#50C878" />
              </View>
              <Text style={styles.statValue}>
                {data.distanceInMeters - (userSteps * (data.distanceInMeters / data.maxSteps)).toFixed(1)}m
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.controlButton, isPaused ? styles.resumeButton : styles.pauseButton]}
              onPress={handlePause}
            >
              <Ionicons 
                name={isPaused ? "play" : "pause"} 
                size={22} 
                color={isPaused ? "#4A90E2" : "#FFA500"} 
              />
              <Text style={[
                styles.controlButtonText,
                { color: isPaused ? "#4A90E2" : "#FFA500" }
              ]}>
                {isPaused ? "Resume" : "Pause"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStop}
            >
              <Ionicons name="stop" size={22} color="#FF6B6B" />
              <Text style={[styles.controlButtonText, { color: "#FF6B6B" }]}>
                Stop
              </Text>
            </TouchableOpacity>
          </View>

          {/* Step Mode Controls */}
          <View style={styles.modeContainer}>
            <TouchableOpacity 
              style={[styles.modeButton, useManualSteps && styles.modeButtonActive]}
              onPress={toggleStepMode}
            >
              <MaterialCommunityIcons 
                name={useManualSteps ? "hand-okay" : "walk"} 
                size={20} 
                color={useManualSteps ? "#FFA500" : "#666"} 
              />
              <Text style={[
                styles.modeButtonText,
                useManualSteps && styles.modeButtonTextActive
              ]}>
                {useManualSteps ? "Manual Mode" : "Auto Mode"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual Step Button (only show in manual mode) */}
          {useManualSteps && (
            <TouchableOpacity 
              style={styles.manualStepButton}
              onPress={handleManualStep}
            >
              <MaterialCommunityIcons name="plus-circle" size={30} color="white" />
              <Text style={styles.manualStepButtonText}>Add Step</Text>
            </TouchableOpacity>
          )}

          {/* Instructions */}
          <View style={styles.instructions}>
            <MaterialCommunityIcons name="information" size={20} color="#666" />
            <Text style={styles.instructionsText}>
              Hold your phone straight and walk normally. The arrow will guide you along the path.
            </Text>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Arrived Overlay */}
        {hasArrived && (
          <View style={styles.arrivedOverlay}>
            <View style={styles.arrivedContent}>
              <View style={styles.arrivedIconContainer}>
                <Ionicons name="checkmark-circle" size={50} color="#50C878" />
              </View>
              <Text style={styles.arrivedTitle}>You've Arrived!</Text>
              <Text style={styles.arrivedText}>
                You have reached {data.title}
              </Text>
              <TouchableOpacity 
                style={styles.arrivedButton}
                onPress={() => {}}
              >
                <Text style={styles.arrivedButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    minHeight: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  mapContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  mapWrapper: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    borderWidth: 1,
  },
  pauseButton: {
    backgroundColor: '#FFF4E6',
    borderColor: '#FFA500',
  },
  resumeButton: {
    backgroundColor: '#E8F4FD',
    borderColor: '#4A90E2',
  },
  stopButton: {
    backgroundColor: '#FFE8E8',
    borderColor: '#FF6B6B',
  },
  controlButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  arrivedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  arrivedContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  arrivedIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrivedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  arrivedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  arrivedButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
  },
  arrivedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  modeButtonActive: {
    backgroundColor: '#FFF4E6',
    borderColor: '#FFA500',
  },
  modeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#FFA500',
  },
  manualStepButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flexDirection: 'row',
  },
  manualStepButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});