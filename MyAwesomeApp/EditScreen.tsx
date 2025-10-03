import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    Image, 
    Button, 
    Alert, 
    Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Note } from './App'; // Import Note và RootStackParamList từ App

type EditScreenProps = NativeStackScreenProps<RootStackParamList, 'Edit'>;

const { width } = Dimensions.get('window');
const STORAGE_KEY = '@camera_notes';

export default function EditScreen({ route, navigation }: EditScreenProps) {
    // Lấy đối tượng note cần sửa từ route params
    const { note: initialNote } = route.params; 

    // State để lưu caption đang được chỉnh sửa
    const [caption, setCaption] = useState(initialNote.caption);

    // Hàm xử lý lưu thay đổi
    const handleSaveEdit = async () => {
        if (caption.trim() === '') {
            Alert.alert('Lỗi', 'Ghi chú không được để trống!');
            return;
        }

        try {
            const existingNotesString = await AsyncStorage.getItem(STORAGE_KEY);
            const existingNotes: Note[] = existingNotesString ? JSON.parse(existingNotesString) : [];

            // Tạo mảng mới bằng cách cập nhật ghi chú có cùng 'path'
            const updatedNotes = existingNotes.map(note => {
                if (note.path === initialNote.path) {
                    // Nếu path trùng, cập nhật caption và timestamp
                    return { ...note, caption: caption.trim(), timestamp: Date.now() };
                }
                return note;
            });

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));

            Alert.alert('Thành công', 'Đã cập nhật ghi chú!');
            // Trở về màn hình Gallery
            navigation.goBack(); 

        } catch (error) {
            console.error("Lỗi khi cập nhật ghi chú: ", error);
            Alert.alert('Lỗi', 'Cập nhật thất bại!');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chỉnh Sửa Ghi Chú</Text>
            <Image source={{ uri: initialNote.path }} style={styles.previewImage} /> 
            <TextInput
                style={styles.input}
                placeholder="Nhập ghi chú mới tại đây..."
                value={caption}
                onChangeText={setCaption}
                multiline
            />
            <View style={styles.buttonRow}>
                <Button title="Lưu Thay Đổi" onPress={handleSaveEdit} />
                <Button title="Hủy" onPress={() => navigation.goBack()} color="#7f8c8d" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
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