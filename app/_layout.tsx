import { Stack } from 'expo-router';
import React from 'react';


export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Pílula+ | Login', 
        }}
      />
      <Stack.Screen
        name="cadastro"
        options={{
          title: 'Pílula+ | Cadastro', 
        }}
      />
      <Stack.Screen
        name="redefinirSenha"
        options={{
          title: 'Pílula+ | Recuperar Senha', 
        }}
      />


      <Stack.Screen 
        name="(tabs)"
        options={{
          title: 'Pílula+',
        }}
      />
      
    </Stack>
  );
}