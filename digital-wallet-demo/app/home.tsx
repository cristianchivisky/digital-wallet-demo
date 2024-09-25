import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastNotification from '../components/ToastNotification';

type ToastType = 'success' | 'danger';

export default function HomeScreen() {
  const router = useRouter();
  const [balance, setBalance] = useState(null);
  const [permission, requestPermission] = useCameraPermissions(); // Estado y permisos de la cámara
  const [scanned, setScanned] = useState(false); // Estado para gestionar si el código QR fue escaneado
  const [isCameraActive, setIsCameraActive] = useState(false); // Estado para activar o desactivar la cámara
  const [facing, setFacing] = useState<CameraType>('back'); // Estado para alternar la cámara entre frontal y trasera
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

  // useEffect para obtener el balance del usuario cuando el componente se monta
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Obtiene el token de autenticación almacenado en el dispositivo
        const token = await AsyncStorage.getItem('accessToken');
        // Realiza una solicitud para obtener el balance
        const response = await fetch('http://localhost:3000/balance', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Envía el token en el encabezado
          }
        });
        // Parsear los datos obtenidos
        const data = await response.json();
        setBalance(data.balance); // Actualiza el estado del balance
      } catch (error) {
        // Muestra un mensaje de error en caso de que falle la solicitud
        showToast(`Error fetching balance: ${error}`, 'danger');
      }
    };
    // Llama a la función que obtiene el balance
    fetchBalance();
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
    setIsCameraActive(false); // Desactiva la cámara
    try {
      const transactionDetails = JSON.parse(data); // Intenta parsear el QR a JSON
      // Redirige a la pantalla de pago con los detalles de la transacción obtenidos
      router.push({
        pathname: "./payment",
        params: {
          transactionId: transactionDetails.transactionId,
          amount: transactionDetails.amount,
        },
      });
    } catch (error) {
      // Si el QR no es válido, se muestra un mensaje de error
      showToast(`Invalid QR code: ${data}`, 'danger');
    }
  };

  // Función que se activa al presionar el botón para escanear un QR
  const handleScanQRCode = async () => {
    setIsCameraActive(true); // Activa la cámara
    setScanned(false); // Resetea el estado de escaneo
    try {
      const token = await AsyncStorage.getItem('accessToken');
      // Solicitud para generar un código QR con una cantidad fija (en este caso, 100)
      const response = await fetch(`http://localhost:3000/generate-qr?amount=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const qrData = await response.json(); // Parsear la respuesta de la API
      // Si la respuesta es exitosa, redirige a la pantalla de pago después de 5 segundos
      if (response.ok) {
        setTimeout(() => {
          setIsCameraActive(false); // Desactiva la cámara
          router.push({
            pathname: "./payment",
            params: {
              transactionId: qrData.transactionDetails.transactionId,
              amount: qrData.transactionDetails.amount,
            },
          });
        }, 5000);
      } else {
        // Si falla, muestra un mensaje de error
        showToast('Failed to generate QR code', 'danger');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      showToast('An error occurred while generating the QR code.', 'danger');
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
            facing={facing} // Define la dirección de la cámara (frontal o trasera)
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} 
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.buttonText}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Botón para activar el escaneo del código QR
        <TouchableOpacity style={styles.scanButton} onPress={handleScanQRCode}>
          <Text style={styles.scanButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
      )}
      {scanned && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={() => {
          setScanned(false); // Permite escanear de nuevo
          setIsCameraActive(true); // Activa la cámara
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
    marginBottom: 30,
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
  scanButton: {
    marginHorizontal: 20,
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    textAlign: 'center',
    paddingBottom: 10,
  },
});