import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform  } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useApp } from '../hooks/appContext';

export default function Footer() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const router = useRouter();
  const { scanQRCode } = useApp();

  // Verifica si hay un token almacenado para determinar si el usuario está autenticado
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
    };
    checkAuthentication();
  }, []);

  // Función para redirigir a la pantalla principal
  const handleHome = () => {
    router.push('./home');
  };

  // Función para cerrar sesión, eliminando el token de almacenamiento y redirigiendo
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
          <TouchableOpacity style={styles.iconButton} onPress={handleHome}>
            <MaterialIcons name="home" size={30} color="#fff" />
          </TouchableOpacity>
          <View style={styles.scanButtonContainer}>
            <TouchableOpacity style={styles.scanButton} onPress={scanQRCode}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="qr-code-scanner" size={42} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.footerText}>
          <Text style={styles.text}>© 2024 Digital Wallet. All rights reserved.</Text>
        </View>
      )}
    </View>
  );
  };
  
  const styles = StyleSheet.create({
    footer: {
      backgroundColor: '#1F2937',
      paddingVertical: 12,
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
    iconButton: {
      width: 30, 
      zIndex: 1,
    },
    scanButtonContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 5,
      alignItems: 'center',
      zIndex: 0,
    },
    scanButton: {
      backgroundColor: '#007bff',
      borderRadius: 35,
      height: 70,
      width: 70,
      borderColor: '#fff',
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 0, // Eliminamos el padding
    },
    iconContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      backgroundColor: '#1F2937',
      paddingVertical: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 6,
      width: '100%',
      position: 'absolute',
      bottom: 0,
    },
    text: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '400',
      textAlign: 'center',
      letterSpacing: 0.5,
      paddingVertical: 8,
    },
  });