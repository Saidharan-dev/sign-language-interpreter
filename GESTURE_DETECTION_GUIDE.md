# Sign Language Gesture Recognition Prototype

A real-time hand gesture detection system for sign language interpretation built with React Native, Expo, and TensorFlow.js.

## Features

✨ **Real-time Hand Detection** - Uses MediaPipe hand pose estimation to detect hand landmarks  
🎯 **Gesture Recognition** - Recognizes 9 common hand gestures from sign language  
📊 **FPS Display** - Shows real-time performance metrics  
📜 **Gesture History** - Displays recently recognized gestures  
🎨 **Beautiful UI** - Clean, intuitive interface showing detection results  

## Supported Gestures

1. **HI** ✋ - All fingers extended upward
2. **LOVE YOU** ❤️ - Index, thumb, and pinky extended (ILY sign)
3. **HELP** 🙏 - Open palm facing forward
4. **FOOD** 🍽️ - Hand positioned near mouth area
5. **EAT** 🥄 - Fingers extended pointing toward mouth
6. **THANK YOU** 🙌 - Open hands
7. **PEACE** ✌️ - Index and middle finger extended (V sign)
8. **THUMBS UP** 👍 - Thumb extended upward
9. **FIST** ✊ - All fingers closed

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI installed globally

### Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install required packages (if not already done):**
   ```bash
   npm install expo-camera @tensorflow/tfjs @tensorflow-models/hand-pose-detection
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your device:**
   - For Android: Press `a` in the terminal or scan QR code with Android device
   - For iOS: Press `i` in the terminal or scan QR code with iOS device
   - For Web: Press `w` in the terminal

## Project Structure

```
sign-language-interpreter/
├── app/
│   ├── _layout.tsx          # Root layout with navigation
│   └── index.tsx            # Main app screen
├── components/
│   └── CameraComponent.tsx  # Camera and gesture detection component
├── utils/
│   └── gestureRecognizer.ts # Gesture recognition logic
├── app.json                 # Expo configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
```

## How It Works

### 1. Camera Integration
- Uses `expo-camera` to access device camera
- Front-facing camera for real-time hand detection
- Processes frames continuously

### 2. Hand Detection
- Powered by **MediaPipe Hand Pose** model
- Detects 21 hand landmarks in 3D space
- Runs efficiently on mobile devices

### 3. Gesture Recognition
- Analyzes relationships between hand landmarks
- Checks finger extension states
- Calculates distances and angles
- Maps to predefined gestures

### 4. Smoothing
- Uses temporal smoothing to reduce false positives
- Requires consistent gesture detection over 3-5 frames
- Confidence threshold at 0.6+

## Architecture

### GestureRecognizer.ts
Contains gesture recognition logic with individual detection functions:
- Analyzes finger positions and extensions
- Calculates distances between landmarks
- Returns confidence scores for each gesture

### CameraComponent.tsx
Main component features:
- TensorFlow.js + MediaPipe initialization
- Frame processing loop
- Gesture smoothing with temporal filtering
- UI display with FPS counter
- Gesture history tracking

## Performance Optimization

- **FPS Counter** - Real-time performance monitoring
- **Frame Skipping** - Processes every frame but updates UI less frequently
- **Model Caching** - Hand pose model loaded once and reused
- **Temporal Smoothing** - Prevents flickering between gestures

## Customization

### Adding New Gestures

Edit `utils/gestureRecognizer.ts`:

```typescript
function recognizeNewGesture(landmarks: HandLandmark[]): number {
  // Your gesture detection logic
  // Return confidence (0-1)
}
```

Then add to the `recognizeGesture` function:
```typescript
NEW_GESTURE: { 
  confidence: recognizeNewGesture(landmarks), 
  description: "Description" 
}
```

### Adjusting Sensitivity

In `CameraComponent.tsx`, modify the confidence threshold:
```typescript
if (result && result.confidence > 0.6) { // Change 0.6 to your desired value
  // ...
}
```

### Changing Camera
In `CameraComponent.tsx`, change:
```typescript
facing="front"  // Use "back" for rear camera
```

## Troubleshooting

### Camera Not Working
- Check camera permissions are granted
- Verify `app.json` has proper permission configs
- Restart the app

### No Gestures Detected
- Ensure good lighting conditions
- Keep hand fully visible in camera frame
- Make clear, deliberate hand gestures

### App Crashes
- Check console for TensorFlow errors
- Ensure sufficient device memory
- Try running on different device/simulator

### Low FPS
- Reduce resolution in camera settings
- Close background apps
- Use a physical device instead of emulator

## Future Enhancements

- [ ] Support for two-hand gestures
- [ ] Add more sign language gestures
- [ ] Voice output feedback
- [ ] Save gesture sequences
- [ ] Training mode for custom gestures
- [ ] Multi-language support
- [ ] Offline mode (local model)
- [ ] Performance profiling dashboard

## Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform
- **TensorFlow.js** - Machine learning framework
- **MediaPipe** - Hand pose detection model
- **TypeScript** - Type-safe development
- **Reanimated** - Smooth animations

## Performance Metrics

- **Gesture Detection Speed** - ~50-100ms per frame
- **Model Load Time** - ~2-3 seconds
- **Average FPS** - 20-30 FPS depending on device

## License

MIT

## Contributing

Contributions are welcome! Please feel free to improve:
- Add more gestures
- Optimize performance
- Improve UI/UX
- Add features

## Support

For issues, questions, or comments, please open an issue in the repository.

---

**Happy Gesture Detecting! 🎉**
