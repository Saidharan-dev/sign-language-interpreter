import { CameraComponent } from '@/components/CameraComponent';
import { StyleSheet } from 'react-native';

export default function Index() {
  return <CameraComponent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
