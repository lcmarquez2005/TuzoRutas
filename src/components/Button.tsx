import React from 'react';
import { TouchableNativeFeedback, TouchableOpacity, View, Text, Platform } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary';
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  color = 'primary',
  onPress,
  children,
  disabled = false,
  className,
}) => {
  // 1. Lógica de colores centralizada
  const variants = {
    contained: {
      primary: 'bg-black',
      secondary: 'bg-gray-600',
    },
    outlined: {
      primary: 'border border-black bg-transparent',
      secondary: 'border border-gray-600 bg-transparent',
    },
    text: {
      primary: 'bg-transparent',
      secondary: 'bg-transparent',
    },
  };

  const textColors = {
    contained: 'text-white',
    outlined: color === 'primary' ? 'text-black' : 'text-gray-600',
    text: color === 'primary' ? 'text-black' : 'text-gray-600',
  };

  // 2. Clases del contenedor principal (Controla posición y bordes)
  const containerClasses = cn(
    'rounded-md overflow-hidden', // Importante para el ripple en Android
    disabled && 'opacity-50',
    className
  );

  // 3. Clases del contenido (Controla el diseño visual del botón)
  const contentClasses = cn(
    'px-4 py-2 items-center justify-center min-h-[44px] flex-row',
    variants[variant][color]
  );

  const textClasses = cn(
    'text-sm font-bold',
    textColors[variant],
    disabled && 'text-gray-400'
  );

  const isAndroid = Platform.OS === 'android';
  const Touchable = isAndroid ? TouchableNativeFeedback : TouchableOpacity;

  return (
    <View className={containerClasses}>
      <Touchable
        onPress={onPress}
        disabled={disabled}
        background={isAndroid ? TouchableNativeFeedback.Ripple('rgba(255, 255, 255, 0.3)', false) : undefined}
        activeOpacity={0.7}
      >
        {/* Este View interno es el que realmente "dibuja" el botón */}
        <View className={contentClasses}>
          <Text className={textClasses}>{children}</Text>
        </View>
      </Touchable>
    </View>
  );
};

export default Button;