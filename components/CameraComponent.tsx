import { GestureSmoother, recognizeGesture, type HandLandmark, type HandPose } from '@/utils/gestureRecognizer';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const CameraComponent = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<string>('');
  const [gestureDescription, setGestureDescription] = useState<string>('');
  const [fps, setFps] = useState<number>(22);
  const [handDetected, setHandDetected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Place your hand in the detection area');
  const [gestureConfidence, setGestureConfidence] = useState<number>(0);
  
  const frameCountRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gestureSmoother = useRef(new GestureSmoother());
  const detectionFrameCountRef = useRef(0);

  // Gesture history for display
  const [gestureHistory, setGestureHistory] = useState<string[]>([]);

  // Gesture descriptions for reference
  const gestureDescriptions: Record<string, string> = {
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

  // Handle manual gesture detection when user signals
  const handleGestureDetection = () => {
    if (!isModelLoaded) return;

    // Simulate hand detection by creating mock hand pose
    // In a real implementation, this would analyze actual video frames
    const mockHandPose = generateMockHandPose();
    
    // Use actual gesture recognition
    const result = recognizeGesture(mockHandPose);
    
    if (result) {
      setDetectedGesture(result.gesture);
      setGestureDescription(result.description);
      setGestureConfidence(result.confidence);
      setStatusMessage(`Gesture Detected: ${result.gesture} (${(result.confidence * 100).toFixed(0)}%)`);
      
      // Add to history
      setGestureHistory(prev => [result.gesture, ...prev.slice(0, 4)]);
    }
    
    setHandDetected(false);
    
    // Clear previous timeout if exists
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Auto-clear after 3 seconds
    timeoutRef.current = setTimeout(() => {
      setDetectedGesture('');
      setGestureDescription('');
      setGestureConfidence(0);
      setStatusMessage('Place your hand in the detection area');
    }, 3000);
  };

  // Generate mock hand pose data
  // In production, this would be real landmark data from camera
  const generateMockHandPose = (): HandPose => {
    // This creates varying hand poses to simulate different gestures
    // Each gesture type has different landmark patterns
    const detectionFrames = detectionFrameCountRef.current;
    
    // Create base landmarks for open hand (HI gesture)
    const landmarks: HandLandmark[] = [];
    
    // Generate 21 landmarks (standard hand model)
    for (let i = 0; i < 21; i++) {
      let x = 0.5 + Math.random() * 0.3 - 0.15; // Center with variation
      let y = 0.5 + Math.random() * 0.3 - 0.15;
      
      // Vary landmarks based on frame to simulate different gestures
      const variance = (detectionFrames % 30) / 30; // Cycle through 30 frames
      
      // Adjust specific landmarks to create different gestures
      if (i >= 4 && i <= 20) {
        // Finger tips - extend them more based on variance
        const fingerIndex = i - 4;
        y = 0.3 + variance * 0.4; // Tips extend more
      }
      
      landmarks.push({
        x: Math.min(1, Math.max(0, x)),
        y: Math.min(1, Math.max(0, y)),
        z: 0.5,
        visibility: 0.95,
      });
    }
    
    // Randomize slightly to simulate different hand positions
    if (detectionFrames % 15 < 5) {
      // FIST - keep fingers close
      for (let i = 4; i <= 20; i++) {
        landmarks[i].y += 0.3;
      }
    } else if (detectionFrames % 15 < 10) {
      // PEACE - extend only 2 fingers
      for (let i = 4; i <= 20; i++) {
        if (i !== 8 && i !== 12) { // Keep index and middle extended
          landmarks[i].y += 0.3;
        } else {
          landmarks[i].y -= 0.2; // Extend these two
        }
      }
    } else {
      // HI - all fingers extended
      for (let i = 4; i <= 20; i++) {
        landmarks[i].y -= 0.2; // All extend upward
      }
    }
    
    return {
      landmarks,
      handedness: 'Right',
    };
  };

  // FPS counter update
  useEffect(() => {
    if (!isModelLoaded) return;

    const fpsInterval = setInterval(() => {
      frameCountRef.current += 1;
      if (frameCountRef.current % 30 === 0) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const calculatedFps = frameCountRef.current / elapsed;
        setFps(Math.min(calculatedFps, 30));
      }
    }, 33);

    return () => clearInterval(fpsInterval);
  }, [isModelLoaded]);

  // Simulate hand detection in the region (for demo)
  const simulateHandDetection = () => {
    if (!detectedGesture) {
      setHandDetected(true);
      setStatusMessage('Hand detected! Make a gesture...');
      
      setTimeout(() => {
        // Detect gesture after 1 second
        detectionFrameCountRef.current = Math.floor(Math.random() * 30);
        handleGestureDetection();
      }, 1000);
    }
  };

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
        
        {/* Detection Zone Overlay */}
        <View style={styles.detectionZoneOverlay}>
          {/* Detection Square */}
          <View style={[
            styles.detectionZone,
            handDetected && styles.detectionZoneActive
          ]}>
            <Text style={styles.detectionZoneText}>
              {handDetected ? '✓ Hand Detected' : 'Place Hand Here'}
            </Text>
          </View>
        </View>
        
        <View style={styles.overlay}>
          <View style={styles.statusBox}>
            <Text style={styles.fpsText}>FPS: {fps.toFixed(1)}</Text>
          </View>
          
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>{statusMessage}</Text>
          </View>
        </View>
        
        {/* Tap to Signal Button - appears when model is loaded */}
        <TouchableOpacity 
          style={styles.signalButton}
          onPress={simulateHandDetection}
          disabled={detectedGesture !== ''}
        >
          <Text style={styles.signalButtonText}>
            {detectedGesture ? 'Processing...' : 'Tap Here to Signal'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>Detected Gesture</Text>
        {detectedGesture ? (
          <View style={styles.gestureBox}>
            <Text style={styles.gestureName}>{detectedGesture}</Text>
            <Text style={styles.gestureDescription}>{gestureDescription}</Text>
            {gestureConfidence > 0 && (
              <Text style={styles.confidenceText}>Confidence: {(gestureConfidence * 100).toFixed(0)}%</Text>
            )}
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
  detectionZoneOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  detectionZone: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: '#FFC107',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    zIndex: 60,
  },
  detectionZoneActive: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 4,
  },
  detectionZoneText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  instructionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 8,
    minWidth: 150,
  },
  instructionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  signalButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    zIndex: 100,
  },
  signalButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
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
  confidenceText: {
    fontSize: 11,
    color: '#689f38',
    marginTop: 6,
    fontWeight: '600',
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
