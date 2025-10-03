import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Button, 
    Dimensions, 
    TextInput, 
    Image, 
    Alert 
} from 'react-native';
import { 
    CameraView, 
    useCameraPermissions, 
    CameraCapturedPicture 
} from 'expo-camera'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy'; 

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './App'; 

// Định nghĩa kiểu dữ liệu cho ghi chú (Để tăng tính Type Safety)
interface Note {
    path: string;
    caption: string;
    timestamp: number;
}

type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'Camera'>;

const { width } = Dimensions.get('window');
const STORAGE_KEY = '@camera_notes';

export default function CameraScreen({ navigation }: CameraScreenProps) { 
    const [permission, requestPermission] = useCameraPermissions();
    const [isRecording, setIsRecording] = useState(false);
    const [photoPath, setPhotoPath] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const cameraRef = useRef<CameraView>(null); 

    useEffect(() => {
        if (!permission || !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleTakePhoto = async () => {
        if (cameraRef.current) {
            const photo: CameraCapturedPicture = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                skipProcessing: true, 
            });
            setPhotoPath(photo.uri);
            setIsRecording(true);
        }
    };

    const saveNote = async () => {
        if (!photoPath || caption.trim() === '') {
            Alert.alert('Lỗi', 'Vui lòng nhập ghi chú!');
            return;
        }

        try {
            //Ép kiểu để báo cho TypeScript rằng documentDirectory là một string
            const fs: any = FileSystem;
            const docDir = fs.documentDirectory;
            
            const newPath = docDir + `photos/${Date.now()}.jpg`;
            
            await FileSystem.makeDirectoryAsync(docDir + 'photos/', { intermediates: true });
            
            await FileSystem.moveAsync({
                from: photoPath,
                to: newPath,
            });

            // Sử dụng kiểu Note đã định nghĩa
            const newNote: Note = { path: newPath, caption: caption.trim(), timestamp: Date.now() };
            const existingNotes = await AsyncStorage.getItem(STORAGE_KEY);
            // Định kiểu cho notes là Note[]
            const notes: Note[] = existingNotes ? JSON.parse(existingNotes) : [];
            
            notes.push(newNote);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));

            Alert.alert('Thành công', 'Đã lưu ghi chú thành công!');
            
            setPhotoPath(null);
            setCaption('');
            setIsRecording(false);
            navigation.navigate('Gallery');

        } catch (error) {
            console.error("Lỗi khi lưu ghi chú: ", error);
            Alert.alert('Lỗi', 'Lưu thất bại! Kiểm tra console log.');
        }
    };
    
    // ... (Xử lý quyền và JSX) ...
    if (!permission) {
        return <View style={styles.loadingContainer}><Text>Đang tải quyền...</Text></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ textAlign: 'center' }}>Chúng tôi cần quyền truy cập camera để tiếp tục!</Text>
                <Button onPress={requestPermission} title="Cấp quyền" />
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            {isRecording && photoPath ? (
                <View style={styles.noteContainer}>
                    <Text style={styles.title}>Thêm Ghi chú</Text>
                    <Image source={{ uri: photoPath }} style={styles.previewImage} /> 
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập ghi chú tại đây..."
                        value={caption}
                        onChangeText={setCaption}
                        multiline
                    />
                    <View style={styles.buttonRow}>
                        <Button title="Lưu Ghi chú" onPress={saveNote} />
                        <Button title="Chụp lại" onPress={() => { setPhotoPath(null); setCaption(''); setIsRecording(false); }} color="#e74c3c" />
                    </View>
                </View>
            ) : (
                <CameraView style={styles.camera} facing={'back'} ref={cameraRef}> 
                    <View style={styles.buttonContainer}>
                        <Button title="CHỤP 📸" onPress={handleTakePhoto} color="#2ecc71" />
                        <Button title="Xem Gallery" onPress={() => navigation.navigate('Gallery')} color="#3498db" />
                    </View>
                </CameraView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    buttonContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
    noteContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    previewImage: {
        width: width * 0.9, 
        height: width * 0.9, 
        resizeMode: 'cover',
        borderRadius: 8,
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        width: '100%',
        padding: 10,
        minHeight: 80,
        marginBottom: 15,
        borderRadius: 5,
        textAlignVertical: 'top', 
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    }
});