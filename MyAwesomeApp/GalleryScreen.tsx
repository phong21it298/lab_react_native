import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';

// SỬA LỖI 1: Import các kiểu dữ liệu Navigation và Note từ App
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Note } from './App'; 

// SỬA LỖI 2: Định nghĩa kiểu Props cho màn hình Gallery
type GalleryScreenProps = NativeStackScreenProps<RootStackParamList, 'Gallery'>;

const STORAGE_KEY = '@camera_notes';

export default function GalleryScreen({ navigation }: GalleryScreenProps) { // <<< Áp dụng kiểu đã định nghĩa
    // Khai báo rõ ràng notes là một mảng các Note
    const [notes, setNotes] = useState<Note[]>([]);

    // 1. Hàm tải ghi chú từ AsyncStorage
    const loadNotes = async () => {
        try {
        const storedNotes = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedNotes) {
                // Định kiểu cho a và b
                const parsedNotes: Note[] = JSON.parse(storedNotes)
                    .sort((a: Note, b: Note) => b.timestamp - a.timestamp); 
                setNotes(parsedNotes);
            } else {
             setNotes([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải ghi chú: ", error);
        }
    };

    // Tải lại dữ liệu mỗi khi màn hình được Focus
    useFocusEffect(
        useCallback(() => {
            loadNotes();
        }, [])
    );
    
    // Hàm xử lý khi nhấn Sửa (Dùng navigation prop đã được định kiểu)
    const handleEdit = (noteToEdit: Note) => {
        navigation.navigate('Edit', { note: noteToEdit }); 
    };

    // 2. Hàm xóa ghi chú (Mở rộng)
    // Định kiểu cho noteToDelete
     const deleteNote = (noteToDelete: Note) => {
        Alert.alert(
            "Xác nhận Xóa",
            "Bạn có chắc muốn xóa ghi chú này?",
            [
                { text: "Hủy", style: "cancel" },
                { 
                    text: "Xóa", 
                    onPress: async () => {
                        try {
                            // Xóa file ảnh khỏi hệ thống tệp
                            await FileSystem.deleteAsync(noteToDelete.path, { idempotent: true });

                            // notes đã là Note[], TypeScript tự suy luận.
                            const newNotes = notes.filter(note => note.path !== noteToDelete.path);
                            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
                            
                            // Cập nhật State
                            setNotes(newNotes); 
                            alert("Đã xóa thành công!");
                        } catch (error) {
                            console.error("Lỗi khi xóa ghi chú: ", error);
                            alert("Xóa thất bại!");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // 3. Render từng item
    // Định kiểu cho item
    const renderItem = ({ item }: { item: Note }) => (
        <View style={styles.noteCard}>
            <Image source={{ uri: item.path }} style={styles.image} />
            <Text style={styles.caption}>{item.caption}</Text>
            <View style={styles.buttonRow}> 
                <Button title="Sửa" onPress={() => handleEdit(item)} color="#f39c12" />
                <Button title="Xóa" onPress={() => deleteNote(item)} color="#c0392b" />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {notes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>🖼️ Gallery trống.</Text>
                    <Text style={styles.emptyText}>Hãy quay lại màn hình Camera để chụp ảnh và ghi chú!</Text>
                </View>
            ) : (
                <FlatList
                    data={notes}
                    renderItem={renderItem}
                    keyExtractor={item => item.path}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        paddingHorizontal: 10,
    },
    noteCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 15,
        padding: 10,
        alignItems: 'center',
        elevation: 3, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 6,
        marginBottom: 10,
        resizeMode: 'cover',
    },
    caption: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#7f8c8d',
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 5,
    }
});