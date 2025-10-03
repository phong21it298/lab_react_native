import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CameraScreen from './CameraScreen';
import GalleryScreen from './GalleryScreen';
import EditScreen from './EditScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  Camera: undefined;
  Gallery: undefined;
  Edit: { note: Note };
};

export interface Note {
    path: string;
    caption: string;
    timestamp: number;
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Camera">
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen} 
          options={{ title: 'Chụp Ảnh Ghi Chú' }}
        />
        <Stack.Screen 
          name="Gallery" 
          component={GalleryScreen} 
          options={{ title: 'Gallery Ghi Chú' }}
        />
        <Stack.Screen // <<< THÊM: Màn hình Edit
          name="Edit" 
          component={EditScreen} 
          options={{ title: 'Chỉnh Sửa Ghi Chú' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}