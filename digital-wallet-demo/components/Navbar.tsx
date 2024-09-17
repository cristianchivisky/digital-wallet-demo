import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/authContext';

export default function Navbar() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
    };
    checkAuthentication();
  }, []);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleHome = () => {
    setIsMenuVisible(false);
    router.push('./home');
  };

  const handleLogout = async () => {
    setIsMenuVisible(false);
    await AsyncStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    router.push('./');
  };

  return (
    <View>
      <View style={styles.navbar}>
        {isAuthenticated && (
          <TouchableOpacity onPress={toggleMenu}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Digital Wallet</Text>
        <TouchableOpacity onPress={toggleModal}>
          <AntDesign name="infocirlceo" size={27} color="#fff" />
        </TouchableOpacity>
      </View>
      {isMenuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}  onPress={handleHome}>
            <MaterialIcons name="home" size={24} color="#fff" />
            <Text style={styles.menuText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#fff" />
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>App Information</Text>
            <Text style={styles.modalText}>
              This is the Digital Wallet app, designed to facilitate fast and secure payments using QR codes.
              Version 1.0.0.
            </Text>
            <Button title="Close" onPress={toggleModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#1F2937',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  menu: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: 200,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  menuText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});
