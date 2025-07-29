import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';

interface VideoPickerComponentProps {
  visible: boolean;
  onClose: () => void;
  onVideoSelected: (videoUri: string) => void;
  currentVideo?: string;
  title?: string;
}

const VideoPickerComponent: React.FC<VideoPickerComponentProps> = ({
  visible,
  onClose,
  onVideoSelected,
  currentVideo,
  title = "Add Video"
}) => {
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'We need camera and photo library permissions to let you add videos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const recordVideo = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60, // 60 seconds max
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onVideoSelected(result.assets[0].uri);
      onClose();
    }
  };

  const pickVideoFromGallery = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60, // 60 seconds max
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onVideoSelected(result.assets[0].uri);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.options}>
          {/* Camera Option */}
          <TouchableOpacity
            style={styles.option}
            onPress={recordVideo}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="videocam" size={40} color="#007AFF" />
            </View>
            <Text style={styles.optionTitle}>Record Video</Text>
            <Text style={styles.optionSubtitle}>Use your camera to record a video (max 60s)</Text>
          </TouchableOpacity>

          {/* Gallery Option */}
          <TouchableOpacity
            style={styles.option}
            onPress={pickVideoFromGallery}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="film" size={40} color="#007AFF" />
            </View>
            <Text style={styles.optionTitle}>Choose from Gallery</Text>
            <Text style={styles.optionSubtitle}>Select a video from your video library</Text>
          </TouchableOpacity>
        </View>

        {/* Current Video Preview */}
        {currentVideo && (
          <View style={styles.currentVideoPreview}>
            <Text style={styles.currentVideoLabel}>Current Video:</Text>
            <Video
              source={{ uri: currentVideo }}
              style={styles.currentVideoThumbnail}
              useNativeControls
              resizeMode="contain"
              shouldPlay={false}
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  options: {
    padding: 20,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  currentVideoPreview: {
    padding: 20,
    alignItems: 'center',
  },
  currentVideoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  currentVideoThumbnail: {
    width: 200,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default VideoPickerComponent; 