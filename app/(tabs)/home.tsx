import { Text, View } from 'react-native';
import React from 'react';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 30 }}>Tela de Início (Home)</Text>
    </View>
  );
}