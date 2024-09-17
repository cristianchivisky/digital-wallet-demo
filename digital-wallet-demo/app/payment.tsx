import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastNotification from '../components/ToastNotification';

export default function Payment() {
  const router = useRouter();
  const { transactionId, amount } = useLocalSearchParams<{ transactionId: string; amount: string }>(); // Obtiene los parámetros de la URL
  const [isPaying, setIsPaying] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prevToast => ({ ...prevToast, visible: false }));
  };

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
      const response = await fetch('http://localhost:3000/process-payment', {
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