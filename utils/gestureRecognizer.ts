// Gesture Recognition Utility
// This module handles the detection and classification of hand gestures

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface HandPose {
  landmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
}

export interface GestureResult {
  gesture: string;
  confidence: number;
  description: string;
}

// Landmark indices for hand pose (MediaPipe/TensorFlow hand model)
const LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
};

// Calculate distance between two landmarks
function distance(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Check if a finger is extended upward
function isFingerExtended(tipLandmark: HandLandmark, pipLandmark: HandLandmark): boolean {
  return tipLandmark.y < pipLandmark.y - 0.05;
}

// Check if a finger is folded/closed
function isFingerClosed(tipLandmark: HandLandmark, pipLandmark: HandLandmark): boolean {
  return Math.abs(tipLandmark.y - pipLandmark.y) < 0.05;
}

// Recognize "HI" gesture - open hand facing camera, all fingers extended
function recognizeHi(landmarks: HandLandmark[]): number {
  const thumbExtended = isFingerExtended(landmarks[LANDMARKS.THUMB_TIP], landmarks[LANDMARKS.THUMB_IP]);
  const indexExtended = isFingerExtended(landmarks[LANDMARKS.INDEX_TIP], landmarks[LANDMARKS.INDEX_PIP]);
  const middleExtended = isFingerExtended(landmarks[LANDMARKS.MIDDLE_TIP], landmarks[LANDMARKS.MIDDLE_PIP]);
  const ringExtended = isFingerExtended(landmarks[LANDMARKS.RING_TIP], landmarks[LANDMARKS.RING_PIP]);
  const pinkyExtended = isFingerExtended(landmarks[LANDMARKS.PINKY_TIP], landmarks[LANDMARKS.PINKY_PIP]);

  if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return 0.9;
  }
  return 0;
}

// Recognize "LOVE YOU" gesture - ILY sign
function recognizeLoveYou(landmarks: HandLandmark[]): number {
  const thumbExtended = isFingerExtended(landmarks[LANDMARKS.THUMB_TIP], landmarks[LANDMARKS.THUMB_IP]);
  const indexExtended = isFingerExtended(landmarks[LANDMARKS.INDEX_TIP], landmarks[LANDMARKS.INDEX_PIP]);
  const middleClosed = isFingerClosed(landmarks[LANDMARKS.MIDDLE_TIP], landmarks[LANDMARKS.MIDDLE_PIP]);
  const ringClosed = isFingerClosed(landmarks[LANDMARKS.RING_TIP], landmarks[LANDMARKS.RING_PIP]);
  const pinkyClosed = isFingerExtended(landmarks[LANDMARKS.PINKY_TIP], landmarks[LANDMARKS.PINKY_PIP]);

  if (thumbExtended && indexExtended && middleClosed && ringClosed && pinkyClosed) {
    return 0.85;
  }
  return 0;
}

// Recognize "HELP" gesture - open palm with wrist movement
function recognizeHelp(landmarks: HandLandmark[]): number {
  const indexExtended = isFingerExtended(landmarks[LANDMARKS.INDEX_TIP], landmarks[LANDMARKS.INDEX_PIP]);
  const middleExtended = isFingerExtended(landmarks[LANDMARKS.MIDDLE_TIP], landmarks[LANDMARKS.MIDDLE_PIP]);
  const ringExtended = isFingerExtended(landmarks[LANDMARKS.RING_TIP], landmarks[LANDMARKS.RING_PIP]);
  const pinkyExtended = isFingerExtended(landmarks[LANDMARKS.PINKY_TIP], landmarks[LANDMARKS.PINKY_PIP]);

  if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return 0.8;
  }
  return 0;
}

// Recognize "FOOD" gesture - fingers to mouth
function recognizeFood(landmarks: HandLandmark[]): number {
  const centerX = (landmarks[LANDMARKS.INDEX_TIP].x + 
                   landmarks[LANDMARKS.MIDDLE_TIP].x + 
                   landmarks[LANDMARKS.RING_TIP].x) / 3;
  const centerY = (landmarks[LANDMARKS.INDEX_TIP].y + 
                   landmarks[LANDMARKS.MIDDLE_TIP].y + 
                   landmarks[LANDMARKS.RING_TIP].y) / 3;

  // Check if hand is near the mouth area (upper-middle part of frame)
  if (centerY < 0.4 && centerX > 0.3 && centerX < 0.7) {
    return 0.75;
  }
  return 0;
}

// Recognize "EAT" gesture - similar to food but with different hand motion
function recognizeEat(landmarks: HandLandmark[]): number {
  const indexY = landmarks[LANDMARKS.INDEX_TIP].y;
  const middleY = landmarks[LANDMARKS.MIDDLE_TIP].y;
  const wristY = landmarks[LANDMARKS.WRIST].y;

  // Check if fingers are extended and moving toward mouth region
  if (indexY < 0.45 && middleY < 0.45 && wristY > indexY) {
    return 0.8;
  }
  return 0;
}

