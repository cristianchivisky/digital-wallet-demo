import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, ScrollView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastNotification from '../components/ToastNotification';
import { useApp } from '../hooks/appContext';
import { useAuth } from '../hooks/authContext';
import { jwtDecode } from 'jwt-decode';

type ToastType = 'success' | 'danger';
interface Payment {
  paymentId: string;
  transactionId: string;
  amount: string; 
  timestamp: string; 
}

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [balance, setBalance] = useState(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [permission, requestPermission] = useCameraPermissions(); // Estado y permisos de la cámara
  const [scanned, setScanned] = useState(false); // Estado para gestionar si el código QR fue escaneado
  const [isCameraActive, setIsCameraActive] = useState(false); // Estado para activar o desactivar la cámara
  const [facing, setFacing] = useState<CameraType>('back'); // Estado para alternar la cámara entre frontal y trasera
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });
  const { setScanQRCode } = useApp();

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prevToast => ({ ...prevToast, visible: false }));
  };

  // Verifica si el token existe y no ha expirado
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

  // Función que se activa al presionar el botón para escanear un QR
  const handleScanQRCode = async () => {
    setIsCameraActive(true); // Activa la cámara
    setScanned(false); // Resetea el estado de escaneo
    try {
      const token = await AsyncStorage.getItem('accessToken');
      // Solicitud para generar un código QR con una cantidad fija (random)
      const amount = Math.floor(Math.random() * 1000); // Genera un número aleatorio entre 0 y 999
      const response = await fetch(`http://localhost:3000/generate-qr?amount=${amount}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const qrData = await response.json(); // Parsear la respuesta de la API
      // Si la respuesta es exitosa muestra el QR en la terminal
      if (response.ok) {
        console.log('QR Code Data:', qrData);
        // redirige a la pantalla de pago con los datos del QR después de 8 segundos
        // esto está así porque lo deasarrolle usando la web y no pude escanear el QR
        // aunque sí lo probé desde Expo Go y funciona todo correctamente 
        // esta parte del código se debería quitar en producción
        setTimeout(() => {
          setIsCameraActive(false);
          router.push({
            pathname: "./payment",
            params: {
              transactionId: qrData.transactionDetails.transactionId,
              amount: qrData.transactionDetails.amount,
            },
          });
        }, 8000);
      } else {
        showToast('Failed to generate QR code', 'danger');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      showToast('An error occurred while generating the QR code.', 'danger');
    }
  };

  // useEffect para obtener el balance del usuario y los pagos cuando el componente se monta
  useEffect(() => {
    setScanQRCode(() => handleScanQRCode);
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        // Obtiene el balance
        const balanceResponse = await fetch('http://localhost:3000/balance', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const balanceData = await balanceResponse.json();
        setBalance(balanceData.balance);
        // Oredena los pagos por fecha
        const sortedPayments = balanceData.payments.sort((a: Payment, b: Payment) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB.getTime() - dateA.getTime();
        });
        setPayments(sortedPayments);
      } catch (error) {
        showToast(`Error fetching data: ${error}`, 'danger');
      }
    };

    fetchData();
  }, []);

  // Si los permisos de la cámara aún no están disponibles, no se muestra nada
  if (!permission) {
    return <View />;
  }

  // Si no se han otorgado los permisos de la cámara, se solicita permiso al usuario
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  // Función para alternar entre las cámaras frontal y trasera
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Función que maneja el escaneo del código de barras o QR
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true); // Indica que el código fue escaneado
    setIsCameraActive(false); 
    try {
      const transactionDetails = JSON.parse(data); // Intenta parsear el QR a JSON
      router.push({
        pathname: "./payment",
        params: {
          transactionId: transactionDetails.transactionId,
          amount: transactionDetails.amount,
        },
      });
    } catch (error) {
      showToast(`Invalid QR code: ${data}`, 'danger');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>Current Balance: ${balance}</Text>
      </View>
      
      {isCameraActive ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera} 
            facing={facing}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} 
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.buttonText}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
            <View style={styles.paymentsContainer}>
              <Text style={styles.paymentsTitle}>Payments:</Text>
              {payments.length === 0 ? (
                <Text style={styles.paymentText}>No payments made yet</Text>
              ) : (
                <FlatList
                  data={payments}
                  keyExtractor={item => item.paymentId}
                  renderItem={({ item }) => (
                    <View style={styles.paymentCard}>
                      <Text style={styles.paymentText}>Transaction ID: {item.transactionId}</Text>
                      <Text style={styles.paymentText}>Amount: ${item.amount}</Text>
                      <Text style={styles.paymentText}>Date: {new Date(item.timestamp).toLocaleString()}</Text> {/* Mejora la visibilidad de la fecha */}
                    </View>
                  )}
                />
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {scanned && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={() => {
          setScanned(false);
          setIsCameraActive(true);
        }}>
          <Text style={styles.scanAgainButtonText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}

      {toast.visible && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 100,
    marginHorizontal: 30,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonScannContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 85,

  },
  scanButton: {
    position: 'absolute',
    borderRadius: 50,
    
    backgroundColor: '#007bff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  scanAgainButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  scanAgainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  paymentsContainer: {
    paddingHorizontal: 20,
  },
  paymentsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  paymentText: {
    fontSize: 16,
  },
});