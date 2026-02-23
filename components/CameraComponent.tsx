import { GestureSmoother } from '@/utils/gestureRecognizer';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export const CameraComponent = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<string>('');
  const [gestureDescription, setGestureDescription] = useState<string>('');
  const [fps, setFps] = useState<number>(22);
  
  const smootherRef = useRef(new GestureSmoother());
  const frameCountRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const lastRecognitionRef = useRef<string>('');

  // Gesture history for display
  const [gestureHistory, setGestureHistory] = useState<string[]>([]);

  // Demo gesture sequence
  const demoGestures = ['HI', 'PEACE', 'LOVE_YOU', 'THANK_YOU', 'THUMBS_UP', 'HELP', 'FOOD', 'EAT', 'FIST'];
  const demoDescriptions: Record<string, string> = {
    HI: 'Waving hello with all fingers extended',
    PEACE: 'Peace sign with index and middle finger',
    LOVE_YOU: 'I Love You gesture (ILY sign)',
    THANK_YOU: 'Thank you gesture with open hands',
    THUMBS_UP: 'Thumbs up gesture of approval',
    HELP: 'Open hand asking for help',
    FOOD: 'Hand pointing to mouth for food',
    EAT: 'Eating gesture with hand motion',
    FIST: 'Closed fist gesture',
  };

  useEffect(() => {
    const initializeModel = async () => {
      try {
        // Simulated model loading
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    if (!permission?.granted) {
      requestPermission();
    } else {
      initializeModel();
    }
  }, [permission?.granted, requestPermission]);

  // Simulate gesture detection
  useEffect(() => {
    if (!isModelLoaded) return;

    const interval = setInterval(() => {
      frameCountRef.current += 1;

      // Simulate detecting a gesture every 3-4 seconds
      if (frameCountRef.current % 90 === 0) {
        const randomGesture = demoGestures[Math.floor(Math.random() * demoGestures.length)];
        const confidence = 0.75 + Math.random() * 0.2; // 0.75-0.95
        
        const smoothedGesture = smootherRef.current.updateGesture(randomGesture, confidence);
        
        if (smoothedGesture && smoothedGesture !== lastRecognitionRef.current) {
          setDetectedGesture(smoothedGesture);
          setGestureDescription(demoDescriptions[smoothedGesture] || 'Unknown gesture');
          lastRecognitionRef.current = smoothedGesture;
          
          // Add to history
          setGestureHistory(prev => [smoothedGesture, ...prev.slice(0, 4)]);
        }
      }

      // Calculate FPS
      if (frameCountRef.current % 30 === 0) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const calculatedFps = frameCountRef.current / elapsed;
        setFps(Math.min(calculatedFps, 30)); // Cap at 30 FPS for display
      }
    }, 33); // ~30 FPS simulation

    return () => clearInterval(interval);
  }, [isModelLoaded]);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission required</Text>
        <Text style={styles.permissionSubText}>Please enable camera access to use gesture detection</Text>
      </View>
    );
  }

  if (!isModelLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading hand detection model...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="front"
        />
        
        <View style={styles.overlay}>
          <View style={styles.statusBox}>
            <Text style={styles.fpsText}>FPS: {fps.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>Detected Gesture</Text>
        {detectedGesture ? (
          <View style={styles.gestureBox}>
            <Text style={styles.gestureName}>{detectedGesture}</Text>
            <Text style={styles.gestureDescription}>{gestureDescription}</Text>
          </View>
        ) : (
          <Text style={styles.noGestureText}>No gesture detected</Text>
        )}

        <Text style={styles.sectionTitle}>Available Gestures</Text>
        <ScrollView style={styles.gestureList}>
          <Text style={styles.listItem}>✋ HI - Open hand, all fingers extended</Text>
          <Text style={styles.listItem}>❤️ LOVE YOU - Thumb, index, pinky extended</Text>
          <Text style={styles.listItem}>🙏 HELP - Open palm facing forward</Text>
          <Text style={styles.listItem}>🍽️ FOOD - Hand near mouth area</Text>
          <Text style={styles.listItem}>🥄 EAT - Fingers extended toward mouth</Text>
          <Text style={styles.listItem}>🙌 THANK YOU - Open hands moving outward</Text>
          <Text style={styles.listItem}>✌️ PEACE - Index and middle finger extended</Text>
          <Text style={styles.listItem}>👍 THUMBS UP - Thumb extended upward</Text>
          <Text style={styles.listItem}>✊ FIST - All fingers closed</Text>
        </ScrollView>

        {gestureHistory.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Recent Gestures</Text>
            <ScrollView horizontal style={styles.historyContainer}>
              {gestureHistory.map((gesture, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyText}>{gesture}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cameraContainer: {
    flex: 0.55,
    backgroundColor: '#000',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    zIndex: 100,
  },
  statusBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  fpsText: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 0.45,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  gestureBox: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  gestureName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  gestureDescription: {
    fontSize: 12,
    color: '#558b2f',
    marginTop: 4,
  },
  noGestureText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  gestureList: {
    marginBottom: 12,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fafafa',
  },
  listItem: {
    fontSize: 12,
    color: '#555',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  historyContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  historyItem: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  historyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 40,
  },
  permissionSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
});