// Recognize "THANK YOU" gesture - both hands open, moving outward
function recognizeThankYou(landmarks: HandLandmark[]): number {
  const indexExtended = isFingerExtended(landmarks[LANDMARKS.INDEX_TIP], landmarks[LANDMARKS.INDEX_PIP]);
  const middleExtended = isFingerExtended(landmarks[LANDMARKS.MIDDLE_TIP], landmarks[LANDMARKS.MIDDLE_PIP]);

  if (indexExtended && middleExtended) {
    return 0.7;
  }
  return 0;
}

// Recognize "PEACE" / "OK" gesture - only index and middle extended
function recognizePeace(landmarks: HandLandmark[]): number {
  const indexExtended = isFingerExtended(landmarks[LANDMARKS.INDEX_TIP], landmarks[LANDMARKS.INDEX_PIP]);
  const middleExtended = isFingerExtended(landmarks[LANDMARKS.MIDDLE_TIP], landmarks[LANDMARKS.MIDDLE_PIP]);
  const ringClosed = isFingerClosed(landmarks[LANDMARKS.RING_TIP], landmarks[LANDMARKS.RING_PIP]);
  const pinkyClosed = isFingerClosed(landmarks[LANDMARKS.PINKY_TIP], landmarks[LANDMARKS.PINKY_PIP]);

  if (indexExtended && middleExtended && ringClosed && pinkyClosed) {
    return 0.85;
  }
  return 0;
}

// Recognize "THUMBS UP" gesture
function recognizeThumbsUp(landmarks: HandLandmark[]): number {
  const thumbExtended = isFingerExtended(landmarks[LANDMARKS.THUMB_TIP], landmarks[LANDMARKS.THUMB_IP]);
  const indexClosed = isFingerClosed(landmarks[LANDMARKS.INDEX_TIP], landmarks[LANDMARKS.WRIST]);
  
  if (thumbExtended && indexClosed) {
    return 0.8;
  }
  return 0;
}

// Recognize "FIST" / "PUNCH" gesture - all fingers closed
function recognizeFist(landmarks: HandLandmark[]): number {
  const indexClosed = isFingerClosed(landmarks[LANDMARKS.INDEX_TIP], landmarks[LANDMARKS.INDEX_MCP]);
  const middleClosed = isFingerClosed(landmarks[LANDMARKS.MIDDLE_TIP], landmarks[LANDMARKS.MIDDLE_MCP]);
  const ringClosed = isFingerClosed(landmarks[LANDMARKS.RING_TIP], landmarks[LANDMARKS.RING_MCP]);
  const pinkyClosed = isFingerClosed(landmarks[LANDMARKS.PINKY_TIP], landmarks[LANDMARKS.PINKY_MCP]);

  if (indexClosed && middleClosed && ringClosed && pinkyClosed) {
    return 0.8;
  }
  return 0;
}

// Main recognition function
export function recognizeGesture(handPose: HandPose | null): GestureResult | null {
  if (!handPose) {
    return null;
  }

  const landmarks = handPose.landmarks;
  const gestures: { [key: string]: { confidence: number; description: string } } = {
    HI: { confidence: recognizeHi(landmarks), description: "Waving hello with all fingers extended" },
    LOVE_YOU: { confidence: recognizeLoveYou(landmarks), description: "I Love You gesture (ILY sign)" },
    HELP: { confidence: recognizeHelp(landmarks), description: "Open hand asking for help" },
    FOOD: { confidence: recognizeFood(landmarks), description: "Hand pointing to mouth for food" },
    EAT: { confidence: recognizeEat(landmarks), description: "Eating gesture with hand motion" },
    THANK_YOU: { confidence: recognizeThankYou(landmarks), description: "Thank you gesture" },
    PEACE: { confidence: recognizePeace(landmarks), description: "Peace sign or victory gesture" },
    THUMBS_UP: { confidence: recognizeThumbsUp(landmarks), description: "Thumbs up gesture" },
    FIST: { confidence: recognizeFist(landmarks), description: "Closed fist" },
  };

  let maxConfidence = 0;
  let recognizedGesture = '';

  for (const [gesture, { confidence }] of Object.entries(gestures)) {
    if (confidence > maxConfidence) {
      maxConfidence = confidence;
      recognizedGesture = gesture;
    }
  }

  if (maxConfidence > 0.5) {
    return {
      gesture: recognizedGesture,
      confidence: maxConfidence,
      description: gestures[recognizedGesture].description,
    };
  }

  return null;
}

// Smooth gesture recognition - require consistent detection over time
export class GestureSmoother {
  private previousGestures: string[] = [];
  private windowSize = 5;

  updateGesture(gesture: string | null, confidence: number): string | null {
    if (gesture && confidence > 0.6) {
      this.previousGestures.push(gesture);
      if (this.previousGestures.length > this.windowSize) {
        this.previousGestures.shift();
      }

      // Check if most recent gestures are the same
      const recentGestures = this.previousGestures.slice(-3);
      const allSame = recentGestures.every(g => g === gesture);

      if (allSame) {
        return gesture;
      }
    } else {
      this.previousGestures = [];
    }

    return null;
  }
}
