/**
 * EXTENDING THE SIGN LANGUAGE INTERPRETER
 * 
 * This file shows examples of how to add custom gestures,
 * change detection parameters, and customize the UI.
 */

// ============================================
// EXAMPLE 1: Adding a Custom Gesture
// ============================================

// Add this to utils/gestureRecognizer.ts:

import { HandLandmark } from './gestureRecognizer';

// Example: Recognize "WATER" gesture - repetitive hand motion
function recognizeWater(landmarks: HandLandmark[]): number {
  // Check if index and middle fingers are extended
  const indexExtended = landmarks[8].y < landmarks[6].y - 0.05;
  const middleExtended = landmarks[12].y < landmarks[10].y - 0.05;
  
  // Check hand position (mid-to-lower area)
  const handY = landmarks[0].y;
  if (indexExtended && middleExtended && handY > 0.4) {
    return 0.8;
  }
  return 0;
}

// Then add to the gestures object in recognizeGesture():
// WATER: { confidence: recognizeWater(landmarks), description: "Water gesture - flowing motion" }


// ============================================
// EXAMPLE 2: Increasing Detection Sensitivity
// ============================================

// In components/CameraComponent.tsx, modify the confidence threshold:
// Current: if (result && result.confidence > 0.6) {
// More sensitive: if (result && result.confidence > 0.4) {
// Less sensitive: if (result && result.confidence > 0.8) {


// ============================================
// EXAMPLE 3: Adding UI Feedback
// ============================================

// In components/CameraComponent.tsx, add sound feedback:

import { Audio } from 'expo-av';

// Add this in useEffect:
const loadSound = async () => {
  const { sound } = await Audio.Sound.createAsync(
    require('../assets/sounds/gesture-detected.mp3')
  );
  soundRef.current = sound;
};

// Then play sound when gesture detected:
const playSound = async () => {
  if (soundRef.current) {
    await soundRef.current.replayAsync();
  }
};

// Call playSound() when gesture is recognized:
if (smoothedGesture && smoothedGesture !== lastRecognitionRef.current) {
  await playSound(); // Add this line
  setDetectedGesture(smoothedGesture);
  // ...
}


// ============================================
// EXAMPLE 4: Adding Real-time Feedback
// ============================================

// Add vibration feedback to gestures:

import * as Haptics from 'expo-haptics';

// When gesture is recognized:
if (smoothedGesture && smoothedGesture !== lastRecognitionRef.current) {
  // Light vibration on gesture detect
  await Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success
  );
  setDetectedGesture(smoothedGesture);
}


// ============================================
// EXAMPLE 5: Improving Hand Detection Accuracy
// ============================================

// Create a more robust gesture smoother:

class AdvancedGestureSmoother {
  private gestureBuffer: Array<{ gesture: string; confidence: number; timestamp: number }> = [];
  private timeWindowMs = 500; // 500ms window

  updateGesture(gesture: string | null, confidence: number): string | null {
    const now = Date.now();
    
    // Remove old entries
    this.gestureBuffer = this.gestureBuffer.filter(
      g => now - g.timestamp < this.timeWindowMs
    );

    if (gesture && confidence > 0.6) {
      this.gestureBuffer.push({ gesture, confidence, timestamp: now });

      // Count occurrences
      const counts = new Map<string, number>();
      this.gestureBuffer.forEach(g => {
        counts.set(g.gesture, (counts.get(g.gesture) || 0) + 1);
      });

      // Return gesture if appeared 3+ times
      for (const [gest, count] of counts) {
        if (count >= 3) return gest;
      }
    }

    return null;
  }
}


// ============================================
// EXAMPLE 6: Performance Monitoring
// ============================================

// Add detailed performance metrics:

class PerformanceMonitor {
  private frameTime: number[] = [];
  private detectionTime: number[] = [];

  recordFrameTime(ms: number) {
    this.frameTime.push(ms);
    if (this.frameTime.length > 30) this.frameTime.shift();
  }

  recordDetectionTime(ms: number) {
    this.detectionTime.push(ms);
    if (this.detectionTime.length > 30) this.detectionTime.shift();
  }

