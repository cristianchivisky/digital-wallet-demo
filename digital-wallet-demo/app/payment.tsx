import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastNotification from '../components/ToastNotification';
import { Ionicons } from '@expo/vector-icons'; 
import { useAuth } from '../hooks/authContext';
import { jwtDecode } from 'jwt-decode';

type ToastType = 'success' | 'danger';

export default function Payment() {
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const { transactionId, amount } = useLocalSearchParams<{ transactionId: string; amount: string }>(); // Obtiene los parámetros de la URL
  const [isPaying, setIsPaying] = useState(false);
  const baseUrl = process.env.EXPO_PUBLIC_NGROK_URL || 'http://localhost:3000';
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prevToast => ({ ...prevToast, visible: false }));
  };

  // Verifica si el token es válido y no ha expirado
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          // Si no hay token, redirigir al usuario a /index
          setIsAuthenticated(false);
          router.push('./');
        } else {
          // Decodificar el token para verificar si ha expirado
          const decoded: { exp: number } = jwtDecode(token);
          if (decoded.exp < Date.now() / 1000) {
            // Si el token ha expirado, redirigir al usuario a /index
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('userData');
            setIsAuthenticated(false);
            router.push('./');
          }
        }
      } catch (error) {
        console.error('Error checking login:', error);
      }
    };

    checkLogin();
  }, [router]);

  // Función para manejar el proceso de pago
  const handlePayment = async () => {
    // Verifica si los detalles de la transacción son válidos
    if (!transactionId || !amount) {
      showToast('Invalid transaction details', 'danger');
      return;
    }
    // Indica que se está procesando el pago
    setIsPaying(true);
    try {
      // Recupera el token de acceso desde AsyncStorage
      const token = await AsyncStorage.getItem('accessToken');
      // Realiza la solicitud para procesar el pago
      const response = await fetch(`${baseUrl}/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId,
        }),
      });
      // Lanza un error si la respuesta no es exitosa
      if (!response.ok) {
        throw new Error('Payment failed');
      }
      const result = await response.json();
      // Muestra un mensaje de éxito con el nuevo balance
      showToast('Payment successful!', 'success');
      // Redirige al usuario a la pantalla principal
      setTimeout(() => {
        router.push('./home');
      }, 2000);
    } catch (error) {
      // Muestra un mensaje de error en caso de fallo
      showToast('Payment error', 'danger');
    } finally {
      // Finaliza el estado de carga
      setIsPaying(false);
    }
  };

  // Si los detalles de la transacción no están disponibles, muestra un indicador de carga
  if (!transactionId || !amount) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('./home')}>
        <Ionicons name="arrow-back" size={30} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Payment Details</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Transaction ID: {transactionId}</Text>
        <Text style={styles.detailText}>Amount: ${amount}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.button, isPaying && styles.buttonDisabled]} 
        onPress={handlePayment} 
        disabled={isPaying}
      >
        <Text style={styles.buttonText}>{isPaying ? 'Processing...' : 'Confirm Payment'}</Text>
      </TouchableOpacity>
      {isPaying && <ActivityIndicator style={styles.loader} size="large" color="#007bff" />}
      {toast.visible && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  detailText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
});
