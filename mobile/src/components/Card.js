import React from 'react';
import { View, StyleSheet } from 'react-native';

const Card = ({ children, style, variant = 'default' }) => {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevatedCard,
        variant === 'outlined' && styles.outlinedCard,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
  },
  elevatedCard: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default Card;