  getAverageFrameTime(): number {
    return this.frameTime.reduce((a, b) => a + b, 0) / this.frameTime.length;
  }

  getAverageDetectionTime(): number {
    return this.detectionTime.reduce((a, b) => a + b, 0) / this.detectionTime.length;
  }

  getMetrics() {
    return {
      avgFrameTime: this.getAverageFrameTime().toFixed(2) + 'ms',
      avgDetectionTime: this.getAverageDetectionTime().toFixed(2) + 'ms',
      fps: (1000 / this.getAverageFrameTime()).toFixed(1),
    };
  }
}


// ============================================
// EXAMPLE 7: Two-Hand Gestures
// ============================================

// Support detecting gestures with both hands:

interface TwoHandPose {
  leftHand: HandLandmark[];
  rightHand: HandLandmark[];
}

function recognizePray(pose: TwoHandPose): number {
  // Both hands together, fingers pointing up
  const leftHandX = pose.leftHand[9].x; // Left hand MCP
  const rightHandX = pose.rightHand[9].x; // Right hand MCP

  // Check if hands are close together
  if (Math.abs(leftHandX - rightHandX) < 0.2) {
    // Check if fingers are extended up
    const leftExtended = pose.leftHand[8].y < pose.leftHand[6].y;
    const rightExtended = pose.rightHand[8].y < pose.rightHand[6].y;

    if (leftExtended && rightExtended) {
      return 0.9;
    }
  }

  return 0;
}


// ============================================
// EXAMPLE 8: Gesture with Confidence Display
// ============================================

// Enhanced UI component showing all detection scores:

/*
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';

const GestureDebugger = ({ scores }: { scores: Record<string, number> }) => (
  <ScrollView style={{ backgroundColor: '#f0f0f0', padding: 10, maxHeight: 150 }}>
    {Object.entries(scores).map(([gesture, confidence]) => (
      <View key={gesture} style={{ marginBottom: 5 }}>
        <Text>{gesture}: {(confidence * 100).toFixed(1)}%</Text>
        <View style={{ height: 4, backgroundColor: '#ddd', borderRadius: 2 }}>
          <View
            style={{
              height: 4,
              backgroundColor: confidence > 0.6 ? '#4caf50' : '#f44336',
              width: `${confidence * 100}%`,
              borderRadius: 2,
            }}
          />
        </View>
      </View>
    ))}
  </ScrollView>
);
*/


// ============================================
// EXAMPLE 9: Custom Gesture Profiles
// ============================================

// Create gesture profiles for different sign languages:

const ASL_PROFILE = {
  // American Sign Language specifics
  HI: { confidence: 0.75, description: 'Wave hand' },
  HELLO: { confidence: 0.8, description: 'Touch forehead' },
};

const BSL_PROFILE = {
  // British Sign Language specifics
  HI: { confidence: 0.8, description: 'Two-handed wave' },
  HELLO: { confidence: 0.75, description: 'Hand to chest' },
};

// Switch profiles based on user preference
const useGestureProfile = (language: 'ASL' | 'BSL') => {
  return language === 'ASL' ? ASL_PROFILE : BSL_PROFILE;
};


// ============================================
// EXAMPLE 10: Gesture Recording & Playback
// ============================================

// Record gesture sequences and save them:

interface GestureSequence {
  gestures: string[];
  timestamps: number[];
  duration: number;
}

class GestureRecorder {
  private sequence: GestureSequence = {
    gestures: [],
    timestamps: [],
    duration: 0,
  };
  private startTime: number = 0;

  start() {
    this.startTime = Date.now();
    this.sequence = { gestures: [], timestamps: [], duration: 0 };
  }

  recordGesture(gesture: string) {
    this.sequence.gestures.push(gesture);
    this.sequence.timestamps.push(Date.now() - this.startTime);
  }

  stop(): GestureSequence {
    this.sequence.duration = Date.now() - this.startTime;
    return this.sequence;
  }

  async saveSequence(filename: string) {
    // Save to device storage
    const data = JSON.stringify(this.sequence);
    // Implementation depends on storage solution
    return data;
  }
}

export {
    AdvancedGestureSmoother, GestureRecorder, PerformanceMonitor, recognizeWater, useGestureProfile
};

