import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/authContext';
import { validateInputs } from '../utils/validateInputs';
import ToastNotification from '../components/ToastNotification';

type ToastType = 'success' | 'danger';

export default function AuthScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Estado para alternar entre login y registro
  const { setIsAuthenticated, setUser } = useAuth(); // Contexto para gestionar el estado de autenticación
  const baseUrl = process.env.EXPO_PUBLIC_NGROK_URL || 'http://localhost:3000';
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });
  
  // Verificar autenticación al montar el componente
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        // Si el token existe, redirige a la pantalla principal
        setIsAuthenticated(true);
        router.replace('./home');
      }
    };

    checkAuthStatus();
  }, []);

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prevToast => ({ ...prevToast, visible: false }));
  };

  // Función para manejar el login
  const handleLogin = async () => {
    // Validar entradas antes de proceder
    const error = validateInputs({ username, password });
    if (error) {
      showToast(error, 'danger');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Guardar el token de acceso en AsyncStorage y cambiar el estado de autenticación
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('userData', username);
        setIsAuthenticated(true);
        setUser(username)
        router.push('./home'); // Redirigir a la pantalla principal
      } else {
        showToast(data.message || 'Login failed. Please try again.', 'danger');
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el registro de usuarios
  const handleRegister = async () => {
    // Validar entradas antes de proceder
    const error = validateInputs({ username, password });
    if (error) {
      showToast(error, 'danger');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'danger');
      return;
    }
    setIsLoading(true);
    const balance = 10000; // Establecer un balance inicial para el nuevo usuario
    try {
      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, balance }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast('Registration successful!', 'success');
        setIsRegistering(false); // Cambiar a modo de login tras el registro exitoso
      } else {
        showToast(data.message || 'Registration failed. Please try again.', 'danger');
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        keyboardType="default"
        autoCapitalize="none"
        maxLength={30}
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        maxLength={30}
        placeholderTextColor="#aaa"
      />
      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          maxLength={30}
          placeholderTextColor="#aaa"
        />
      )}
      {!isRegistering && (
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin} // Ejecutar la función de login al presionar el botón
          disabled={isLoading} // Desactivar el botón si está cargando
        >
          <Text style={styles.buttonText}>{isLoading ? 'Processing...' : 'Login'}</Text>
        </TouchableOpacity>
      )}
      {isRegistering ? (
        <>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister} // Ejecutar la función de registro al presionar el botón
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Processing...' : 'Register'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setIsRegistering(false)} // Volver al modo de login
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setIsRegistering(true)} // Cambiar al modo de registro
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Register</Text>
        </TouchableOpacity>
      )}
      {toast.visible && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#b3d7ff',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderColor: '#007bff',
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
});