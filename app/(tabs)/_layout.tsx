import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

// O "export default" é a parte mais importante
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: '#2f8b89', 
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tabs.Screen
        name="home" 
        options={{
          title: 'Início', 
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}