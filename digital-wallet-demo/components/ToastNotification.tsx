import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';

type ToastType = 'success' | 'danger';

interface ToastNotificationProps {
  message: string;
  type: ToastType;
  onHide: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type = 'success', onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2700),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => onHide());
  }, []);

  return (
    <Animated.View style={[styles.toast, styles[type], { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 50,
    left: '10%',
    right: '10%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
  success: {
    backgroundColor: 'green',
  },
  danger: {
    backgroundColor: 'red',
  },
});

export default ToastNotification;