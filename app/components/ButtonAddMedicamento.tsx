import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from "react";
import { Image, Pressable, StyleSheet } from "react-native";

type Props = {
  onPress?: () => void;
  imageSrc?: any; // optional image source
  accessibilityLabel?: string;
};

const ButtonAddMedicamento: React.FC<Props> = ({ onPress, imageSrc, accessibilityLabel = 'Adicionar medicamento' }) => {
  return (
    <Pressable
      style={styles.buttonAddMedicamento}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      {imageSrc ? (
        <Image source={imageSrc} style={styles.icon} resizeMode="cover" />
      ) : (
        <MaterialCommunityIcons name="plus" size={44} color="#fff" />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonAddMedicamento: {
    height: 72,
    width: 72,
    borderRadius: 36,
    backgroundColor: '#5CA498',
    alignItems: 'center',
    justifyContent: 'center',
    // Android shadow
    elevation: 12,
    // iOS shadow (more pronounced rounded shadow)
    shadowColor: 'rgba(0,0,0,0.34)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.34,
    shadowRadius: 12,
  },
  icon: {
    width: 44,
    height: 44,
  },
});

export default ButtonAddMedicamento;
