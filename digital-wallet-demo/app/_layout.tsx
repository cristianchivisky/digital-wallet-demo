import React from 'react';
import { Stack } from "expo-router";
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthProvider } from '../hooks/authContext';
import { AppProvider } from '../hooks/appContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <View style={styles.container}>
          <Navbar />
          <View style={styles.content}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ title: 'Login' }} />
              <Stack.Screen name="home" options={{ title: 'Digital Wallet' }} />
              <Stack.Screen name="payment" options={{ title: 'Payment Details' }} />
            </Stack>
          </View>
          <Footer/>
        </View>
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  }
});