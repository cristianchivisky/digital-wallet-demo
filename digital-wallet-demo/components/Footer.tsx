import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useApp } from '../hooks/appContext';

export default function Footer() {
  const { isAuthenticated, setIsAuthenticated } = useAuth(); 
  const router = useRouter();
  const { scanQRCode } = useApp();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
    };
    checkAuthentication();
  }, []);

  const handleHome = () => {
    router.push('./home');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('userData');
    setIsAuthenticated(false);
    router.push('./');
  };

  return (
    <View>
      {isAuthenticated ? (
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleHome}>
            <MaterialIcons name="home" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.scanButton} onPress={scanQRCode}>
            <MaterialIcons name="qr-code-scanner" size={42} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <MaterialIcons name="logout" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Digital Wallet. All rights reserved.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#1F2937',
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  scanButton: {
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    height: 80,
    width: 80,
    position: 'absolute',
    left: '50%',
    marginLeft: -40,
    bottom: 17,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.5,
    paddingVertical: 10, 
  },
});
